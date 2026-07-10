import Header from "./_components/Header";
import QuickCapture from "./_components/QuickCapture";
import { PROJECTS } from "../lib/projects";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="container">
        <section className="page-intro">
          <h1>🧠 PPMI Notes</h1>
          <p>걸어다니며 떠오른 연구 아이디어를 적고, 저장한 논문·코드를 꺼내 읽는 개인 노트.</p>
        </section>

        <QuickCapture />

        <div className="section-label">바로가기</div>
        <div className="tiles">
          <a className="tile" href="/ideas">
            <span className="tile-emoji">💭</span>
            <span className="tile-title">아이디어</span>
            <span className="tile-sub">떠오른 생각 스트림</span>
          </a>
          <a className="tile" href="/refs">
            <span className="tile-emoji">📚</span>
            <span className="tile-title">자료</span>
            <span className="tile-sub">논문 · 코드 · 링크</span>
          </a>
          <a className="tile" href="/meetings">
            <span className="tile-emoji">📝</span>
            <span className="tile-title">회의록</span>
            <span className="tile-sub">미팅 · 논의 기록</span>
          </a>
        </div>

        <div className="section-label">연구 갈래</div>
        <div className="tiles">
          {PROJECTS.map((p) => (
            <a className="tile" key={p.key} href={`/ideas?project=${p.key}`}>
              <span className="tile-emoji">{p.emoji}</span>
              <span className="tile-title">{p.title}</span>
              <span className="tile-sub">{p.subtitle}</span>
            </a>
          ))}
        </div>
      </main>

      <footer className="site-footer">
        <div className="container">기록은 비공개로 안전하게 저장됩니다.</div>
      </footer>
    </>
  );
}
