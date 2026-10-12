import type { Route } from "./+types/about.history";
import { Subpage } from "../components/subpage";
import { history } from "../content/site";
import { pageMeta } from "../lib/format";

export function meta({}: Route.MetaArgs) {
	return pageMeta("재단연혁", "재단법인 학성장학회 설립과 장학사업 연혁입니다.");
}

export default function History() {
	return (
		<Subpage section="about" title="재단연혁">
			<div className="space-y-8">
				{history.map((year) => (
					<article key={year.year} className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)]">
						<h2 className="font-serif text-3xl text-brand">{year.year}</h2>
						<ul className="space-y-2 text-sm leading-7">
							{year.events.map(([date, text]) => (
								<li key={`${year.year}-${date}-${text}`} className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
									<span className="text-slate-500">{date}</span>
									<span>{text}</span>
								</li>
							))}
						</ul>
					</article>
				))}
			</div>
		</Subpage>
	);
}
