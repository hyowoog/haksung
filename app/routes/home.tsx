import { desc, eq } from "drizzle-orm";
import { Link } from "react-router";

import type { Route } from "./+types/home";
import { foundation, menus } from "../content/site";
import { getDb } from "../db/client.server";
import { boards, posts } from "../db/schema";
import { formatDate, pageMeta } from "../lib/format";

export function meta() {
	return pageMeta(
		"재단법인 학성장학회",
		"학성고등학교 동문이 설립한 재단법인 학성장학회. 장학사업 안내, 장학생 선발, 후원 안내를 제공합니다.",
	);
}

export async function loader() {
	try {
		const db = getDb();
		const [notice] = await db.select().from(boards).where(eq(boards.slug, "notice")).limit(1);
		if (!notice) return { notices: [], ready: false };

		const notices = await db
			.select({
				id: posts.id,
				title: posts.title,
				createdAt: posts.createdAt,
			})
			.from(posts)
			.where(eq(posts.boardId, notice.id))
			.orderBy(desc(posts.createdAt))
			.limit(5);

		return { notices, ready: true };
	} catch {
		return { notices: [], ready: false };
	}
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const about = menus[0];

	return (
		<div>
			<section
				className="relative flex min-h-[460px] items-center bg-cover bg-center"
				style={{ backgroundImage: "url(/images/main.jpg)" }}
			>
				<div className="absolute inset-0 bg-brand-dark/70" />
				<div className="relative mx-auto w-full max-w-6xl px-4 py-16 text-white">
					<p className="text-sm tracking-widest text-white/80">HAKSUNG SCHOLARSHIP FOUNDATION</p>
					<h1 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">{foundation.name}</h1>
					<p className="mt-4 max-w-xl text-lg leading-8 text-white/90">
						학성고등학교 동문이 뜻을 모아 지역 학생의 배움을 잇습니다.
					</p>
					<div className="mt-8 flex flex-wrap gap-3">
						<Link to="/scholarship/selection" className="rounded bg-white px-5 py-2.5 text-sm font-medium text-brand">
							장학생 선발안내
						</Link>
						<Link to="/support" className="rounded border border-white/70 px-5 py-2.5 text-sm text-white">
							후원 참여
						</Link>
					</div>
				</div>
			</section>

			<section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-3">
				<article className="rounded border border-slate-200 bg-white p-6">
					<h2 className="bg-brand px-3 py-1 text-sm text-white">장학재단소개</h2>
					<div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
						{about.items.map((item) => (
							<Link
								key={item.href}
								to={item.href}
								className="rounded border border-slate-200 px-2 py-4 hover:border-brand hover:text-brand"
							>
								{item.label}
							</Link>
						))}
					</div>
				</article>

				<article className="rounded border border-slate-200 bg-white p-6">
					<div className="flex items-center justify-between">
						<h2 className="bg-brand px-3 py-1 text-sm text-white">공지사항</h2>
						<Link to="/board/notice" className="text-xs text-brand">
							더보기
						</Link>
					</div>
					{loaderData.ready ? (
						<ul className="mt-4 space-y-3 text-sm">
							{loaderData.notices.length === 0 ? (
								<li className="text-slate-500">등록된 공지가 없습니다.</li>
							) : (
								loaderData.notices.map((notice) => (
									<li key={notice.id} className="flex gap-3">
										<span className="shrink-0 text-slate-400">{formatDate(notice.createdAt)}</span>
										<Link to={`/board/notice/${notice.id}`} className="truncate hover:text-brand">
											{notice.title}
										</Link>
									</li>
								))
							)}
						</ul>
					) : (
						<p className="mt-4 text-sm leading-6 text-slate-500">
							데이터베이스를 아직 준비하지 않았습니다. 로컬에서는 <code>npm run db:setup</code>을 실행해 주세요.
						</p>
					)}
				</article>

				<article className="rounded border border-slate-200 bg-white p-6">
					<h2 className="bg-brand px-3 py-1 text-sm text-white">후원안내</h2>
					<p className="mt-5 text-lg font-medium text-brand">
						{foundation.bank}
						<br />
						<span className="text-base font-normal text-slate-600">예금주 {foundation.accountHolder}</span>
					</p>
					<p className="mt-3 text-sm leading-6 text-slate-600">
						연말정산 시 혜택이 가능한 기부금영수증이 발급됩니다.
					</p>
					<Link to="/support" className="mt-4 inline-block text-sm text-brand">
						후원 참여 안내
					</Link>
				</article>
			</section>
		</div>
	);
}
