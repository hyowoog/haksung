const ITERATIONS = 100_000;
const encoder = new TextEncoder();

function toHex(bytes: Uint8Array) {
	return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string) {
	const bytes = new Uint8Array(hex.length / 2);
	for (let index = 0; index < bytes.length; index++) {
		bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
	}
	return bytes;
}

async function derive(password: string, salt: Uint8Array) {
	const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
		"deriveBits",
	]);
	const bits = await crypto.subtle.deriveBits(
		{ name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
		key,
		256,
	);
	return new Uint8Array(bits);
}

/** 비밀번호를 PBKDF2-SHA256으로 해시한다. */
export async function hashPassword(password: string) {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const hash = await derive(password, salt);
	return `pbkdf2:${ITERATIONS}:${toHex(salt)}:${toHex(hash)}`;
}

/** HMAC 검증으로 두 해시를 비교해 타이밍 차이를 줄인다. */
async function safeEqual(left: string, right: string) {
	const key = await crypto.subtle.importKey(
		"raw",
		crypto.getRandomValues(new Uint8Array(32)),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"],
	);
	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(left));
	return crypto.subtle.verify("HMAC", key, signature, encoder.encode(right));
}

export async function verifyPassword(password: string, stored: string) {
	const [scheme, rounds, saltHex, hashHex] = stored.split(":");
	if (scheme !== "pbkdf2" || rounds !== String(ITERATIONS) || !saltHex || !hashHex) return false;
	const actual = toHex(await derive(password, fromHex(saltHex)));
	return safeEqual(actual, hashHex);
}
