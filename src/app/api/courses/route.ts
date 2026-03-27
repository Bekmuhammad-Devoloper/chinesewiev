import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Course } from "@/data/courses";

const DATA_PATH = path.join(process.cwd(), "src", "data", "courses-data.json");

function readData(): Course[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    // fallback: read from the TS module (initial seed)
    const { courses } = require("@/data/courses");
    fs.writeFileSync(DATA_PATH, JSON.stringify(courses, null, 2), "utf-8");
    return courses;
  }
}

function writeData(courses: Course[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(courses, null, 2), "utf-8");
}

// GET /api/courses — get all courses
export async function GET() {
  const courses = readData();
  return NextResponse.json(courses);
}

// POST /api/courses — add a new course
export async function POST(req: NextRequest) {
  const body = await req.json();
  const courses = readData();

  const newCourse: Course = {
    slug: body.slug || `course-${Date.now()}`,
    title: body.title || "Yangi kurs",
    level: body.level || "",
    image: body.image || "/assets/course-1.png",
    features: body.features || [],
    description: body.description || "",
    duration: body.duration || "",
    lessonsCount: body.lessonsCount || "0 ta dars",
    wordsCount: body.wordsCount || "0 so'z",
    grammarCount: body.grammarCount || "0 mavzu",
    price: body.price || "0",
    priceNote: body.priceNote || "so'm / oyiga",
    lessons: body.lessons || [],
  };

  courses.push(newCourse);
  writeData(courses);
  return NextResponse.json(newCourse, { status: 201 });
}

// PUT /api/courses — update a course by slug
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const courses = readData();
  const idx = courses.findIndex((c) => c.slug === body.slug);
  if (idx === -1) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });

  courses[idx] = { ...courses[idx], ...body };
  writeData(courses);
  return NextResponse.json(courses[idx]);
}

// DELETE /api/courses — delete course by slug (send { slug } in body)
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  let courses = readData();
  const before = courses.length;
  courses = courses.filter((c) => c.slug !== body.slug);
  if (courses.length === before) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });

  writeData(courses);
  return NextResponse.json({ success: true });
}
