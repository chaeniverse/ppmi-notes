"use client";

import { useState } from "react";
import { PROJECTS } from "../../lib/projects";

// 홈 화면의 '빠른 아이디어 메모'. 걸어다니며 바로 적어 저장.
export default function QuickCapture() {
  const [project, setProject] = useState("general");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!content.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, content: content.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "저장 실패");
      }
      setContent("");
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="capture">
      <div className="capture-row">
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
        <a className="capture-all" href="/ideas">
          전체 보기 →
        </a>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="지금 떠오른 아이디어를 적어보세요…"
        rows={3}
      />
      {error && <div className="add-error">{error}</div>}
      <div className="add-actions">
        {done && <span className="saved-hint">저장됨 ✓</span>}
        <button className="btn-primary" onClick={save} disabled={saving || !content.trim()}>
          {saving ? "저장 중…" : "메모 저장"}
        </button>
      </div>
    </section>
  );
}
