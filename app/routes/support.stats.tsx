import { Link, useSearchParams } from "react-router";

import type { Route } from "./+types/support.stats";
import { Subpage } from "../components/subpage";
import { pageMeta } from "../lib/format";

export function meta({}: Route.MetaArgs) {
	return pageMeta("후원금현황", "재단법인 학성장학회 후원금 현황입니다.");
}

const years = [
	{ id: "2020", label: "2020년도" },
	{ id: "2019", label: "2019년도" },
];

export default function Stats() {
	const [params] = useSearchParams();
	const year = params.get("year") === "2019" ? "2019" : "2020";

	return (
		<Subpage section="support" title="후원금현황">
			<div className="mb-4 flex border border-slate-200 bg-slate-100">
				{years.map((item) => (
					<Link
						key={item.id}
						to={item.id === "2020" ? "/support/stats" : "/support/stats?year=2019"}
						className={`px-4 py-3 text-sm ${year === item.id ? "bg-slate-300 font-medium" : "hover:bg-slate-200"}`}
					>
						{item.label}
					</Link>
				))}
			</div>
			{year === "2019" ? (
				<div className="space-y-4">
					<img src="/images/2019-1.png" alt="2019년 후원금 현황 1" className="w-full border border-slate-200" />
					<img src="/images/2019-2.png" alt="2019년 후원금 현황 2" className="w-full border border-slate-200" />
				</div>
			) : (
				<iframe
					title="2020년 후원금 현황"
					src="/stats/2020.html"
					className="h-[860px] w-full border border-slate-200 bg-white"
				/>
			)}
		</Subpage>
	);
}
