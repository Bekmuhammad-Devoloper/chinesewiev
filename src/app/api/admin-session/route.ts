import { NextResponse } from "next/server";
import { isAdmin, SESSION_COOKIE_NAME } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// GET /api/admin-session — 200 if a valid admin cookie is present, 401 otherwise.
// Used by the admin layout to decide whether to render the panel or the login form.
export async function GET() {
  return NextResponse.json({ authed: await isAdmin() }, {
    status: (await isAdmin()) ? 200 : 401,
  });
}

// POST /api/admin-session?action=logout — clear the cookie.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
