import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// HMAC-signed stateless session cookie. The signing key is ADMIN_PASSWORD on
// the server, so the cookie cannot be forged without that secret. Previously
// admin auth was sessionStorage + NEXT_PUBLIC_ADMIN_PASSWORD — meaning anyone
// could curl POST /api/courses to wipe data without ever opening the UI.
const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function getSecret(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function makeSessionCookieValue(): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `v1.${expires}`;
  return `${payload}.${sign(payload, secret)}`;
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: Math.floor(SESSION_TTL_MS / 1000),
};

export const SESSION_COOKIE_NAME = COOKIE_NAME;

export async function isAdmin(): Promise<boolean> {
  const secret = getSecret();
  if (!secret) return false;
  const ck = (await cookies()).get(COOKIE_NAME)?.value;
  if (!ck) return false;
  const parts = ck.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const expires = Number(parts[1]);
  if (!expires || Number.isNaN(expires) || Date.now() > expires) return false;
  const expected = sign(`v1.${expires}`, secret);
  const a = Buffer.from(parts[2], "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Convenience: drop into an API route handler:
//   const denied = await requireAdmin();
//   if (denied) return denied;
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  if (!getSecret()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD not configured on server" },
      { status: 503 }
    );
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
