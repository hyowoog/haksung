import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn 컴포넌트에서 클래스 충돌을 정리할 때 사용한다. */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
