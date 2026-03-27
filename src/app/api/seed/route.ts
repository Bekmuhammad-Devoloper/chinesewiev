import { NextResponse } from "next/server";
import { getDataPath, writeJsonFile } from "@/lib/data";

const DATA_FILE = "courses-data.json";

// POST /api/seed — seed JSON data from the TS courses array
export async function POST() {
  try {
    // Dynamic import to get the courses array
    const mod = await import("@/data/courses");
    const courses = mod.courses;
    writeJsonFile(getDataPath(DATA_FILE), courses);
    return NextResponse.json({ success: true, count: courses.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
