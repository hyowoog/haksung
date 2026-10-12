import { eq, sql } from "drizzle-orm";
import { Form, Link, redirect } from "react-router";

import type { Route } from "./+types/board-post";
import { Subpage } from "../components/subpage";
import { getDb } from "../db/client.server";
import { posts } from "../db/schema";
import { formatBytes, formatDate, isImageType, pageMeta } from "../lib/format";
import { addComment, loadPost } from "../lib/posts.server";

export function meta({}: Route.MetaArgs) {
	return pageMeta("게시글");
}

export async function loader({ params }: Route.LoaderArgs) {
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw new Response("글을 찾을 수 없습니다.", { status: 404 });
	const loaded = await loadPost(id);
	if (!loaded.board || loaded.board.slug !== params.slug) {
		throw new Response("글을 찾을 수 없습니다.", { status: 404 });
	}
	await getDb()
		.update(posts)
		.set({ hit: sql`${posts.hit} + 1` })
		.where(eq(posts.id, id));
	return { ...loaded, post: { ...loaded.post, hit: loaded.post.hit + 1 } };
}

export async function action({ request, params }: Route.ActionArgs) {
	const id = Number(params.id);
	const formData = await request.formData();
	const intent = String(formData.get("intent") ?? "");
	if (intent !== "comment") return { error: "요청을 처리할 수 없습니다." };

	try {
		await addComment(id, formData);
	} catch (error) {
		const message = error instanceof Error ? error.message : "댓글을 저장하지 못했습니다.";
		return { error: message };
	}

	return redirect(`/board/${params.slug}/${id}`);
}

export default function BoardPost({ loaderData, actionData }: Route.ComponentProps) {
	const { post, board, files, replies } = loaderData;
	if (!board) return null;

	return (
		<Subpage section="community" title={board.name}>
			<header className="border-b border-slate-200 pb-4">
				<h2 className="text-xl">{post.title}</h2>
				<p className="mt-2 text-sm text-slate-500">
					{post.author} · {formatDate(post.createdAt)} · 조회 {post.hit}
				</p>
			</header>
			<div className="whitespace-pre-wrap py-6 text-sm leading-7">{post.content}</div>
			{files.length > 0 ? (
				<ul className="space-y-3 border-t border-slate-200 pt-4 text-sm">
					{files.map((file) => (
						<li key={file.id}>
							{isImageType(file.contentType) ? (
								<img src={`/files/${file.r2Key}`} alt={file.originalName} className="max-h-[480px] rounded border" />
							) : null}
							<a href={`/files/${file.r2Key}`} className="mt-1 inline-block text-brand">
								{file.originalName} ({formatBytes(file.size)})
							</a>
						</li>
					))}
				</ul>
			) : null}

			<section className="mt-8 border-t border-slate-200 pt-6">
				<h3 className="text-sm font-medium">댓글 {replies.length}</h3>
				<ul className="mt-3 space-y-3">
					{replies.map((reply) => (
						<li key={reply.id} className="rounded bg-slate-50 px-4 py-3 text-sm">
							<p className="text-xs text-slate-500">
								{reply.author} · {formatDate(reply.createdAt)}
							</p>
							<p className="mt-1 whitespace-pre-wrap">{reply.content}</p>
						</li>
					))}
				</ul>
				<Form method="post" className="mt-4 space-y-3">
					<input type="hidden" name="intent" value="comment" />
					<input name="website" tabIndex={-1} autoComplete="off" className="hidden" />
					{actionData && "error" in actionData ? (
						<p className="text-sm text-red-600">{actionData.error}</p>
					) : null}
					<input
						name="author"
						required
						placeholder="이름"
						className="w-full rounded border border-slate-300 px-3 py-2 text-sm md:w-60"
					/>
					<textarea
						name="content"
						required
						rows={3}
						placeholder="댓글"
						className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
					/>
					<button type="submit" className="rounded bg-brand px-4 py-2 text-sm text-white">
						등록
					</button>
				</Form>
			</section>
			<p className="mt-8">
				<Link to={`/board/${board.slug}`} className="text-sm text-brand">
					목록
				</Link>
			</p>
		</Subpage>
	);
}
