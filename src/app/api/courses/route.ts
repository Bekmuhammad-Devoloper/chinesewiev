import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Course } from "@/data/courses";
import { getDataPath, mutateJsonFile } from "@/lib/data";
import { getCoursesData } from "@/lib/courses-server";

const DATA_FILE = "courses-data.json";

// Bust caches for every public page that derives from courses-data.json.
function revalidatePublicPages() {
  revalidatePath("/", "layout");
  revalidatePath("/courses/[slug]", "page");
  revalidatePath("/courses/[slug]/lessons", "page");
  revalidatePath("/courses/[slug]/lessons/[lessonId]", "page");
}

// GET /api/courses — slim listing (strips heavy per-lesson `sections` content
// — those contain Word-extracted contentHtml and grow into MBs each).
// Full lesson detail is available at /api/lessons?slug=X&id=Y.
export async function GET() {
  const courses = getCoursesData();
  const slim = courses.map((c) => ({
    ...c,
    lessons: c.lessons.map((l) => {
      const { sections: _sections, writingSheets: _writingSheets, ...rest } = l;
      void _sections; void _writingSheets;
      return rest;
    }),
  }));
  return NextResponse.json(slim, {
    headers: {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
    },
  });
}

// POST /api/courses — add a new course
export async function POST(req: NextRequest) {
  const body = await req.json();
  let created: Course | null = null;
  await mutateJsonFile<Course[]>(getDataPath(DATA_FILE), (courses) => {
    created = {
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
      published: body.published ?? false,
      lessons: body.lessons || [],
    };
    return [...courses, created];
  }, []);
  revalidatePublicPages();
  return NextResponse.json(created, { status: 201 });
}

// PUT /api/courses — update course METADATA only. We deliberately drop
// body.lessons here: the admin /admin/courses page loads courses via the
// slim GET (which strips sections/writingSheets/words/tasks). If we accepted
// body.lessons, every "save" would replace the full lessons with the slim
// version — wiping every lesson's sections/words on a single price edit.
// Lessons are managed exclusively via /api/lessons.
export async function PUT(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  if (!body.slug) return NextResponse.json({ error: "slug kerak" }, { status: 400 });

  let updated: Course | null = null;
  let notFound = false;
  await mutateJsonFile<Course[]>(getDataPath(DATA_FILE), (courses) => {
    const idx = courses.findIndex((c) => c.slug === body.slug);
    if (idx === -1) { notFound = true; return courses; }
    const { lessons: _lessons, ...rest } = body;
    void _lessons;
    const meta = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined)
    );
    const next = courses.slice();
    next[idx] = { ...courses[idx], ...meta } as Course;
    updated = next[idx];
    return next;
  }, []);
  if (notFound) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
  revalidatePublicPages();
  return NextResponse.json(updated);
}

// DELETE /api/courses — delete course by slug (send { slug } in body)
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  let removed = false;
  await mutateJsonFile<Course[]>(getDataPath(DATA_FILE), (courses) => {
    const before = courses.length;
    const next = courses.filter((c) => c.slug !== body.slug);
    removed = next.length !== before;
    return next;
  }, []);
  if (!removed) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
  revalidatePublicPages();
  return NextResponse.json({ success: true });
}
