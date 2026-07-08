import { NextResponse } from "next/server";
import { sql, ensureTable } from "../../../../lib/db";
import { normalizeProject } from "../../../../lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PATCH /api/ideas/:id  body: { content?, project? }
export async function PATCH(request, { params }) {
  try {
    await ensureTable();
    const id = params.id;
    const body = await request.json();
    const content = body?.content != null ? String(body.content).trim() : null;
    const project = body?.project != null ? normalizeProject(body.project) : null;

    if (content !== null && !content) {
      return NextResponse.json({ error: "내용이 비어 있습니다." }, { status: 400 });
    }

    const r = await sql`
      UPDATE ideas
      SET content    = COALESCE(${content}, content),
          project    = COALESCE(${project}, project),
          updated_at = now()
      WHERE id = ${id}
      RETURNING id, project, content, created_at, updated_at;
    `;
    if (r.rows.length === 0) {
      return NextResponse.json({ error: "없는 항목입니다." }, { status: 404 });
    }
    return NextResponse.json({ idea: r.rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}

// DELETE /api/ideas/:id
export async function DELETE(request, { params }) {
  try {
    await ensureTable();
    await sql`DELETE FROM ideas WHERE id = ${params.id};`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
