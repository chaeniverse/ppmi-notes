import { NextResponse } from "next/server";
import { sql, ensureTable } from "../../../../lib/db";
import { normalizeProject, normalizeKind } from "../../../../lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PATCH /api/refs/:id  body: { title?, url?, body?, project?, kind? }
export async function PATCH(request, { params }) {
  try {
    await ensureTable();
    const id = params.id;
    const b = await request.json();

    const title = b?.title != null ? String(b.title).trim() : null;
    const url = b?.url != null ? String(b.url).trim() || null : undefined;
    const text = b?.body != null ? String(b.body) : null;
    const project = b?.project != null ? normalizeProject(b.project) : null;
    const kind = b?.kind != null ? normalizeKind(b.kind) : null;

    if (title !== null && !title) {
      return NextResponse.json({ error: "제목이 비어 있습니다." }, { status: 400 });
    }

    const r = await sql`
      UPDATE refs
      SET title      = COALESCE(${title}, title),
          url        = CASE WHEN ${url === undefined}::boolean THEN url ELSE ${url === undefined ? null : url} END,
          body       = COALESCE(${text}, body),
          project    = COALESCE(${project}, project),
          kind       = COALESCE(${kind}, kind),
          updated_at = now()
      WHERE id = ${id}
      RETURNING id, project, kind, title, url, body, created_at, updated_at;
    `;
    if (r.rows.length === 0) {
      return NextResponse.json({ error: "없는 항목입니다." }, { status: 404 });
    }
    return NextResponse.json({ ref: r.rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}

// DELETE /api/refs/:id
export async function DELETE(request, { params }) {
  try {
    await ensureTable();
    await sql`DELETE FROM refs WHERE id = ${params.id};`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
