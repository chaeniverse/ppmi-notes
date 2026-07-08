import { NextResponse } from "next/server";
import { sql, ensureTable } from "../../../lib/db";
import { normalizeProject, normalizeKind } from "../../../lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/refs                    → 모든 자료 (최신순)
// GET /api/refs?project=generative → 그 갈래만
// GET /api/refs?kind=paper         → 그 종류만
export async function GET(request) {
  try {
    await ensureTable();
    const project = request.nextUrl.searchParams.get("project");
    const kind = request.nextUrl.searchParams.get("kind");

    const r = await sql`
      SELECT id, project, kind, title, url, body, created_at, updated_at
      FROM refs
      WHERE (${project === null}::boolean OR project = ${project ? normalizeProject(project) : ""})
        AND (${kind === null}::boolean OR kind = ${kind ? normalizeKind(kind) : ""})
      ORDER BY created_at DESC;
    `;
    return NextResponse.json({ refs: r.rows });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}

// POST /api/refs  body: { project, kind, title, url, body }
export async function POST(request) {
  try {
    await ensureTable();
    const body = await request.json();
    const title = (body?.title || "").trim();
    const project = normalizeProject(body?.project);
    const kind = normalizeKind(body?.kind);
    const url = (body?.url || "").trim() || null;
    const text = body?.body || "";

    if (!title) {
      return NextResponse.json({ error: "제목이 비어 있습니다." }, { status: 400 });
    }

    const r = await sql`
      INSERT INTO refs (project, kind, title, url, body)
      VALUES (${project}, ${kind}, ${title}, ${url}, ${text})
      RETURNING id, project, kind, title, url, body, created_at, updated_at;
    `;
    return NextResponse.json({ ref: r.rows[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
