// 날짜 유틸 (로컬 기준)
export function krDate(iso) {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${y}년 ${m}월 ${day}일`;
  } catch {
    return "";
  }
}

export function krTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function krDateTime(iso) {
  return `${krDate(iso)} · ${krTime(iso)}`;
}
