interface RuleSection {
	title: string;
	items: string[];
}

export function RuleList({ heading, sections }: { heading: string; sections: RuleSection[] }) {
	return (
		<div className="space-y-8">
			<h2 className="font-serif text-xl text-brand">{heading}</h2>
			{sections.map((section) => (
				<section key={section.title}>
					<h3 className="mb-3 inline-block bg-brand px-3 py-1 text-sm text-white">{section.title}</h3>
					<ul className="space-y-2 text-sm leading-7 text-slate-700">
						{section.items.map((item) => (
							<li key={item}>{item}</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
}
