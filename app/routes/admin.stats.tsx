import { Form, Link, redirect } from "react-router";

import type { Route } from "./+types/admin.stats";
import { formatBytes, pageMeta } from "../lib/format";
import { requireMember } from "../lib/session.server";
import { addStatImages, legacyYears, listStatRows, moveStatImage, removeStatImage } from "../lib/stats.server";

export function meta({}: Route.MetaArgs) {
	return pageMeta("후원금현황 관리");
}

export async function loader({ request }: Route.LoaderArgs) {
	await requireMember(request);
	const rows = await listStatRows();

	// 연도별로 묶는다 (rows는 연도 내림차순·순서 오름차순으로 정렬돼 있다)
	const groups: { year: number; items: typeof rows }[] = [];
	for (const row of rows) {
		const group = groups.at(-1);
		if (group?.year === row.year) group.items.push(row);
		else groups.push({ year: row.year, items: [row] });
	}
	return { groups, legacyYears, thisYear: new Date().getFullYear() };
}

export async function action({ request }: Route.ActionArgs) {
	await requireMember(request);
	const formData = await request.formData();
	const intent = String(formData.get("intent") ?? "upload");
	const id = Number(formData.get("id"));

	if (intent === "delete") {
		if (Number.isInteger(id)) await removeStatImage(id);
		return redirect("/admin/stats");
	}

	if (intent === "up" || intent === "down") {
		if (Number.isInteger(id)) await moveStatImage(id, intent);
		return redirect("/admin/stats");
	}

	const year = Number(formData.get("year"));
	const maxYear = new Date().getFullYear() + 1;
	if (!Number.isInteger(year) || year < 2000 || year > maxYear) {
		return { error: `연도는 2000년부터 ${maxYear}년 사이로 입력해 주세요.` };
	}

	const files = formData.getAll("images").filter((file): file is File => file instanceof File && file.size > 0);
	if (files.length === 0) return { error: "올릴 이미지를 선택해 주세요." };

	try {
		await addStatImages(year, files);
	} catch (error) {
		return { error: error instanceof Error ? error.message : "이미지를 저장하지 못했습니다." };
	}
	return redirect("/admin/stats");
}

export default function AdminStats({ loaderData, actionData }: Route.ComponentProps) {
	const { groups, thisYear } = loaderData;
	const uploadedYears = new Set(groups.map((group) => group.year));
	const legacyOnly = loaderData.legacyYears.filter((year) => !uploadedYears.has(year));

	return (
		<div className="space-y-6">
			<Form
				method="post"
				encType="multipart/form-data"
				className="grid gap-3 rounded border border-slate-200 bg-white p-6 md:grid-cols-[10rem_1fr_auto] md:items-end"
			>
				<div className="md:col-span-3">
					<h1 className="font-serif text-2xl">후원금현황 관리</h1>
					<p className="mt-1 text-sm text-slate-500">
						연도를 고르고 이미지를 올리면{" "}
						<Link to="/support/stats" className="text-brand underline">
							후원금현황
						</Link>{" "}
						페이지에 순서대로 표시됩니다. 여러 장을 한 번에 올릴 수 있습니다.
					</p>
				</div>
				{actionData && "error" in actionData ? (
					<p className="text-sm text-red-600 md:col-span-3">{actionData.error}</p>
				) : null}
				<input type="hidden" name="intent" value="upload" />
				<label className="text-sm">
					연도
					<input
						name="year"
						type="number"
						min={2000}
						max={thisYear + 1}
						defaultValue={thisYear}
						required
						className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
					/>
				</label>
				<label className="text-sm">
					이미지 (jpg, png, gif, webp · 장당 8MB 이하)
					<input
						name="images"
						type="file"
						accept="image/jpeg,image/png,image/gif,image/webp"
						multiple
						required
						className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5"
					/>
				</label>
				<button type="submit" className="h-10 rounded bg-brand px-4 text-sm text-white">
					올리기
				</button>
			</Form>

			{legacyOnly.length > 0 ? (
				<p className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
					{legacyOnly.join(", ")}년은 기존 홈페이지 자료가 표시되고 있습니다. 해당 연도 이미지를 올리면 새 이미지로 바뀝니다.
				</p>
			) : null}

			{groups.length === 0 ? (
				<p className="rounded border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
					아직 올린 이미지가 없습니다.
				</p>
			) : (
				groups.map((group) => (
					<section key={group.year} className="rounded border border-slate-200 bg-white">
						<h2 className="border-b border-slate-200 px-4 py-3 font-medium">{group.year}년도</h2>
						<ul className="divide-y divide-slate-200">
							{group.items.map((item, index) => (
								<li key={item.id} className="flex items-center gap-4 px-4 py-3 text-sm">
									<a href={`/files/${item.r2Key}`} target="_blank" rel="noreferrer" className="shrink-0">
										<img
											src={`/files/${item.r2Key}`}
											alt={item.originalName}
											className="h-16 w-24 rounded border border-slate-200 object-cover"
										/>
									</a>
									<div className="min-w-0 flex-1">
										<p className="truncate">{item.originalName}</p>
										<p className="text-xs text-slate-500">
											{index + 1}번째 · {formatBytes(item.size)}
										</p>
									</div>
									<Form method="post" className="flex shrink-0 items-center gap-1">
										<input type="hidden" name="id" value={item.id} />
										<button
											type="submit"
											name="intent"
											value="up"
											disabled={index === 0}
											className="rounded border border-slate-300 px-2 py-1 disabled:opacity-30"
										>
											위로
										</button>
										<button
											type="submit"
											name="intent"
											value="down"
											disabled={index === group.items.length - 1}
											className="rounded border border-slate-300 px-2 py-1 disabled:opacity-30"
										>
											아래로
										</button>
										<button
											type="submit"
											name="intent"
											value="delete"
											onClick={(event) => {
												if (!confirm("이 이미지를 삭제할까요?")) event.preventDefault();
											}}
											className="ml-2 text-red-600"
										>
											삭제
										</button>
									</Form>
								</li>
							))}
						</ul>
					</section>
				))
			)}
		</div>
	);
}
