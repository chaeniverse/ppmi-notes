import { notFound } from "next/navigation";
import Header from "../../_components/Header";
import Markdown from "../../_components/Markdown";
import { getAllMeetings, getMeeting } from "../../../lib/meetings";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllMeetings().map((m) => ({ slug: m.slug }));
}

export default function MeetingPage({ params }) {
  const meeting = getMeeting(params.slug);
  if (!meeting) notFound();

  return (
    <>
      <Header backHref="/meetings" />
      <main className="container">
        <section className="page-intro">
          <h1>📝 {meeting.title}</h1>
          {meeting.date && <p>{meeting.date}</p>}
        </section>

        <article className="ref-body" style={{ border: "none", padding: 0 }}>
          <Markdown>{meeting.content}</Markdown>
        </article>

        <a className="back-link" href="/meetings">
          ← 회의록 목록
        </a>
      </main>
      <footer className="site-footer">
        <div className="container">기록은 비공개로 안전하게 저장됩니다.</div>
      </footer>
    </>
  );
}
