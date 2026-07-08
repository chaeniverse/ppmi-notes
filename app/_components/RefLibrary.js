"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PROJECTS, REF_KINDS, projectMeta, kindMeta } from "../../lib/projects";
import { krDate } from "../_lib/date";
import Markdown from "./Markdown";

// 자료 라이브러리. 논문/코드/링크를 저장하고 펼쳐 읽는다.
export default function RefLibrary() {
  const params = useSearchParams();
  const initialProject = params.get("project") || "all";
  const initialKind = params.get("kind") || "all";

  const [projFilter, setProjFilter] = useState(initialProject);
  const [kindFilter, setKindFilter] = useState(initialKind);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    project: initialProject === "all" ? "general" : initialProject,
    kind: "paper",
    title: "",
    url: "",
    body: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = [];
      if (projFilter !== "all") qs.push(`project=${encodeURIComponent(projFilter)}`);
      if (kindFilter !== "all") qs.push(`kind=${encodeURIComponent(kindFilter)}`);
      const res = await fetch(`/api/refs${qs.length ? "?" + qs.join("&") : ""}`);
      const d = await res.json().catch(() => ({ refs: [] }));
      setItems(d.refs || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [projFilter, kindFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    if (!form.title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/refs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "저장 실패");
      }
      const d = await res.json();
      setItems((prev) => [d.ref, ...prev]);
      setForm({ ...form, title: "", url: "", body: "" });
      setShowForm(false);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("이 자료를 삭제할까요?")) return;
    try {
      const res = await fetch(`/api/refs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제 실패");
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      alert(String(e.message || e));
    }
  }

  return (
    <>
      <section className="page-intro">
        <h1>📚 자료</h1>
        <p>저장한 논문·코드·링크를 모아 읽어요.</p>
      </section>

      <div className="add-actions" style={{ marginBottom: 12 }}>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "닫기" : "+ 자료 추가"}
        </button>
      </div>

      {showForm && (
        <div className="stream-add">
          <div className="form-row">
            <select
              className="capture-project"
              value={form.project}
              onChange={(e) => setForm({ ...form, project: e.target.value })}
            >
              {PROJECTS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.emoji} {p.title}
                </option>
              ))}
            </select>
            <select
              className="capture-project"
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value })}
            >
              {REF_KINDS.map((k) => (
                <option key={k.key} value={k.key}>
                  {k.emoji} {k.label}
                </option>
              ))}
            </select>
          </div>
          <input
            className="text-input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="제목"
          />
          <input
            className="text-input"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="URL (선택)"
          />
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="메모 · 요약 · 코드 스니펫 (마크다운 지원)"
            rows={5}
          />
          {error && <div className="add-error">{error}</div>}
          <div className="add-actions">
            <button className="btn-primary" onClick={add} disabled={saving || !form.title.trim()}>
              {saving ? "저장 중…" : "저장"}
            </button>
          </div>
        </div>
      )}

      <div className="chips">
        <button className={`chip ${kindFilter === "all" ? "on" : ""}`} onClick={() => setKindFilter("all")}>
          전체
        </button>
        {REF_KINDS.map((k) => (
          <button
            key={k.key}
            className={`chip ${kindFilter === k.key ? "on" : ""}`}
            onClick={() => setKindFilter(k.key)}
          >
            {k.emoji} {k.label}
          </button>
        ))}
      </div>

      <div className="chips">
        <button className={`chip ${projFilter === "all" ? "on" : ""}`} onClick={() => setProjFilter("all")}>
          전체
        </button>
        {PROJECTS.map((p) => (
          <button
            key={p.key}
            className={`chip ${projFilter === p.key ? "on" : ""}`}
            onClick={() => setProjFilter(p.key)}
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
        <div className="empty">아직 저장한 자료가 없어요. 위 버튼으로 추가하세요.</div>
      ) : (
        <div className="ref-list">
          {items.map((r) => (
            <div className="ref-card" key={r.id}>
              <div
                className="ref-head"
                onClick={() => setOpenId(openId === r.id ? null : r.id)}
              >
                <span className="ref-kind">{kindMeta(r.kind).emoji}</span>
                <span className="ref-title">{r.title}</span>
                <span className="tag">{projectMeta(r.project).emoji}</span>
              </div>
              {openId === r.id && (
                <div className="ref-body">
                  {r.url && (
                    <a className="ref-url" href={r.url} target="_blank" rel="noreferrer">
                      🔗 원문 열기
                    </a>
                  )}
                  {r.body ? <Markdown>{r.body}</Markdown> : <p className="muted">메모 없음</p>}
                  <div className="answer-meta">
                    <span>{krDate(r.created_at)}</span>
                    <span className="answer-actions">
                      <button className="answer-del" onClick={() => remove(r.id)}>
                        삭제
                      </button>
                    </span>
                  </div>
                </div>
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
