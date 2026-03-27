import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src", "data", "courses-data.json");

// POST /api/seed — seed JSON data from the TS courses array
export async function POST() {
  try {
    // Dynamic import to get the courses array
    const mod = await import("@/data/courses");
    const courses = mod.courses;
    fs.writeFileSync(DATA_PATH, JSON.stringify(courses, null, 2), "utf-8");
    return NextResponse.json({ success: true, count: courses.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
