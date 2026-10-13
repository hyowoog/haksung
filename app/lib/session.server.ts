import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { createCookieSessionStorage, redirect } from "react-router";

import { getDb } from "../db/client.server";
import { members } from "../db/schema";

function storage() {
	const secret = env.SESSION_SECRET;
	if (!secret || secret.length < 16) {
		throw new Error("SESSION_SECRET이 없거나 너무 짧습니다. .dev.vars를 확인하세요.");
	}

	return createCookieSessionStorage<{ memberId: number }>({
		cookie: {
			name: "__hs_session",
			httpOnly: true,
			path: "/",
			sameSite: "lax",
			secrets: [secret],
			secure: import.meta.env.PROD,
			maxAge: 60 * 60 * 8,
		},
	});
}

export async function readSession(request: Request) {
	return storage().getSession(request.headers.get("Cookie"));
}

export async function commitSession(session: Awaited<ReturnType<typeof readSession>>) {
	return storage().commitSession(session);
}

export async function destroySession(session: Awaited<ReturnType<typeof readSession>>) {
	return storage().destroySession(session);
}

/** 세션의 회원을 조회한다. 쿠키만 남고 계정이 삭제됐으면 member는 null이다. */
export async function getMember(request: Request) {
	const session = await readSession(request);
	const memberId = session.get("memberId");
	if (!memberId) return { member: null, session };

	const [member] = await getDb()
		.select()
		.from(members)
		.where(eq(members.id, memberId))
		.limit(1);
	return { member: member ?? null, session };
}

/** 로그인하지 않았으면 관리자 로그인으로 보낸다. */
export async function requireMember(request: Request) {
	const { member, session } = await getMember(request);
	if (!member) {
		// 삭제된 계정의 쿠키가 남아 로그인 페이지와 리다이렉트를 반복하지 않도록 비운다
		throw redirect("/admin/login", {
			headers: session.get("memberId") ? { "Set-Cookie": await destroySession(session) } : undefined,
		});
	}
	return { member, session };
}
