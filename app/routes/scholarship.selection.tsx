import type { Route } from "./+types/scholarship.selection";
import { RuleList } from "../components/rule-list";
import { Subpage } from "../components/subpage";
import { selectionRules } from "../content/site";
import { pageMeta } from "../lib/format";

export function meta({}: Route.MetaArgs) {
	return pageMeta("장학생선발안내", "재단법인 학성장학회 장학금 지급 규정과 제출 서류 안내입니다.");
}

export default function Selection() {
	return (
		<Subpage section="scholarship" title="장학생선발안내">
			<RuleList heading="재단법인 학성장학회 장학금 지급 규정" sections={selectionRules} />
			<p className="mt-8 text-sm leading-7 text-slate-600">
				장학금 지원신청서와 추천서는 재단 사무국으로 문의해 주시면 안내해 드립니다.
			</p>
		</Subpage>
	);
}
