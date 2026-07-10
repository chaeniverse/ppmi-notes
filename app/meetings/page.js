import Header from "../_components/Header";
import { getAllMeetings } from "../../lib/meetings";

export const dynamic = "force-static";

export default function MeetingsPage() {
  const meetings = getAllMeetings();
  return (
    <>
      <Header backHref="/" />
      <main className="container">
        <section className="page-intro">
          <h1>📝 회의록</h1>
          <p>미팅·논의 기록. 최신순.</p>
        </section>

        {meetings.length === 0 ? (
          <div className="empty">아직 회의록이 없어요.</div>
        ) : (
          <div className="ref-list">
            {meetings.map((m) => (
              <a className="ref-card" key={m.slug} href={`/meetings/${m.slug}`}>
                <div className="ref-head">
                  <span className="ref-kind">📝</span>
                  <span className="ref-title">{m.title}</span>
                  <span className="tag">{m.date}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        <a className="back-link" href="/">
          ← 홈으로
        </a>
      </main>
      <footer className="site-footer">
        <div className="container">기록은 비공개로 안전하게 저장됩니다.</div>
      </footer>
    </>
  );
}
