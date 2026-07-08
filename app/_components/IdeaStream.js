"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PROJECTS, projectMeta } from "../../lib/projects";
import { krDateTime } from "../_lib/date";

// 아이디어(생각) 스트림. 최신이 위로 쌓인다. 갈래(project)로 필터.
export default function IdeaStream() {
  const params = useSearchParams();
  const initialProject = params.get("project") || "all";

  const [filter, setFilter] = useState(initialProject); // 'all' | project key
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [project, setProject] = useState(
    initialProject === "all" ? "general" : initialProject
  );
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = filter === "all" ? "" : `?project=${encodeURIComponent(filter)}`;
      const res = await fetch(`/api/ideas${q}`);
      const d = await res.json().catch(() => ({ ideas: [] }));
      setItems(d.ideas || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    if (!draft.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, content: draft.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "저장 실패");
      }
      const d = await res.json();
      // 현재 필터에 맞으면 즉시 목록 위에 추가
      if (filter === "all" || filter === d.idea.project) {
        setItems((prev) => [d.idea, ...prev]);
      }
      setDraft("");
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(id) {
    if (!editDraft.trim()) return;
    try {
      const res = await fetch(`/api/ideas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editDraft.trim() }),
      });
      if (!res.ok) throw new Error("수정 실패");
      const d = await res.json();
      setItems((prev) => prev.map((x) => (x.id === id ? d.idea : x)));
      setEditingId(null);
      setEditDraft("");
    } catch (e) {
      alert(String(e.message || e));
    }
  }

  async function remove(id) {
    if (!confirm("이 아이디어를 삭제할까요?")) return;
    try {
      const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제 실패");
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      alert(String(e.message || e));
    }
  }

  return (
    <>
      <section className="page-intro">
        <h1>💭 아이디어</h1>
        <p>떠오른 생각을 갈래별로 쌓아두세요.</p>
      </section>

      <div className="stream-add">
        <select
          className="capture-project"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        >
          {PROJECTS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.emoji} {p.title}
            </option>
          ))}
        </select>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="지금 떠오르는 아이디어를 적어보세요…"
          rows={3}
        />
        {error && <div className="add-error">{error}</div>}
        <div className="add-actions">
          <button className="btn-primary" onClick={add} disabled={saving || !draft.trim()}>
            {saving ? "저장 중…" : "기록 추가"}
          </button>
        </div>
      </div>

      <div className="chips">
        <button
          className={`chip ${filter === "all" ? "on" : ""}`}
          onClick={() => setFilter("all")}
        >
          전체
        </button>
        {PROJECTS.map((p) => (
          <button
            key={p.key}
            className={`chip ${filter === p.key ? "on" : ""}`}
            onClick={() => setFilter(p.key)}
          >
            {p.emoji} {p.title}
          </button>
        ))}
      </div>

      <div className="date-summary">
        <span>총 {items.length}개</span>
      </div>

      {loading ? (
        <div className="empty">불러오는 중…</div>
      ) : items.length === 0 ? (
        <div className="empty">아직 기록이 없어요. 위에 첫 생각을 적어보세요.</div>
      ) : (
        <div className="stream-list">
          {items.map((e) => (
            <div className="stream-card" key={e.id}>
              {editingId === e.id ? (
                <>
                  <textarea
                    className="edit-area"
                    value={editDraft}
                    onChange={(ev) => setEditDraft(ev.target.value)}
                    rows={5}
                    autoFocus
                  />
                  <div className="add-actions">
                    <button
                      className="btn-ghost"
                      onClick={() => {
                        setEditingId(null);
                        setEditDraft("");
                      }}
                    >
                      취소
                    </button>
                    <button className="btn-primary" onClick={() => saveEdit(e.id)} disabled={!editDraft.trim()}>
                      저장
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="stream-content">{e.content}</div>
                  <div className="answer-meta">
                    <span>
                      <span className="tag">
                        {projectMeta(e.project).emoji} {projectMeta(e.project).title}
                      </span>
                      {" · "}
                      {krDateTime(e.created_at)}
                    </span>
                    <span className="answer-actions">
                      <button
                        className="answer-edit"
                        onClick={() => {
                          setEditingId(e.id);
                          setEditDraft(e.content);
                        }}
                      >
                        수정
                      </button>
                      <button className="answer-del" onClick={() => remove(e.id)}>
                        삭제
                      </button>
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <a className="back-link" href="/">
        ← 홈으로
      </a>
    </>
  );
}
