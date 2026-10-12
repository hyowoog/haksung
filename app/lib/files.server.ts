import { env } from "cloudflare:workers";

const ALLOWED_TYPES: Record<string, string> = {
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	gif: "image/gif",
	webp: "image/webp",
	pdf: "application/pdf",
	doc: "application/msword",
	docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	hwp: "application/x-hwp",
	zip: "application/zip",
};

const MAX_BYTES = 8 * 1024 * 1024;

/** 확장자를 허용 목록과 맞춰 R2에 올리고 저장 정보를 돌려준다. */
export async function storeUpload(postId: number, file: File) {
	if (file.size <= 0) return null;
	if (file.size > MAX_BYTES) {
		throw new Error("첨부파일은 8MB 이하만 올릴 수 있습니다.");
	}

	const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
	const contentType = ALLOWED_TYPES[extension];
	if (!contentType) {
		throw new Error("jpg, png, gif, webp, pdf, doc, docx, hwp, zip 파일만 첨부할 수 있습니다.");
	}

	const key = `posts/${postId}/${crypto.randomUUID()}.${extension}`;
	await env.MY_BUCKET.put(key, file.stream(), {
		httpMetadata: { contentType },
		customMetadata: { originalName: file.name },
	});

	return {
		originalName: file.name,
		r2Key: key,
		size: file.size,
		contentType,
	};
}

export async function deleteObject(key: string) {
	await env.MY_BUCKET.delete(key);
}
