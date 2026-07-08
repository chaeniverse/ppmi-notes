import { NextResponse } from "next/server";
import { COOKIE_NAME, SESSION_TOKEN } from "./lib/auth";

// 로그인 화면과 로그인 API, 정적 파일은 잠금에서 제외한다.
const PUBLIC_PATHS = ["/login", "/api/login"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next") ||
    pathname === "/icon.svg" ||
    pathname === "/favicon.ico";

  if (isPublic) return NextResponse.next();

  const session = request.cookies.get(COOKIE_NAME)?.value;
  if (session === SESSION_TOKEN) return NextResponse.next();

  // 인증 안 된 API 요청은 401, 페이지는 /login 으로 보낸다.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
