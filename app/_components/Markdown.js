"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// 논문 요약·코드 스니펫 등 마크다운 본문을 렌더링.
export default function Markdown({ children }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children || ""}</ReactMarkdown>
    </div>
  );
}
