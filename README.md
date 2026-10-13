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
- R2 바인딩 `MY_BUCKET`: 게시글 첨부파일, 후원금현황 이미지(`stats/연도/`)

원격 D1(`haksung`)과 R2 버킷(`haksung`)은 만들어 두었고 `wrangler.jsonc`에 연결돼 있습니다. 로컬 개발 DB는 `preview_database_id`로 기존 로컬 데이터를 그대로 씁니다.

```bash
npm run db:migrate:remote   # 새 마이그레이션이 생길 때마다
npm run db:seed:remote      # 게시판 기본 데이터 (중복 실행해도 안전)
npx wrangler secret put SESSION_SECRET   # 최초 배포 전 1회, 32자 이상 임의 문자열
npm run deploy
```
