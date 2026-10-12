import { Outlet } from "react-router";

import { Footer } from "../components/footer";
import { Header } from "../components/header";

export default function SiteLayout() {
	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<main className="flex-1">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}
