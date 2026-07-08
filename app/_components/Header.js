"use client";

import { useRouter } from "next/navigation";

// 공통 상단바. brand(왼쪽) + 뒤로/잠그기(오른쪽).
export default function Header({ title = "PPMI Notes", emoji = "🧠", backHref, showRepos = false }) {
  const router = useRouter();

  async function lock() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="site-header">
      <div className="container">
        <a className="brand" href="/">
          <span className="brand-mark">{emoji}</span>
          <span>{title}</span>
        </a>
        <div className="head-actions">
          {backHref && (
            <a className="repo-link" href={backHref}>
              뒤로
            </a>
          )}
          {showRepos && (
            <>
              <a
                className="repo-link external"
                href="https://github.com/chaeniverse/PPMI_GEN"
                target="_blank"
                rel="noreferrer"
              >
                GEN
              </a>
              <a
                className="repo-link external"
                href="https://github.com/chaeniverse/cwdm"
                target="_blank"
                rel="noreferrer"
              >
                cwdm
              </a>
            </>
          )}
          <button className="repo-link" onClick={lock}>
            잠그기
          </button>
        </div>
      </div>
    </header>
  );
}
