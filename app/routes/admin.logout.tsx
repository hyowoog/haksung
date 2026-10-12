import { redirect } from "react-router";

import type { Route } from "./+types/admin.logout";
import { destroySession, readSession } from "../lib/session.server";

export async function action({ request }: Route.ActionArgs) {
	const session = await readSession(request);
	return redirect("/admin/login", {
		headers: { "Set-Cookie": await destroySession(session) },
	});
}

export async function loader() {
	return redirect("/admin/login");
}
