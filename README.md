# PPMI Notes

PPMI · DaTScan 생성/예측 연구용 개인 노트 웹앱.
걸어다니며 떠오른 **아이디어를 빠르게 메모**하고, 저장한 **논문·코드·링크를 꺼내 읽는다**.
Vercel + Vercel Postgres(Neon)로 여러 기기에서 실시간 동기화.

`daily-scrap`, `usa-phd`와 동일한 스택: Next.js 14 (App Router, JS) + `@vercel/postgres` + 미들웨어 비밀번호 잠금.

## 구조

```
ppmi-notes/
├─ app/
│  ├─ page.js              홈: 빠른 메모 + 바로가기 + 연구 갈래 타일
│  ├─ ideas/page.js        아이디어 스트림
│  ├─ refs/page.js         자료 라이브러리 (논문/코드/링크)
│  ├─ login/page.js        비밀번호 로그인
│  ├─ layout.js  globals.css  icon.svg
│  ├─ _components/         Header, QuickCapture, IdeaStream, RefLibrary, Markdown
│  ├─ _lib/date.js         날짜 유틸
│  └─ api/
│     ├─ ideas/route.js        GET(목록)·POST(추가)
│     ├─ ideas/[id]/route.js   PATCH(수정)·DELETE
│     ├─ refs/route.js         GET·POST
│     ├─ refs/[id]/route.js    PATCH·DELETE
│     ├─ login/route.js  logout/route.js
├─ lib/
│  ├─ db.js               Vercel Postgres 풀 + ensureTable()
│  ├─ auth.js             비밀번호/쿠키
│  └─ projects.js         연구 갈래·자료 종류 정의  ← 여기만 고치면 메뉴 확장
├─ middleware.js          로그인 안 하면 /login 으로
├─ dev.command            더블클릭 → 로컬 미리보기
├─ publish.command        더블클릭 → GitHub push → Vercel 자동 배포
└─ vercel.json
```

## 데이터 모델 (Postgres)

- `ideas` — 아이디어 스트림: `id, project, content, created_at, updated_at`
- `refs`  — 자료: `id, project, kind('paper'|'code'|'link'), title, url, body(markdown), created_at, updated_at`

테이블은 첫 요청 때 `ensureTable()`이 자동 생성한다. 별도 마이그레이션 불필요.

## 로컬 실행

```bash
npm install
npm run dev        # http://localhost:3000  (비밀번호 기본값 940202)
```

또는 `dev.command` 더블클릭.

## 배포 (Vercel)

1. 이 폴더를 GitHub 새 repo로 push.
2. Vercel에서 New Project → 이 repo 선택.
3. Storage → Postgres(Neon) 생성 후 프로젝트에 연결하면 `POSTGRES_URL`(또는 `DATABASE_URL`)이 자동 주입됨. `lib/db.js`가 두 이름 모두 폴백 처리.
4. (선택) 환경변수 `APP_PASSWORD`로 비밀번호 변경.
5. 이후 `publish.command` 더블클릭 → push → 자동 재배포.

## 확장 포인트

- **연구 갈래 추가**: `lib/projects.js`의 `PROJECTS`에 항목 추가.
- **자료 종류 추가**: 같은 파일 `REF_KINDS`에 추가.
- 태그·검색·PDF 첨부 등은 이 뼈대 위에 라우트/컬럼만 늘리면 된다.
