import { createRequestHandler } from "react-router";

import { isImageType } from "../app/lib/format";

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

/** 게시글 첨부는 React 문서 응답으로 감싸지 않고 R2 본문을 그대로 보낸다. */
async function serveObject(env: Env, key: string) {
	if (!key.startsWith("posts/")) {
		return new Response("파일을 찾을 수 없습니다.", { status: 404 });
	}

	const object = await env.MY_BUCKET.get(key);
	if (!object) return new Response("파일을 찾을 수 없습니다.", { status: 404 });

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	headers.set("cache-control", "public, max-age=3600");
	const contentType = object.httpMetadata?.contentType ?? "application/octet-stream";
	const name = object.customMetadata?.originalName ?? "download";
	if (!isImageType(contentType)) {
		headers.set("content-disposition", `attachment; filename*=UTF-8''${encodeURIComponent(name)}`);
	}

	return new Response(object.body, { headers });
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		if (url.pathname.startsWith("/files/")) {
			const key = decodeURIComponent(url.pathname.slice("/files/".length));
			return serveObject(env, key);
		}
		return requestHandler(request);
	},
} satisfies ExportedHandler<Env>;
