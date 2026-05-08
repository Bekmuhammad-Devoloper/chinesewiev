import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getDataPath, writeJsonFile } from "@/lib/data";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const DATA_FILE = "courses-data.json";

// POST /api/seed — overwrite courses-data.json with the bundled seed array.
// Requires an admin session AND refuses to clobber a populated file unless
// ?force=1 is passed.
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const force = req.nextUrl.searchParams.get("force") === "1";
  const filePath = getDataPath(DATA_FILE);
  if (!force && fs.existsSync(filePath) && fs.statSync(filePath).size > 2) {
    return NextResponse.json(
      { error: "refusing to overwrite existing data; pass ?force=1 to override" },
      { status: 409 }
    );
  }
  try {
    const mod = await import("@/data/courses");
    const courses = mod.courses;
    writeJsonFile(filePath, courses);
    return NextResponse.json({ success: true, count: courses.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
