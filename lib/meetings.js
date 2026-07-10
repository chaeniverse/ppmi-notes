import fs from "fs";
import path from "path";

// 회의록은 meetings/ 폴더의 .md 파일들. 빌드 시 읽어 정적 페이지로 렌더.
// 파일명 규칙: YYYY-MM-DD-<slug>.md  (예: 2026-06-11-datscan.md)
const DIR = path.join(process.cwd(), "meetings");

function titleFrom(raw, slug, date) {
  const h = /^#\s+(.+)$/m.exec(raw);
  if (h) return h[1].trim();
  const rest = slug.replace(/^\d{4}-\d{2}-\d{2}-?/, "").replace(/[-_]/g, " ").trim();
  return rest || date || slug;
}

export function getAllMeetings() {
  if (!fs.existsSync(DIR)) return [];
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".md"));
  const items = files.map((f) => {
    const slug = f.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(DIR, f), "utf8");
    const m = /^(\d{4}-\d{2}-\d{2})/.exec(slug);
    const date = m ? m[1] : "";
    return { slug, date, title: titleFrom(raw, slug, date), content: raw };
  });
  items.sort((a, b) => b.slug.localeCompare(a.slug));
  return items;
}

export function getMeeting(slug) {
  return getAllMeetings().find((m) => m.slug === slug) || null;
}
