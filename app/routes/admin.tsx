import { Form, Link, Outlet } from "react-router";

import type { Route } from "./+types/admin";
import { requireMember } from "../lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
	const { member } = await requireMember(request);
	return { member };
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
	return (
		<div className="min-h-screen bg-slate-100">
			<header className="border-b border-slate-200 bg-white">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
					<div>
						<p className="text-xs text-slate-500">관리자</p>
						<p className="font-medium">{loaderData.member.name}</p>
					</div>
					<nav className="flex items-center gap-4 text-sm">
						<Link to="/admin">글</Link>
						<Link to="/admin/donors">후원자</Link>
						<Link to="/admin/stats">후원금현황</Link>
						<Link to="/">사이트로</Link>
						<Form method="post" action="/admin/logout">
							<button type="submit" className="text-slate-500">
								로그아웃
							</button>
						</Form>
					</nav>
				</div>
			</header>
			<main className="mx-auto max-w-5xl px-4 py-8">
				<Outlet />
			</main>
		</div>
	);
}
