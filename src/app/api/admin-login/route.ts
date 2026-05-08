import { NextRequest, NextResponse } from "next/server";
import { makeSessionCookieValue, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// POST /api/admin-login — verify password against ADMIN_PASSWORD env, set
// HMAC-signed HTTP-only session cookie on success.
export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD env not set on server" },
      { status: 503 }
    );
  }
  const body = (await req.json().catch(() => ({}))) as { password?: string };
  const provided = (body.password || "").toString();
  if (provided.length === 0 || provided !== expected) {
    return NextResponse.json({ error: "Parol noto'g'ri" }, { status: 401 });
  }
  const value = makeSessionCookieValue();
  if (!value) {
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, value, SESSION_COOKIE_OPTIONS);
  return res;
}
