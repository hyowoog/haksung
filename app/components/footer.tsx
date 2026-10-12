import { foundation, partnerLinks } from "../content/site";

export function Footer() {
	return (
		<footer className="mt-auto border-t border-slate-200 bg-white">
			<div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-3 text-brand">
					<img src="/images/logo.png" alt="" className="h-10 w-auto" />
					<p className="font-serif text-lg font-semibold">{foundation.name}</p>
				</div>
				<p className="text-sm leading-6 text-slate-600">
					{foundation.address}
					<br />
					대표전화 {foundation.phone} · 팩스 {foundation.fax}
					<br />
					Copyright © {new Date().getFullYear()} Haksung Scholarship Foundation.
				</p>
				<div className="flex items-center gap-3">
					{partnerLinks.map((link) => (
						<a key={link.href} href={link.href} target="_blank" rel="noreferrer">
							<img src={link.image} alt={link.label} className="h-10 w-auto" />
						</a>
					))}
				</div>
			</div>
		</footer>
	);
}
