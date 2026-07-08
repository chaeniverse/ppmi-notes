"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const next = params.get("next") || "/";
        router.replace(next);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "비밀번호가 틀렸습니다.");
      }
    } catch {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-card" onSubmit={handleSubmit}>
      <div className="login-logo">🧠</div>
      <h1>PPMI Notes</h1>
      <p>비공개 연구 노트입니다. 비밀번호를 입력하세요.</p>
      <input
        type="password"
        inputMode="numeric"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        aria-label="비밀번호"
      />
      {error && <div className="login-error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? "확인 중…" : "들어가기"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="login-wrap">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
