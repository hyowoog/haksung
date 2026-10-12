import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

/** D1 바인딩(env.DB)으로 Drizzle 클라이언트를 만든다. */
export function getDb() {
	return drizzle(env.DB, { schema });
}
