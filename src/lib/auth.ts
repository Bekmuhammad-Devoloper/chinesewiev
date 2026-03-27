import { NextRequest, NextResponse } from "next/server";

/**
 * API ni himoyalash uchun yordamchi funksiya.
 * POST, PUT, DELETE so'rovlarda Authorization headerni tekshiradi.
 */
export function verifyApiAuth(req: NextRequest): NextResponse | null {
  const apiKey = process.env.API_SECRET_KEY;
  if (!apiKey) return null; // development da tekshirmaydi

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json(
      { error: "Ruxsat berilmagan" },
      { status: 401 }
    );
  }
  return null;
}

/**
 * Admin sahifadan API ga so'rov yuborishda ishlatiladigan header.
 */
export function getAuthHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET_KEY || ""}`,
  };
}
