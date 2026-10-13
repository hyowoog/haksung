import { Outlet } from "react-router";

import type { Route } from "./+types/site";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { getMember } from "../lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
	const { member } = await getMember(request);
	return { isLoggedIn: Boolean(member) };
}

export default function SiteLayout({ loaderData }: Route.ComponentProps) {
	return (
		<div className="flex min-h-screen flex-col">
			<Header isLoggedIn={loaderData.isLoggedIn} />
			<main className="flex-1">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}
