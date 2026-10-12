import { desc } from "drizzle-orm";
import { Link } from "react-router";

import type { Route } from "./+types/admin.home";
import { getDb } from "../db/client.server";
import { boards, posts } from "../db/schema";
import { formatDate, pageMeta } from "../lib/format";
import { requireMember } from "../lib/session.server";

export function meta({}: Route.MetaArgs) {
	return pageMeta("글 관리");
}

export async function loader({ request }: Route.LoaderArgs) {
	await requireMember(request);
	const db = getDb();
	const boardRows = await db.select().from(boards).orderBy(boards.id);
	const recent = await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(30);
	return { boards: boardRows, recent };
}

export default function AdminHome({ loaderData }: Route.ComponentProps) {
	return (
		<div>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="font-serif text-2xl">게시글</h1>
				<div className="flex flex-wrap gap-2">
					{loaderData.boards.map((board) => (
						<Link
							key={board.id}
							to={`/admin/posts/new?board=${board.slug}`}
							className="rounded bg-brand px-3 py-2 text-sm text-white"
						>
							{board.name} 쓰기
						</Link>
					))}
				</div>
			</div>
			<ul className="mt-6 divide-y divide-slate-200 rounded border border-slate-200 bg-white">
				{loaderData.recent.length === 0 ? (
					<li className="px-4 py-8 text-sm text-slate-500">등록된 글이 없습니다.</li>
				) : (
					loaderData.recent.map((post) => {
						const board = loaderData.boards.find((item) => item.id === post.boardId);
						return (
							<li key={post.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
								<div>
									<p className="text-xs text-slate-400">{board?.name}</p>
									<Link to={`/admin/posts/${post.id}`} className="hover:text-brand">
										{post.title}
									</Link>
								</div>
								<span className="text-slate-400">{formatDate(post.createdAt)}</span>
							</li>
						);
					})
				)}
			</ul>
		</div>
	);
}
