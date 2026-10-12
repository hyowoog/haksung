import type { Route } from "./+types/about.directors";
import { Subpage } from "../components/subpage";
import { directors } from "../content/site";
import { pageMeta } from "../lib/format";

export function meta({}: Route.MetaArgs) {
	return pageMeta("임원소개", "재단법인 학성장학회 임원 명단입니다.");
}

export default function Directors() {
	return (
		<Subpage section="about" title="임원소개">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[520px] border-collapse text-sm">
					<thead>
						<tr className="bg-slate-500 text-white">
							<th className="w-1/4 px-3 py-2 font-medium">직위</th>
							<th className="w-1/4 px-3 py-2 font-medium">성명</th>
							<th className="px-3 py-2 text-left font-medium">비고</th>
						</tr>
					</thead>
					<tbody>
						{directors.map(([role, name, note]) => (
							<tr key={`${role}-${name}`} className="border-b border-slate-200 text-center">
								<td className="px-3 py-2">{role}</td>
								<td className="px-3 py-2">{name}</td>
								<td className="px-3 py-2 text-left">{note}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Subpage>
	);
}
