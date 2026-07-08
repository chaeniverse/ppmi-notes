import { Suspense } from "react";
import Header from "../_components/Header";
import IdeaStream from "../_components/IdeaStream";

export const dynamic = "force-dynamic";

export default function IdeasPage() {
  return (
    <>
      <Header backHref="/" />
      <main className="container">
        <Suspense fallback={<div className="empty">불러오는 중…</div>}>
          <IdeaStream />
        </Suspense>
      </main>
      <footer className="site-footer">
        <div className="container">기록은 비공개로 안전하게 저장됩니다.</div>
      </footer>
    </>
  );
}
