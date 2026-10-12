import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** 관리자 계정. 비밀번호는 PBKDF2 해시만 저장한다. */
export const members = sqliteTable("members", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	username: text("username").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	name: text("name").notNull(),
	createdAt: text("created_at").notNull(),
});

/** 공지사항, 장학생수기, 갤러리 */
export const boards = sqliteTable("boards", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	slug: text("slug").notNull().unique(),
	name: text("name").notNull(),
	description: text("description").notNull().default(""),
	kind: text("kind").notNull(),
	pageSize: integer("page_size").notNull().default(10),
});

export const posts = sqliteTable(
	"posts",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		boardId: integer("board_id")
			.notNull()
			.references(() => boards.id),
		title: text("title").notNull(),
		author: text("author").notNull(),
		content: text("content").notNull().default(""),
		hit: integer("hit").notNull().default(0),
		createdAt: text("created_at").notNull(),
		updatedAt: text("updated_at").notNull(),
	},
	(table) => [index("posts_board_created_idx").on(table.boardId, table.createdAt)],
);

/** 첨부파일 원본은 R2(MY_BUCKET)에 두고, 여기에는 키와 표시 이름만 둔다. */
export const attachments = sqliteTable(
	"attachments",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		postId: integer("post_id")
			.notNull()
			.references(() => posts.id),
		originalName: text("original_name").notNull(),
		r2Key: text("r2_key").notNull(),
		size: integer("size").notNull(),
		contentType: text("content_type").notNull(),
	},
	(table) => [index("attachments_post_idx").on(table.postId)],
);

export const comments = sqliteTable(
	"comments",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		postId: integer("post_id")
			.notNull()
			.references(() => posts.id),
		author: text("author").notNull(),
		content: text("content").notNull(),
		createdAt: text("created_at").notNull(),
	},
	(table) => [index("comments_post_idx").on(table.postId)],
);

export const donors = sqliteTable("donors", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	amount: integer("amount"),
	donatedOn: text("donated_on"),
	note: text("note").notNull().default(""),
	isPublic: integer("is_public").notNull().default(1),
	createdAt: text("created_at").notNull(),
});
