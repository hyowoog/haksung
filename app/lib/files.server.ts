import { env } from "cloudflare:workers";

const ALLOWED_TYPES: Record<string, string> = {
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	gif: "image/gif",
	webp: "image/webp",
	pdf: "application/pdf",
	doc: "application/msword",
	docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	hwp: "application/x-hwp",
	zip: "application/zip",
};

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

const MAX_BYTES = 8 * 1024 * 1024;

/** 확장자를 허용 목록과 맞춰 R2에 올리고 저장 정보를 돌려준다. */
export async function storeUpload(postId: number, file: File) {
	return putFile(`posts/${postId}`, file, Object.keys(ALLOWED_TYPES));
}

/** 후원금현황 이미지는 연도별 경로(stats/연도)에 이미지 형식만 받는다. */
export async function storeStatImage(year: number, file: File) {
	return putFile(`stats/${year}`, file, IMAGE_EXTENSIONS);
}

async function putFile(prefix: string, file: File, extensions: string[]) {
	if (file.size <= 0) return null;
	if (file.size > MAX_BYTES) {
		throw new Error("파일은 8MB 이하만 올릴 수 있습니다.");
	}

	const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
	const contentType = ALLOWED_TYPES[extension];
	if (!contentType || !extensions.includes(extension)) {
		throw new Error(`${extensions.join(", ")} 파일만 올릴 수 있습니다.`);
	}

	const key = `${prefix}/${crypto.randomUUID()}.${extension}`;
	await env.MY_BUCKET.put(key, file.stream(), {
		httpMetadata: { contentType },
		customMetadata: { originalName: file.name },
	});

	return {
		originalName: file.name,
		r2Key: key,
		size: file.size,
		contentType,
	};
}

export async function deleteObject(key: string) {
	await env.MY_BUCKET.delete(key);
}
