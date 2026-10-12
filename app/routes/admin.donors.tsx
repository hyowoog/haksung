import { desc, eq } from "drizzle-orm";
import { Form, redirect } from "react-router";

import type { Route } from "./+types/admin.donors";
import { getDb } from "../db/client.server";
import { donors } from "../db/schema";
import { formatDate, pageMeta } from "../lib/format";
import { requireMember } from "../lib/session.server";

export function meta({}: Route.MetaArgs) {
	return pageMeta("후원자 관리");
}

export async function loader({ request }: Route.LoaderArgs) {
	await requireMember(request);
	const rows = await getDb().select().from(donors).orderBy(desc(donors.id));
	return { donors: rows };
}

export async function action({ request }: Route.ActionArgs) {
	await requireMember(request);
	const formData = await request.formData();
	const intent = String(formData.get("intent") ?? "create");
	const db = getDb();

	if (intent === "delete") {
		const id = Number(formData.get("id"));
		if (Number.isInteger(id)) await db.delete(donors).where(eq(donors.id, id));
		return redirect("/admin/donors");
	}

	const name = String(formData.get("name") ?? "").trim();
	if (!name) return { error: "이름을 입력해 주세요." };
	const amountRaw = String(formData.get("amount") ?? "").trim();
	const amount = amountRaw ? Number(amountRaw.replace(/,/g, "")) : null;

	await db.insert(donors).values({
		name,
		amount: amount !== null && Number.isFinite(amount) ? amount : null,
		donatedOn: String(formData.get("donatedOn") ?? "") || null,
		note: String(formData.get("note") ?? "").trim(),
		isPublic: formData.get("isPublic") === "on" ? 1 : 0,
		createdAt: new Date().toISOString(),
	});
	return redirect("/admin/donors");
}

export default function AdminDonors({ loaderData, actionData }: Route.ComponentProps) {
	return (
		<div className="space-y-6">
			<Form method="post" className="grid gap-3 rounded border border-slate-200 bg-white p-6 md:grid-cols-2">
				<h1 className="font-serif text-2xl md:col-span-2">후원자 등록</h1>
				{actionData && "error" in actionData ? (
					<p className="text-sm text-red-600 md:col-span-2">{actionData.error}</p>
				) : null}
				<input type="hidden" name="intent" value="create" />
				<label className="text-sm">
					이름
					<input name="name" required className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
				</label>
				<label className="text-sm">
					금액
					<input name="amount" inputMode="numeric" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
				</label>
				<label className="text-sm">
					일자
					<input name="donatedOn" type="date" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
				</label>
				<label className="text-sm">
					내용
					<input name="note" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
				</label>
				<label className="flex items-center gap-2 text-sm md:col-span-2">
					<input name="isPublic" type="checkbox" defaultChecked />
					홈페이지에 공개
				</label>
				<button type="submit" className="w-fit rounded bg-brand px-4 py-2 text-sm text-white">
					추가
				</button>
			</Form>
			<ul className="divide-y divide-slate-200 rounded border border-slate-200 bg-white">
				{loaderData.donors.map((donor) => (
					<li key={donor.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
						<div>
							<p>
								{donor.name}
								{donor.amount ? ` · ${donor.amount.toLocaleString("ko-KR")}원` : ""}
								{donor.isPublic ? "" : " · 비공개"}
							</p>
							<p className="text-xs text-slate-500">
								{formatDate(donor.donatedOn)} {donor.note}
							</p>
						</div>
						<Form method="post">
							<input type="hidden" name="intent" value="delete" />
							<input type="hidden" name="id" value={donor.id} />
							<button type="submit" className="text-red-600">
								삭제
							</button>
						</Form>
					</li>
				))}
			</ul>
		</div>
	);
}
