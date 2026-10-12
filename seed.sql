INSERT INTO boards (slug, name, description, kind, page_size)
VALUES
	('notice', '공지사항', '재단의 공지와 안내를 올립니다.', 'list', 10),
	('story', '장학생수기', '장학생이 전하는 이야기입니다.', 'list', 10),
	('gallery', '갤러리', '장학사업과 재단 활동 사진입니다.', 'gallery', 12)
ON CONFLICT(slug) DO NOTHING;

INSERT INTO posts (board_id, title, author, content, hit, created_at, updated_at)
SELECT
	id,
	'홈페이지를 새롭게 열었습니다',
	'학성장학회',
	'재단법인 학성장학회 홈페이지를 새 환경으로 옮겼습니다. 장학사업과 후원 안내는 이 사이트에서 확인하실 수 있습니다.',
	0,
	datetime('now'),
	datetime('now')
FROM boards
WHERE slug = 'notice'
	AND NOT EXISTS (
		SELECT 1
		FROM posts
		JOIN boards AS notice_board ON posts.board_id = notice_board.id
		WHERE notice_board.slug = 'notice'
			AND posts.title = '홈페이지를 새롭게 열었습니다'
	);
