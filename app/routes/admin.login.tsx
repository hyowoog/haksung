import { count, eq } from "drizzle-orm";
import { Form, data, redirect } from "react-router";

import type { Route } from "./+types/admin.login";
import { foundation } from "../content/site";
import { getDb } from "../db/client.server";
import { members } from "../db/schema";
import { pageMeta } from "../lib/format";
import { hashPassword, verifyPassword } from "../lib/password.server";
import { commitSession, destroySession, getMember, readSession } from "../lib/session.server";

export function meta({}: Route.MetaArgs) {
	return pageMeta("관리자");
}

export async function loader({ request }: Route.LoaderArgs) {
	const { member, session } = await getMember(request);
	if (member) throw redirect("/admin");

	const [{ total }] = await getDb().select({ total: count() }).from(members);
	const result = { needsSetup: Number(total) === 0 };
	// 삭제된 계정의 쿠키가 남아 있으면 지운다
	if (session.get("memberId")) {
		return data(result, { headers: { "Set-Cookie": await destroySession(session) } });
	}
	return result;
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const username = String(formData.get("username") ?? "").trim();
	const password = String(formData.get("password") ?? "");
	const name = String(formData.get("name") ?? "").trim();
	const intent = String(formData.get("intent") ?? "login");
	const db = getDb();

	if (username.length < 3 || password.length < 8) {
		return { error: "아이디는 3자 이상, 비밀번호는 8자 이상이어야 합니다." };
	}

	if (intent === "setup") {
		const [{ total }] = await db.select({ total: count() }).from(members);
		if (Number(total) > 0) return { error: "이미 관리자 계정이 있습니다." };
		if (!name) return { error: "이름을 입력해 주세요." };
		const [member] = await db
			.insert(members)
			.values({
				username,
				name,
				passwordHash: await hashPassword(password),
				createdAt: new Date().toISOString(),
			})
			.returning();
		const session = await readSession(request);
		session.set("memberId", member.id);
		return redirect("/admin", { headers: { "Set-Cookie": await commitSession(session) } });
	}

	const [member] = await db.select().from(members).where(eq(members.username, username)).limit(1);
	if (!member || !(await verifyPassword(password, member.passwordHash))) {
		return { error: "아이디 또는 비밀번호가 맞지 않습니다." };
	}

	const session = await readSession(request);
	session.set("memberId", member.id);
	return redirect("/admin", { headers: { "Set-Cookie": await commitSession(session) } });
}

export default function AdminLogin({ loaderData, actionData }: Route.ComponentProps) {
	const isSetup = loaderData.needsSetup;

	return (
		<main className="flex min-h-screen items-center justify-center px-4">
			<Form method="post" className="w-full max-w-sm rounded border border-slate-200 bg-white p-6 shadow-sm">
				<p className="text-sm text-brand">{foundation.shortName}</p>
				<h1 className="mt-1 font-serif text-2xl">{isSetup ? "최초 관리자 등록" : "관리자 로그인"}</h1>
				<input type="hidden" name="intent" value={isSetup ? "setup" : "login"} />
				{actionData && "error" in actionData ? (
					<p className="mt-4 text-sm text-red-600">{actionData.error}</p>
				) : null}
				<label className="mt-4 block text-sm">
					아이디
					<input name="username" required className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
				</label>
				{isSetup ? (
					<label className="mt-3 block text-sm">
						이름
						<input name="name" required className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
					</label>
				) : null}
				<label className="mt-3 block text-sm">
					비밀번호
					<input
						name="password"
						type="password"
						required
						className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
					/>
				</label>
				<button type="submit" className="mt-5 w-full rounded bg-brand py-2 text-sm text-white">
					{isSetup ? "계정 만들기" : "로그인"}
				</button>
			</Form>
		</main>
	);
}
