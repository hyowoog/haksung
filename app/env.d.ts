/** .dev.vars 와 wrangler secret 으로 주입하는 세션 서명 키 */
declare global {
	interface Env {
		SESSION_SECRET: string;
	}
}

export {};
