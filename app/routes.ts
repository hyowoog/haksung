import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
	layout("routes/site.tsx", [
		index("routes/home.tsx"),
		route("about/greeting", "routes/about.greeting.tsx"),
		route("about/history", "routes/about.history.tsx"),
		route("about/directors", "routes/about.directors.tsx"),
		route("scholarship/guide", "routes/scholarship.guide.tsx"),
		route("scholarship/selection", "routes/scholarship.selection.tsx"),
		route("support", "routes/support.tsx"),
		route("support/donors", "routes/support.donors.tsx"),
		route("support/stats", "routes/support.stats.tsx"),
		route("board/:slug", "routes/board.tsx"),
		route("board/:slug/:id", "routes/board-post.tsx"),
	]),
	route("admin/login", "routes/admin.login.tsx"),
	route("admin/logout", "routes/admin.logout.tsx"),
	layout("routes/admin.tsx", [
		route("admin", "routes/admin.home.tsx"),
		route("admin/posts/new", "routes/admin.post-new.tsx"),
		route("admin/posts/:id", "routes/admin.post-edit.tsx"),
		route("admin/donors", "routes/admin.donors.tsx"),
	]),
] satisfies RouteConfig;
