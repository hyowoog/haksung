import { Calendar, HeartHandshake, Users, type LucideIcon } from "lucide-react";

const icons = {
	IconHeartHandshake: HeartHandshake,
	IconCalendar: Calendar,
	IconUsers: Users,
} satisfies Record<string, LucideIcon>;

export type MenuIconName = keyof typeof icons;

/** 메뉴에 지정한 이름의 Lucide 아이콘을 그린다. */
export function Icon({ name, className }: { name?: MenuIconName; className?: string }) {
	if (!name) return null;
	const LucideIcon = icons[name];
	return <LucideIcon className={className} aria-hidden="true" />;
}
