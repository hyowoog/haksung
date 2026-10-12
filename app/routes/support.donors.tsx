import { desc, eq } from "drizzle-orm";

import type { Route } from "./+types/support.donors";
import { Subpage } from "../components/subpage";
import { getDb } from "../db/client.server";
import { donors } from "../db/schema";
import { formatDate, pageMeta } from "../lib/format";

export function meta({}: Route.MetaArgs) {
	return pageMeta("후원하신분들", "재단법인 학성장학회에 후원해 주신 분들입니다.");
}

export async function loader() {
	try {
		const rows = await getDb()
			.select()
			.from(donors)
			.where(eq(donors.isPublic, 1))
			.orderBy(desc(donors.donatedOn), desc(donors.id));
		return { donors: rows, ready: true };
	} catch {
		return { donors: [], ready: false };
	}
}

export default function DonorsPage({ loaderData }: Route.ComponentProps) {
	return (
		<Subpage section="support" title="후원하신분들">
			{loaderData.donors.length === 0 ? (
				<p className="text-sm leading-7 text-slate-600">
					후원해 주신 분들의 명단을 준비하고 있습니다. 따뜻한 마음에 감사드립니다.
				</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full min-w-[480px] border-collapse text-sm">
						<thead>
							<tr className="bg-slate-500 text-white">
								<th className="px-3 py-2 font-medium">성함</th>
								<th className="px-3 py-2 font-medium">일자</th>
								<th className="px-3 py-2 text-left font-medium">내용</th>
							</tr>
						</thead>
						<tbody>
							{loaderData.donors.map((donor) => (
								<tr key={donor.id} className="border-b border-slate-200">
									<td className="px-3 py-2 text-center">{donor.name}</td>
									<td className="px-3 py-2 text-center">{formatDate(donor.donatedOn)}</td>
									<td className="px-3 py-2">{donor.note}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</Subpage>
	);
}
