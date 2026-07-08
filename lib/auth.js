// 간단한 비밀번호 잠금. (개인용 private 사이트)
// 비밀번호는 환경변수 APP_PASSWORD 로 바꿀 수 있고, 없으면 기본값 940202.
export const APP_PASSWORD = process.env.APP_PASSWORD || "940202";

// 비밀번호가 맞으면 이 토큰을 쿠키에 심어두고, 미들웨어가 이 값을 확인한다.
export const COOKIE_NAME = "ppmi_session";
export const SESSION_TOKEN = "ppmi-ok-2026";
// 30일
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
