import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";

import { foundation, menus } from "../content/site";
import { Button } from "./ui/button";

export function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
	const [isOpen, setIsOpen] = useState(false);
	const location = useLocation();

	useEffect(() => {
		setIsOpen(false);
	}, [location.pathname]);

	return (
		<header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
				<Link to="/" className="flex items-center gap-2 text-brand">
					<img src="/images/logo.png" alt="" className="h-8 w-auto" />
					<span className="font-serif text-lg font-bold tracking-tight md:text-xl">
						{foundation.name}
					</span>
				</Link>
				<button
					type="button"
					className="rounded border border-slate-300 px-3 py-2 text-sm md:hidden"
					aria-expanded={isOpen}
					onClick={() => setIsOpen((open) => !open)}
				>
					메뉴
				</button>
				<nav className="hidden items-center gap-1 md:flex">
					{menus.map((menu) => (
						<div key={menu.key} className="group relative">
							<NavLink
								to={menu.href}
								className={({ isActive }) =>
									`block px-3 py-2 text-sm ${isActive ? "font-semibold text-brand" : "text-slate-700 hover:text-brand"}`
								}
							>
								{menu.label}
							</NavLink>
							<div className="invisible absolute left-0 top-full z-20 min-w-44 rounded border border-slate-200 bg-white py-1 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
								{menu.items.map((item) => (
									<NavLink
										key={item.href}
										to={item.href}
										end
										className="block px-4 py-2 text-sm text-slate-700 hover:bg-brand-soft hover:text-brand"
									>
										{item.label}
									</NavLink>
								))}
							</div>
						</div>
					))}
					
					<Button asChild variant="ghost" size="sm">
						{isLoggedIn ? <Link to="/admin">관리자모드</Link> : <Link to="/admin/login">로그인</Link>}
					</Button>
				</nav>
			</div>
			{isOpen ? (
				<nav className="border-t border-slate-200 px-4 py-3 md:hidden">
					{menus.map((menu) => (
						<div key={menu.key} className="mb-3">
							<p className="mb-1 text-xs font-semibold tracking-wide text-brand">{menu.label}</p>
							{menu.items.map((item) => (
								<NavLink key={item.href} to={item.href} end className="block py-1.5 text-sm text-slate-700">
									{item.label}
								</NavLink>
							))}
						</div>
					))}
				</nav>
			) : null}
		</header>
	);
}
