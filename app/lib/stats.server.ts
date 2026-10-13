import { and, asc, desc, eq, gt, lt, max } from "drizzle-orm";

import { getDb } from "../db/client.server";
import { donationStats } from "../db/schema";
import { deleteObject, storeStatImage } from "./files.server";

export type StatImage = { id: number; src: string; alt: string };

/** 관리자가 이미지를 올리기 전까지 보여 줄 레거시 자료 */
const legacyStats: Record<number, { html?: string; images?: string[] }> = {
	2020: { html: "/stats/2020.html" },
	2019: { images: ["/images/2019-1.png", "/images/2019-2.png"] },
};

export const legacyYears = Object.keys(legacyStats).map(Number);

export async function listStatRows() {
	return getDb()
		.select()
		.from(donationStats)
		.orderBy(desc(donationStats.year), asc(donationStats.sortOrder), asc(donationStats.id));
}

/** 공개 페이지용: 연도 목록과 선택한 연도의 표시 자료를 만든다. 업로드한 이미지가 레거시보다 우선한다. */
export async function loadStatsPage(requestedYear: number | null) {
	const rows = await listStatRows();
	const years = [...new Set([...rows.map((row) => row.year), ...legacyYears])].sort((a, b) => b - a);
	const year = requestedYear && years.includes(requestedYear) ? requestedYear : (years[0] ?? null);
	if (year === null) return { years, year, images: [] as StatImage[], html: null };

	const uploaded = rows.filter((row) => row.year === year);
	if (uploaded.length > 0) {
		const images = uploaded.map((row, index) => ({
			id: row.id,
			src: `/files/${row.r2Key}`,
			alt: `${year}년 후원금 현황 ${index + 1}`,
		}));
		return { years, year, images, html: null };
	}

	const legacy = legacyStats[year] ?? {};
	const images = (legacy.images ?? []).map((src, index) => ({
		id: -(index + 1),
		src,
		alt: `${year}년 후원금 현황 ${index + 1}`,
	}));
	return { years, year, images, html: legacy.html ?? null };
}

/** 같은 연도의 마지막 순서 뒤에 이어서 저장한다. */
export async function addStatImages(year: number, files: File[]) {
	const db = getDb();
	const [{ last }] = await db
		.select({ last: max(donationStats.sortOrder) })
		.from(donationStats)
		.where(eq(donationStats.year, year));
	let sortOrder = (last ?? 0) + 1;

	for (const file of files) {
		const stored = await storeStatImage(year, file);
		if (!stored) continue;
		await db.insert(donationStats).values({
			year,
			...stored,
			sortOrder: sortOrder++,
			createdAt: new Date().toISOString(),
		});
	}
}

export async function removeStatImage(id: number) {
	const db = getDb();
	const [row] = await db.select().from(donationStats).where(eq(donationStats.id, id)).limit(1);
	if (!row) return;
	await deleteObject(row.r2Key);
	await db.delete(donationStats).where(eq(donationStats.id, id));
}

/** 같은 연도 안에서 바로 앞(위) 또는 뒤(아래) 이미지와 순서를 맞바꾼다. */
export async function moveStatImage(id: number, direction: "up" | "down") {
	const db = getDb();
	const [row] = await db.select().from(donationStats).where(eq(donationStats.id, id)).limit(1);
	if (!row) return;

	const [neighbor] = await db
		.select()
		.from(donationStats)
		.where(
			and(
				eq(donationStats.year, row.year),
				direction === "up"
					? lt(donationStats.sortOrder, row.sortOrder)
					: gt(donationStats.sortOrder, row.sortOrder),
			),
		)
		.orderBy(direction === "up" ? desc(donationStats.sortOrder) : asc(donationStats.sortOrder))
		.limit(1);
	if (!neighbor) return;

	await db.batch([
		db.update(donationStats).set({ sortOrder: neighbor.sortOrder }).where(eq(donationStats.id, row.id)),
		db.update(donationStats).set({ sortOrder: row.sortOrder }).where(eq(donationStats.id, neighbor.id)),
	]);
}
