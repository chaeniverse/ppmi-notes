// 연구 갈래(프로젝트) 정의. 새 갈래를 추가하려면 여기에만 추가하면 된다.
// key 는 DB의 ideas.project / refs.project 에 저장되는 값.
export const PROJECTS = [
  {
    key: "generative",
    emoji: "🧬",
    title: "생성 모델",
    subtitle: "DaTScan 합성 · cWDM · 웨이블릿 디퓨전",
  },
  {
    key: "predictive",
    emoji: "📈",
    title: "예측 모델",
    subtitle: "진행 예측 · UPDRS/H&Y · Δt horizon",
  },
  {
    key: "data",
    emoji: "🗂️",
    title: "PPMI 데이터",
    subtitle: "DaTScan · 메타데이터 · 매니페스트",
  },
  {
    key: "general",
    emoji: "💡",
    title: "일반",
    subtitle: "분류 안 된 생각 · 잡다한 메모",
  },
];

export const PROJECT_KEYS = PROJECTS.map((p) => p.key);

export function normalizeProject(key) {
  return PROJECT_KEYS.includes(key) ? key : "general";
}

export function projectMeta(key) {
  return PROJECTS.find((p) => p.key === key) || PROJECTS[PROJECTS.length - 1];
}

// 자료 종류
export const REF_KINDS = [
  { key: "paper", emoji: "📄", label: "논문" },
  { key: "code", emoji: "💻", label: "코드" },
  { key: "link", emoji: "🔗", label: "링크" },
];

export const REF_KIND_KEYS = REF_KINDS.map((k) => k.key);

export function normalizeKind(kind) {
  return REF_KIND_KEYS.includes(kind) ? kind : "paper";
}

export function kindMeta(key) {
  return REF_KINDS.find((k) => k.key === key) || REF_KINDS[0];
}
