import { Link } from "react-router";

import type { Route } from "./+types/support.stats";
import { Subpage } from "../components/subpage";
import { pageMeta } from "../lib/format";
import { loadStatsPage } from "../lib/stats.server";

export function meta({}: Route.MetaArgs) {
	return pageMeta("후원금현황", "재단법인 학성장학회 후원금 현황입니다.");
}

export async function loader({ request }: Route.LoaderArgs) {
	const requested = Number(new URL(request.url).searchParams.get("year"));
	return loadStatsPage(Number.isInteger(requested) ? requested : null);
}

export default function Stats({ loaderData }: Route.ComponentProps) {
	const { years, year, images, html } = loaderData;

	return (
		<Subpage section="support" title="후원금 공시">
			<div className="mb-4 flex flex-wrap border border-slate-200 bg-slate-100">
				{years.map((item, index) => (
					<Link
						key={item}
						to={index === 0 ? "/support/stats" : `/support/stats?year=${item}`}
						preventScrollReset
						className={`px-4 py-3 text-sm ${year === item ? "bg-slate-300 font-medium" : "hover:bg-slate-200"}`}
					>
						{item}년도
					</Link>
				))}
			</div>
			{html ? (
				<iframe title={`${year}년 후원금 현황`} src={html} className="h-215 w-full border border-slate-200 bg-white" />
			) : images.length > 0 ? (
				<div className="space-y-4">
					{images.map((image) => (
						<img key={image.id} src={image.src} alt={image.alt} className="w-full border border-slate-200" />
					))}
				</div>
			) : (
				<p className="py-12 text-center text-sm text-slate-500">등록된 후원금 현황이 없습니다.</p>
			)}
		</Subpage>
	);
}
