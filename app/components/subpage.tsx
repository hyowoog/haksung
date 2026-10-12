import type { ReactNode } from "react";
import { NavLink } from "react-router";

import { menus } from "../content/site";

interface SubpageProps {
	section: string;
	title: string;
	children: ReactNode;
}

export function Subpage({ section, title, children }: SubpageProps) {
	const menu = menus.find((item) => item.key === section);

	return (
		<div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-[220px_minmax(0,1fr)]">
			<aside>
				<div className="overflow-hidden rounded border border-slate-200 bg-white">
					<p className="bg-brand px-4 py-5 text-center font-serif text-xl text-white">{menu?.label}</p>
					<ul>
						{menu?.items.map((item) => (
							<li key={item.href} className="border-t border-slate-200">
								<NavLink
									to={item.href}
									end
									className={({ isActive }) =>
										`block px-4 py-3 text-sm ${isActive ? "bg-brand-soft font-semibold text-brand" : "text-slate-700 hover:bg-slate-50"}`
									}
								>
									{item.label}
								</NavLink>
							</li>
						))}
					</ul>
				</div>
			</aside>
			<section className="min-w-0 rounded border border-slate-200 bg-white p-5 md:p-8">
				<header className="mb-6 flex flex-col gap-1 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
					<h1 className="font-serif text-2xl text-slate-900">{title}</h1>
					<p className="text-sm text-brand">
						Home &gt; {menu?.label} &gt; {title}
					</p>
				</header>
				{children}
			</section>
		</div>
	);
}
