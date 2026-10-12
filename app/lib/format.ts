export function formatDate(value: string | null | undefined) {
	if (!value) return "";
	const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
		? `${value}T00:00:00+09:00`
		: value.includes("T")
			? value
			: `${value.replace(" ", "T")}Z`;
	const date = new Date(normalized);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat("ko-KR", {
		timeZone: "Asia/Seoul",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

export function isImageType(contentType: string) {
	return contentType.startsWith("image/");
}

export function formatBytes(size: number) {
	if (size < 1024) return `${size}B`;
	if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
	return `${(size / (1024 * 1024)).toFixed(1)}MB`;
}

export function pageMeta(title: string, description?: string) {
	const fullTitle = title.includes("학성장학회") ? title : `${title} | 재단법인 학성장학회`;
	return [
		{ title: fullTitle },
		{
			name: "description",
			content: description ?? "재단법인 학성장학회 장학사업, 장학생 선발, 후원 안내",
		},
		{ property: "og:title", content: fullTitle },
		{
			property: "og:description",
			content: description ?? "장학재단 소개 및 장학생 선발, 장학금 현황 제공",
		},
	];
}
