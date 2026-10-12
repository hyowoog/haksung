import { eq } from "drizzle-orm";
import { Form, redirect } from "react-router";

import type { Route } from "./+types/admin.post-new";
import { getDb } from "../db/client.server";
import { boards } from "../db/schema";
import { pageMeta } from "../lib/format";
import { createPost } from "../lib/posts.server";
import { requireMember } from "../lib/session.server";

export function meta({}: Route.MetaArgs) {
	return pageMeta("글쓰기");
}

export async function loader({ request }: Route.LoaderArgs) {
	await requireMember(request);
	const slug = new URL(request.url).searchParams.get("board") ?? "notice";
	const db = getDb();
	const boardRows = await db.select().from(boards);
	const selected = boardRows.find((board) => board.slug === slug) ?? boardRows[0];
	if (!selected) throw new Response("게시판이 없습니다. 데이터베이스를 준비해 주세요.", { status: 500 });
	return { boards: boardRows, selectedId: selected.id };
}

export async function action({ request }: Route.ActionArgs) {
	await requireMember(request);
	try {
		const formData = await request.formData();
		const created = await createPost(formData);
		const [board] = await getDb().select().from(boards).where(eq(boards.id, created.boardId)).limit(1);
		return redirect(board ? `/board/${board.slug}/${created.id}` : "/admin");
	} catch (error) {
		const message = error instanceof Error ? error.message : "글을 저장하지 못했습니다.";
		return { error: message };
	}
}

export default function AdminPostNew({ loaderData, actionData }: Route.ComponentProps) {
	return (
		<Form method="post" encType="multipart/form-data" className="space-y-4 rounded border border-slate-200 bg-white p-6">
			<h1 className="font-serif text-2xl">새 글</h1>
			{actionData && "error" in actionData ? <p className="text-sm text-red-600">{actionData.error}</p> : null}
			<label className="block text-sm">
				게시판
				<select name="boardId" defaultValue={loaderData.selectedId} className="mt-1 w-full rounded border border-slate-300 px-3 py-2">
					{loaderData.boards.map((board) => (
						<option key={board.id} value={board.id}>
							{board.name}
						</option>
					))}
				</select>
			</label>
			<label className="block text-sm">
				작성자
				<input name="author" required className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
			</label>
			<label className="block text-sm">
				제목
				<input name="title" required className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
			</label>
			<label className="block text-sm">
				내용
				<textarea name="content" rows={12} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
			</label>
			<label className="block text-sm">
				첨부파일
				<input name="files" type="file" multiple className="mt-1 block w-full text-sm" />
			</label>
			<button type="submit" className="rounded bg-brand px-4 py-2 text-sm text-white">
				등록
			</button>
		</Form>
	);
}
