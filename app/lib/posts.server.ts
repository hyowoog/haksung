import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { data } from "react-router";

import { getDb } from "../db/client.server";
import { attachments, boards, comments, posts } from "../db/schema";
import { deleteObject, storeUpload } from "./files.server";

export async function findBoard(slug: string) {
	const [board] = await getDb().select().from(boards).where(eq(boards.slug, slug)).limit(1);
	if (!board) throw data("게시판을 찾을 수 없습니다.", { status: 404 });
	return board;
}

export async function listPosts(boardId: number, page: number, pageSize: number, query: string) {
	const db = getDb();
	const trimmed = query.trim();
	const pattern = `%${trimmed.replace(/[%_]/g, "")}%`;
	const search = trimmed
		? or(like(posts.title, pattern), like(posts.author, pattern), like(posts.content, pattern))
		: undefined;
	const where = search ? and(eq(posts.boardId, boardId), search) : eq(posts.boardId, boardId);

	const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(posts).where(where);
	const count = Number(total);
	const pageCount = Math.max(1, Math.ceil(count / pageSize));
	const current = Math.min(Math.max(page, 1), pageCount);
	const rows = await db
		.select()
		.from(posts)
		.where(where)
		.orderBy(desc(posts.createdAt), desc(posts.id))
		.limit(pageSize)
		.offset((current - 1) * pageSize);

	const ids = rows.map((row) => row.id);
	const files =
		ids.length === 0
			? []
			: await db
					.select()
					.from(attachments)
					.where(or(...ids.map((id) => eq(attachments.postId, id))));

	return { rows, files, count, current, pageCount };
}

function textField(formData: FormData, name: string, limit: number) {
	const value = String(formData.get(name) ?? "").trim();
	return value.slice(0, limit);
}

export function readPostForm(formData: FormData) {
	const title = textField(formData, "title", 200);
	const author = textField(formData, "author", 40);
	const content = textField(formData, "content", 20000);
	const boardId = Number(formData.get("boardId"));
	if (!title || !author || !Number.isInteger(boardId)) {
		throw new Error("게시판, 제목, 작성자를 입력해 주세요.");
	}
	return { title, author, content, boardId };
}

export async function createPost(formData: FormData) {
	const input = readPostForm(formData);
	const now = new Date().toISOString();
	const db = getDb();
	const [created] = await db
		.insert(posts)
		.values({ ...input, createdAt: now, updatedAt: now })
		.returning();
	await attachFiles(created.id, formData);
	return created;
}

export async function updatePost(id: number, formData: FormData) {
	const input = readPostForm(formData);
	const db = getDb();
	await db
		.update(posts)
		.set({ ...input, updatedAt: new Date().toISOString() })
		.where(eq(posts.id, id));

	const removeIds = formData
		.getAll("remove")
		.map((value) => Number(value))
		.filter((value) => Number.isInteger(value));
	if (removeIds.length > 0) {
		const existing = await db.select().from(attachments).where(eq(attachments.postId, id));
		for (const file of existing) {
			if (!removeIds.includes(file.id)) continue;
			await deleteObject(file.r2Key);
			await db.delete(attachments).where(eq(attachments.id, file.id));
		}
	}

	await attachFiles(id, formData);
}

async function attachFiles(postId: number, formData: FormData) {
	const files = formData.getAll("files").filter((file): file is File => file instanceof File && file.size > 0);
	if (files.length > 5) throw new Error("첨부파일은 한 번에 5개까지 올릴 수 있습니다.");
	const db = getDb();
	for (const file of files) {
		const stored = await storeUpload(postId, file);
		if (!stored) continue;
		await db.insert(attachments).values({ postId, ...stored });
	}
}

export async function removePost(id: number) {
	const db = getDb();
	const files = await db.select().from(attachments).where(eq(attachments.postId, id));
	for (const file of files) await deleteObject(file.r2Key);
	await db.delete(comments).where(eq(comments.postId, id));
	await db.delete(attachments).where(eq(attachments.postId, id));
	await db.delete(posts).where(eq(posts.id, id));
}

export async function addComment(postId: number, formData: FormData) {
	if (String(formData.get("website") ?? "").trim()) return;
	const author = textField(formData, "author", 40);
	const content = textField(formData, "content", 1000);
	if (!author || !content) throw new Error("이름과 댓글 내용을 입력해 주세요.");
	await getDb().insert(comments).values({
		postId,
		author,
		content,
		createdAt: new Date().toISOString(),
	});
}

export async function loadPost(id: number) {
	const db = getDb();
	const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
	if (!post) throw data("글을 찾을 수 없습니다.", { status: 404 });
	const [board] = await db.select().from(boards).where(eq(boards.id, post.boardId)).limit(1);
	const files = await db.select().from(attachments).where(eq(attachments.postId, id));
	const replies = await db
		.select()
		.from(comments)
		.where(eq(comments.postId, id))
		.orderBy(asc(comments.createdAt));
	return { post, board, files, replies };
}
