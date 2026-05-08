import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { Course, Lesson } from "@/data/courses";
import { getDataPath, mutateJsonFile } from "@/lib/data";
import { getCoursesData } from "@/lib/courses-server";

const DATA_FILE = "courses-data.json";

function revalidatePublicPages() {
  revalidatePath("/", "layout");
  revalidatePath("/courses/[slug]", "page");
  revalidatePath("/courses/[slug]/lessons", "page");
  revalidatePath("/courses/[slug]/lessons/[lessonId]", "page");
}

const cacheHeaders = {
  "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
};

// GET /api/lessons?slug=hsk-1 — get all lessons for a course
// GET /api/lessons?slug=hsk-1&id=1 — get one lesson
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const id = req.nextUrl.searchParams.get("id");
  if (!slug) return NextResponse.json({ error: "slug kerak" }, { status: 400 });

  const courses = getCoursesData();
  const course = courses.find((c) => c.slug === slug);
  if (!course) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });

  if (id) {
    const lesson = course.lessons.find((l) => l.id === Number(id));
    if (!lesson) return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });
    return NextResponse.json(lesson, { headers: cacheHeaders });
  }

  return NextResponse.json(course.lessons, { headers: cacheHeaders });
}

// POST /api/lessons?slug=hsk-1 — add a lesson
export async function POST(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug kerak" }, { status: 400 });

  const body = await req.json();
  let created: Lesson | null = null;
  let notFound = false;
  await mutateJsonFile<Course[]>(getDataPath(DATA_FILE), (courses) => {
    const idx = courses.findIndex((c) => c.slug === slug);
    if (idx === -1) { notFound = true; return courses; }
    const course = courses[idx];
    const maxId = course.lessons.reduce((mx, l) => Math.max(mx, l.id), 0);
    created = {
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
      ],
      tasks: body.tasks || [],
    };
    const next = courses.slice();
    next[idx] = { ...course, lessons: [...course.lessons, created] };
    return next;
  }, []);
  if (notFound) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
  revalidatePublicPages();
  return NextResponse.json(created, { status: 201 });
}

// PUT /api/lessons?slug=hsk-1&id=1 — update a lesson
export async function PUT(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const id = req.nextUrl.searchParams.get("id");
  if (!slug || !id) return NextResponse.json({ error: "slug va id kerak" }, { status: 400 });

  const body = (await req.json()) as Record<string, unknown>;
  let updated: Lesson | null = null;
  let courseMissing = false;
  let lessonMissing = false;

  await mutateJsonFile<Course[]>(getDataPath(DATA_FILE), (courses) => {
    const cidx = courses.findIndex((c) => c.slug === slug);
    if (cidx === -1) { courseMissing = true; return courses; }
    const course = courses[cidx];
    const lidx = course.lessons.findIndex((l) => l.id === Number(id));
    if (lidx === -1) { lessonMissing = true; return courses; }
    // Drop undefined entries so a client that omits/clears a field cannot
    // overwrite an existing populated value with undefined.
    const patch = Object.fromEntries(
      Object.entries(body).filter(([, v]) => v !== undefined)
    );
    const newLessons = course.lessons.slice();
    newLessons[lidx] = { ...course.lessons[lidx], ...patch, id: Number(id) } as Lesson;
    updated = newLessons[lidx];
    const next = courses.slice();
    next[cidx] = { ...course, lessons: newLessons };
    return next;
  }, []);

  if (courseMissing) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
  if (lessonMissing) return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });
  revalidatePublicPages();
  return NextResponse.json(updated);
}

// DELETE /api/lessons?slug=hsk-1&id=1 — delete a lesson
export async function DELETE(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const id = req.nextUrl.searchParams.get("id");
  if (!slug || !id) return NextResponse.json({ error: "slug va id kerak" }, { status: 400 });

  let courseMissing = false;
  let lessonMissing = false;
  await mutateJsonFile<Course[]>(getDataPath(DATA_FILE), (courses) => {
    const cidx = courses.findIndex((c) => c.slug === slug);
    if (cidx === -1) { courseMissing = true; return courses; }
    const course = courses[cidx];
    const before = course.lessons.length;
    const newLessons = course.lessons.filter((l) => l.id !== Number(id));
    if (newLessons.length === before) { lessonMissing = true; return courses; }
    const next = courses.slice();
    next[cidx] = { ...course, lessons: newLessons };
    return next;
  }, []);

  if (courseMissing) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
  if (lessonMissing) return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });
  revalidatePublicPages();
  return NextResponse.json({ success: true });
}
