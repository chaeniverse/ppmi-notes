import { createPool } from "@vercel/postgres";
import { SEED_REFS } from "./seed";

// 풀을 '지연 생성'한다. 모듈 로드(빌드) 시점엔 만들지 않아서
// 연결문자열이 없어도 빌드가 깨지지 않는다. 실제 쿼리 때 처음 만든다.
let pool;
function getPool() {
  if (!pool) {
    const connectionString =
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.POSTGRES_URL_NON_POOLING ||
      undefined;
    pool = createPool(connectionString ? { connectionString } : {});
  }
  return pool;
}

// 태그드 템플릿(sql`...`)을 그대로 쓸 수 있도록 풀의 sql로 전달.
export function sql(strings, ...values) {
  return getPool().sql(strings, ...values);
}

let initialized = false;

// 테이블을 (없으면) 만든다. 첫 요청 때 한 번 실행.
export async function ensureTable() {
  if (initialized) return;

  // ── 아이디어(생각) 스트림 ──
  // 걸어다니며 떠오른 연구 아이디어를 빠르게 쌓아두는 곳.
  // project: 어느 갈래인지 (lib/projects.js 의 key), 없으면 'general'
  await sql`
    CREATE TABLE IF NOT EXISTS ideas (
      id          BIGSERIAL PRIMARY KEY,
      project     TEXT NOT NULL DEFAULT 'general',
      content     TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_ideas_project ON ideas (project);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_ideas_created ON ideas (created_at DESC);`;

  // ── 자료 라이브러리 (논문 / 코드 / 링크) ──
  // 저장해둔 논문·코드 스니펫·링크를 모아 읽는 곳.
  // kind: 'paper' | 'code' | 'link'
  // body: 마크다운 (요약, 코드 스니펫, 메모 등)
  await sql`
    CREATE TABLE IF NOT EXISTS refs (
      id          BIGSERIAL PRIMARY KEY,
      project     TEXT NOT NULL DEFAULT 'general',
      kind        TEXT NOT NULL DEFAULT 'paper',
      title       TEXT NOT NULL,
      url         TEXT,
      body        TEXT NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_refs_project ON refs (project);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_refs_kind ON refs (kind);`;

  // ── 초기 자료 시드 (배포 시 1회 삽입, marker 로 중복 방지) ──
  await sql`
    CREATE TABLE IF NOT EXISTS migrations (
      name    TEXT PRIMARY KEY,
      done_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  for (const s of SEED_REFS) {
    const claim = await sql`
      INSERT INTO migrations (name) VALUES (${s.marker})
      ON CONFLICT (name) DO NOTHING
      RETURNING name;
    `;
    if (claim.rows.length > 0) {
      try {
        await sql`
          INSERT INTO refs (project, kind, title, url, body)
          VALUES (${s.project}, ${s.kind}, ${s.title}, ${s.url}, ${s.body});
        `;
      } catch (e) {
        // 실패하면 다음 배포에서 재시도할 수 있도록 marker 제거
        await sql`DELETE FROM migrations WHERE name = ${s.marker};`;
        throw e;
      }
    }
  }

  initialized = true;
}
