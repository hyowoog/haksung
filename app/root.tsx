import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { foundation } from "./content/site";

export const links: Route.LinksFunction = () => [
	{ rel: "icon", href: "/images/logo.png", type: "image/png" },
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@500;600;700&display=swap",
	},
];

export function meta() {
	return [{ name: "naver-site-verification", content: foundation.naverVerification }];
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ko">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="min-h-screen bg-paper text-ink antialiased">
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "오류가 발생했습니다";
	let details = "잠시 후 다시 시도해 주세요.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "페이지를 찾을 수 없습니다" : "오류가 발생했습니다";
		details = error.status === 404 ? "요청하신 주소의 페이지가 없습니다." : error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="mx-auto max-w-3xl px-4 py-24">
			<h1 className="font-serif text-3xl text-brand">{message}</h1>
			<p className="mt-3 text-slate-600">{details}</p>
			{stack ? (
				<pre className="mt-6 overflow-x-auto rounded bg-slate-900 p-4 text-xs text-slate-100">
					<code>{stack}</code>
				</pre>
			) : null}
		</main>
	);
}
