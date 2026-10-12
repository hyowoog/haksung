import type { Route } from "./+types/support";
import { Subpage } from "../components/subpage";
import { foundation } from "../content/site";
import { pageMeta } from "../lib/format";

export function meta({}: Route.MetaArgs) {
	return pageMeta("후원참여안내", "재단법인 학성장학회 후원 계좌와 기부금 영수증 안내입니다.");
}

const deduction = [
	"기부하신 분께 연말정산 시 세제혜택을 받을 수 있는 기부금 영수증을 발급하고 있습니다.",
	"기부 확인이 되면 요청하신 주소로 기부금영수증을 발급하여 우편으로 보내드립니다.",
	"사업소득이 있는 개인은 소득의 30% 한도 내에서 필요경비로 인정되며, 근로소득자의 경우는 소득액의 30% 한도 내에서 15% 세액공제가 됩니다.",
	"법인은 소득액의 10% 한도 내에서 필요경비로 인정됩니다.",
];

export default function Support() {
	return (
		<Subpage section="support" title="후원참여안내">
			<p className="mb-8 text-center font-serif text-xl leading-8">
				여러분들의 <strong>소중한 후원금은</strong> 전액 <strong>목적사업</strong>으로 쓰여집니다
			</p>
			<section className="space-y-3 text-sm leading-7">
				<h2 className="inline-block bg-brand px-3 py-1 text-white">후원문의</h2>
				<p>{foundation.name} : {foundation.address}</p>
				<p>전화 : {foundation.phone}</p>
				<p>팩스 : {foundation.fax}</p>
				<p>이메일 : {foundation.email}</p>
			</section>
			<section className="mt-8 space-y-3 text-sm leading-7">
				<h2 className="inline-block bg-brand px-3 py-1 text-white">기부금 소득공제</h2>
				<ul className="list-disc space-y-2 pl-5">
					{deduction.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
			</section>
			<section className="mt-8 space-y-3 text-sm leading-7">
				<h2 className="inline-block bg-brand px-3 py-1 text-white">후원금 계좌</h2>
				<p>
					{foundation.bank} (예금주 : {foundation.accountHolder})
				</p>
			</section>
		</Subpage>
	);
}
