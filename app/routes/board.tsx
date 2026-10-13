import { Form, Link } from "react-router";

import type { Route } from "./+types/board";
import { Subpage } from "../components/subpage";
import { findBoard, listPosts } from "../lib/posts.server";
import { formatDate, isImageType, pageMeta } from "../lib/format";

const boardTitles: Record<string, string> = {
	notice: "공지사항",
	story: "장학생수기",
	gallery: "갤러리",
};

export function meta({ params }: Route.MetaArgs) {
	return pageMeta(boardTitles[params.slug] ?? "게시판");
}

export async function loader({ params, request }: Route.LoaderArgs) {
	const board = await findBoard(params.slug);
	const url = new URL(request.url);
	const query = url.searchParams.get("q") ?? "";
	const page = Number(url.searchParams.get("page") ?? "1");
	const result = await listPosts(board.id, Number.isFinite(page) ? page : 1, board.pageSize, query);
	return { board, query, ...result };
}

export default function BoardList({ loaderData }: Route.ComponentProps) {
	const { board, rows, files, count, current, pageCount, query } = loaderData;
	const isGallery = board.kind === "gallery";

	return (
		<Subpage section="community" title={board.name}>
			<p className="mb-4 text-sm text-slate-500">
				{board.description} · 전체 {count}건
			</p>
			{isGallery ? (
				<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
					{rows.map((post) => {
						const image = files.find((file) => file.postId === post.id && isImageType(file.contentType));
						return (
							<Link key={post.id} to={`/board/${board.slug}/${post.id}`} className="group">
								<div className="aspect-4/3 overflow-hidden rounded border border-slate-200 bg-slate-100">
									{image ? (
										<img
											src={`/files/${image.r2Key}`}
											alt=""
											className="h-full w-full object-cover transition group-hover:scale-105"
										/>
									) : (
										<div className="flex h-full items-center justify-center text-sm text-slate-400">이미지 없음</div>
									)}
								</div>
								<p className="mt-2 truncate text-sm">{post.title}</p>
								<p className="text-xs text-slate-400">{formatDate(post.createdAt)}</p>
							</Link>
						);
					})}
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full min-w-140 border-collapse text-sm">
						<thead>
							<tr className="border-y border-slate-300 bg-slate-50 text-slate-600">
								<th className="px-3 py-2 text-left font-medium">제목</th>
								<th className="w-24 px-3 py-2 font-medium">작성자</th>
								<th className="w-28 px-3 py-2 font-medium">날짜</th>
								<th className="w-16 px-3 py-2 font-medium">조회</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((post) => (
								<tr key={post.id} className="border-b border-slate-200">
									<td className="px-3 py-3">
										<Link to={`/board/${board.slug}/${post.id}`} className="hover:text-brand">
											{post.title}
										</Link>
									</td>
									<td className="px-3 py-3 text-center">{post.author}</td>
									<td className="px-3 py-3 text-center text-slate-500">{formatDate(post.createdAt)}</td>
									<td className="px-3 py-3 text-center text-slate-500">{post.hit}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
			{rows.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">등록된 글이 없습니다.</p> : null}

			{pageCount > 1 ? (
				<nav className="mt-6 flex justify-center gap-2 text-sm">
					{Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
						<Link
							key={page}
							to={`/board/${board.slug}?page=${page}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
							className={`rounded px-3 py-1 ${page === current ? "bg-brand text-white" : "border border-slate-200"}`}
						>
							{page}
						</Link>
					))}
				</nav>
			) : null}

			<Form method="get" className="mt-6 flex gap-2">
				<input
					name="q"
					defaultValue={query}
					placeholder="제목, 작성자, 내용"
					className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
				/>
				<button type="submit" className="rounded border border-slate-300 px-4 py-2 text-sm">
					찾기
				</button>
			</Form>
		</Subpage>
	);
}
