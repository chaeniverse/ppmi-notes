import { NextResponse } from "next/server";
import {
  APP_PASSWORD,
  COOKIE_NAME,
  SESSION_TOKEN,
  COOKIE_MAX_AGE,
} from "../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  let password = "";
  try {
    const body = await request.json();
    password = body?.password || "";
  } catch {
    password = "";
  }

  if (password !== APP_PASSWORD) {
    return NextResponse.json({ ok: false, error: "비밀번호가 틀렸습니다." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, SESSION_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
