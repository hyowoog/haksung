import { Form, Link, redirect } from "react-router";

import type { Route } from "./+types/admin.post-edit";
import { getDb } from "../db/client.server";
import { boards } from "../db/schema";
import { formatBytes, isImageType, pageMeta } from "../lib/format";
import { loadPost, removePost, updatePost } from "../lib/posts.server";
import { requireMember } from "../lib/session.server";

export function meta({}: Route.MetaArgs) {
	return pageMeta("글 수정");
}

export async function loader({ request, params }: Route.LoaderArgs) {
	await requireMember(request);
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw new Response("글을 찾을 수 없습니다.", { status: 404 });
	const loaded = await loadPost(id);
	const boardRows = await getDb().select().from(boards);
	return { ...loaded, boards: boardRows };
}

export async function action({ request, params }: Route.ActionArgs) {
	await requireMember(request);
	const id = Number(params.id);
	const formData = await request.formData();
	const intent = String(formData.get("intent") ?? "update");

	try {
		if (intent === "delete") {
			await removePost(id);
			return redirect("/admin");
		}
		await updatePost(id, formData);
		return redirect(`/admin/posts/${id}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : "저장하지 못했습니다.";
		return { error: message };
	}
}

export default function AdminPostEdit({ loaderData, actionData }: Route.ComponentProps) {
	const { post, files, boards: boardRows } = loaderData;

	return (
		<div className="space-y-6">
			<Form method="post" encType="multipart/form-data" className="space-y-4 rounded border border-slate-200 bg-white p-6">
				<h1 className="font-serif text-2xl">글 수정</h1>
				{actionData && "error" in actionData ? <p className="text-sm text-red-600">{actionData.error}</p> : null}
				<input type="hidden" name="intent" value="update" />
				<label className="block text-sm">
					게시판
					<select name="boardId" defaultValue={post.boardId} className="mt-1 w-full rounded border border-slate-300 px-3 py-2">
						{boardRows.map((board) => (
							<option key={board.id} value={board.id}>
								{board.name}
							</option>
						))}
					</select>
				</label>
				<label className="block text-sm">
					작성자
					<input name="author" required defaultValue={post.author} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
				</label>
				<label className="block text-sm">
					제목
					<input name="title" required defaultValue={post.title} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
				</label>
				<label className="block text-sm">
					내용
					<textarea name="content" rows={12} defaultValue={post.content} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
				</label>
				{files.length > 0 ? (
					<fieldset className="space-y-2 text-sm">
						<legend>첨부 삭제</legend>
						{files.map((file) => (
							<label key={file.id} className="flex items-center gap-2">
								<input type="checkbox" name="remove" value={file.id} />
								{isImageType(file.contentType) ? (
									<img src={`/files/${file.r2Key}`} alt="" className="h-12 w-12 rounded object-cover" />
								) : null}
								<span>
									{file.originalName} ({formatBytes(file.size)})
								</span>
							</label>
						))}
					</fieldset>
				) : null}
				<label className="block text-sm">
					파일 추가
					<input name="files" type="file" multiple className="mt-1 block w-full text-sm" />
				</label>
				<div className="flex gap-3">
					<button type="submit" className="rounded bg-brand px-4 py-2 text-sm text-white">
						저장
					</button>
					{loaderData.board ? (
						<Link to={`/board/${loaderData.board.slug}/${post.id}`} className="rounded border border-slate-300 px-4 py-2 text-sm">
							보기
						</Link>
					) : null}
				</div>
			</Form>
			<Form
				method="post"
				onSubmit={(event) => {
					if (!confirm("이 글을 삭제할까요?")) event.preventDefault();
				}}
			>
				<input type="hidden" name="intent" value="delete" />
				<button type="submit" className="text-sm text-red-600">
					이 글 삭제
				</button>
			</Form>
		</div>
	);
}
