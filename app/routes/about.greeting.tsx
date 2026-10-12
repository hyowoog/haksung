import type { Route } from "./+types/about.greeting";
import { Subpage } from "../components/subpage";
import { greetingParagraphs } from "../content/site";
import { pageMeta } from "../lib/format";

export function meta({}: Route.MetaArgs) {
	return pageMeta("인사말", "재단법인 학성장학회 이사장 인사말입니다.");
}

export default function Greeting() {
	return (
		<Subpage section="about" title="인사말">
			<div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_220px]">
				<div className="space-y-4 text-sm leading-7 text-slate-700">
					<h2 className="font-serif text-2xl text-brand">학성장학회, 나눔의 10년</h2>
					{greetingParagraphs.map((paragraph) => (
						<p key={paragraph}>{paragraph}</p>
					))}
					<p className="pt-4 text-right font-serif text-base text-slate-900">
						재단법인 학성장학회 이사장 박용걸
					</p>
				</div>
				<img src="/images/ygpark.png" alt="이사장 박용걸" className="w-full rounded border border-slate-200" />
			</div>
		</Subpage>
	);
}
