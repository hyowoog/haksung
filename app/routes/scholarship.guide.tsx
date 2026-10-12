import type { Route } from "./+types/scholarship.guide";
import { RuleList } from "../components/rule-list";
import { Subpage } from "../components/subpage";
import { reviewRules } from "../content/site";
import { pageMeta } from "../lib/format";

export function meta({}: Route.MetaArgs) {
	return pageMeta("장학사업안내", "재단법인 학성장학회 장학생 심사규정입니다.");
}

export default function ScholarshipGuide() {
	return (
		<Subpage section="scholarship" title="장학사업안내">
			<RuleList heading="재단법인 학성장학회 장학생 심사규정" sections={reviewRules} />
		</Subpage>
	);
}
