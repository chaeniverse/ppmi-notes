import { NextResponse } from "next/server";
import { sql, ensureTable } from "../../../lib/db";
import { normalizeProject } from "../../../lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/ideas                 → 모든 아이디어 (최신순)
// GET /api/ideas?project=generative → 그 갈래만
export async function GET(request) {
  try {
    await ensureTable();
    const project = request.nextUrl.searchParams.get("project");

    let rows;
    if (project) {
      const r = await sql`
        SELECT id, project, content, created_at, updated_at
        FROM ideas
        WHERE project = ${normalizeProject(project)}
        ORDER BY created_at DESC;
      `;
      rows = r.rows;
    } else {
      const r = await sql`
        SELECT id, project, content, created_at, updated_at
        FROM ideas
        ORDER BY created_at DESC;
      `;
      rows = r.rows;
    }
    return NextResponse.json({ ideas: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}

// POST /api/ideas  body: { project, content }
export async function POST(request) {
  try {
    await ensureTable();
    const body = await request.json();
    const content = (body?.content || "").trim();
    const project = normalizeProject(body?.project);

    if (!content) {
      return NextResponse.json({ error: "내용이 비어 있습니다." }, { status: 400 });
    }

    const r = await sql`
      INSERT INTO ideas (project, content)
      VALUES (${project}, ${content})
      RETURNING id, project, content, created_at, updated_at;
    `;
    return NextResponse.json({ idea: r.rows[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
