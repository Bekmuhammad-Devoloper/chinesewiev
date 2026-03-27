import { NextRequest, NextResponse } from "next/server";
import type { Course, Lesson } from "@/data/courses";
import { getDataPath, readJsonFile, writeJsonFile } from "@/lib/data";

const DATA_FILE = "courses-data.json";

function readData(): Course[] {
  return readJsonFile<Course[]>(getDataPath(DATA_FILE), []);
}

function writeData(courses: Course[]) {
  writeJsonFile(getDataPath(DATA_FILE), courses);
}

// GET /api/lessons?slug=hsk-1 — get all lessons for a course
// GET /api/lessons?slug=hsk-1&id=1 — get one lesson
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const id = req.nextUrl.searchParams.get("id");
  if (!slug) return NextResponse.json({ error: "slug kerak" }, { status: 400 });

  const courses = readData();
  const course = courses.find((c) => c.slug === slug);
  if (!course) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });

  if (id) {
    const lesson = course.lessons.find((l) => l.id === Number(id));
    if (!lesson) return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });
    return NextResponse.json(lesson);
  }

  return NextResponse.json(course.lessons);
}

// POST /api/lessons?slug=hsk-1 — add a lesson
export async function POST(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug kerak" }, { status: 400 });

  const body = await req.json();
  const courses = readData();
  const course = courses.find((c) => c.slug === slug);
  if (!course) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });

  const maxId = course.lessons.reduce((mx, l) => Math.max(mx, l.id), 0);
  const newLesson: Lesson = {
    id: body.id || maxId + 1,
    title: body.title || `Darslik ${maxId + 1}`,
    name: body.name || "Yangi dars",
    description: body.description || "",
    image: body.image || "",
    locked: body.locked ?? true,
    words: body.words || [],
    sections: body.sections || [
      { id: "new-words", title: "Yangi so'zlar", type: "words" },
      { id: "writing", title: "So'z yozilishi", type: "writing" },
      { id: "dialogues", title: "Dialoglar", type: "dialogue", children: [] },
      { id: "grammar", title: "Grammatika", type: "grammar", children: [] },
      { id: "tasks", title: "Vazifalar", type: "tasks" },
    ],
    tasks: body.tasks || [],
  };

  course.lessons.push(newLesson);
  writeData(courses);
  return NextResponse.json(newLesson, { status: 201 });
}

// PUT /api/lessons?slug=hsk-1&id=1 — update a lesson
export async function PUT(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const id = req.nextUrl.searchParams.get("id");
  if (!slug || !id) return NextResponse.json({ error: "slug va id kerak" }, { status: 400 });

  const body = await req.json();
  const courses = readData();
  const course = courses.find((c) => c.slug === slug);
  if (!course) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });

  const idx = course.lessons.findIndex((l) => l.id === Number(id));
  if (idx === -1) return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });

  course.lessons[idx] = { ...course.lessons[idx], ...body, id: Number(id) };
  writeData(courses);
  return NextResponse.json(course.lessons[idx]);
}

// DELETE /api/lessons?slug=hsk-1&id=1 — delete a lesson
export async function DELETE(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const id = req.nextUrl.searchParams.get("id");
  if (!slug || !id) return NextResponse.json({ error: "slug va id kerak" }, { status: 400 });

  const courses = readData();
  const course = courses.find((c) => c.slug === slug);
  if (!course) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });

  const before = course.lessons.length;
  course.lessons = course.lessons.filter((l) => l.id !== Number(id));
  if (course.lessons.length === before) return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });

  writeData(courses);
  return NextResponse.json({ success: true });
}
