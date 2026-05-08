import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getDataPath, writeJsonFile } from "@/lib/data";

export const dynamic = "force-dynamic";

const DATA_FILE = "courses-data.json";

// POST /api/seed — overwrite courses-data.json with the bundled seed array.
// This was previously public+unauthed, meaning anyone could DELETE all admin
// data with a single curl. It now requires:
//   1. an explicit admin secret (env SEED_SECRET) in the x-seed-secret header
//   2. the existing courses file to be empty/missing — we refuse to clobber
//      a populated file. To force, pass ?force=1 alongside the secret.
export async function POST(req: NextRequest) {
  const expected = process.env.SEED_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "seed disabled (SEED_SECRET not set)" }, { status: 503 });
  }
  if (req.headers.get("x-seed-secret") !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
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
