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

/** 로그인하지 않았으면 관리자 로그인으로 보낸다. */
export async function requireMember(request: Request) {
	const session = await readSession(request);
	const memberId = session.get("memberId");
	if (!memberId) throw redirect("/admin/login");

	const [member] = await getDb()
		.select()
		.from(members)
		.where(eq(members.id, memberId))
		.limit(1);

	if (!member) throw redirect("/admin/login");
	return { member, session };
}
