# 재단법인 학성장학회

기존 `public_html` 사이트를 Cloudflare Workers, D1, R2, React Router, Drizzle, Tailwind CSS로 옮긴 프로젝트입니다.

## 로컬 실행

```bash
cp .dev.vars.example .dev.vars
npm install
npm run db:setup
npm run dev
```

최초 접속 시 `/admin/login`에서 관리자 계정을 만듭니다. 계정이 없을 때만 등록 화면이 열립니다.

## 데이터

- D1 바인딩 `DB`: 게시판, 댓글, 후원자, 관리자
- R2 바인딩 `MY_BUCKET`: 게시글 첨부파일

배포 전에 원격 데이터베이스와 버킷을 만들고 `wrangler.jsonc`의 `database_id`를 실제 값으로 바꾼 뒤, 세션 키를 시크릿으로 넣습니다.

```bash
npx wrangler d1 create haksung
npx wrangler r2 bucket create haksung
npx wrangler d1 migrations apply DB --remote
npx wrangler d1 execute DB --remote --file=./seed.sql
npx wrangler secret put SESSION_SECRET
npm run deploy
```
