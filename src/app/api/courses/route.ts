import { NextRequest, NextResponse } from "next/server";
import { Course } from "@/data/courses";
import { getDataPath, writeJsonFile } from "@/lib/data";
import { getCoursesData } from "@/lib/courses-server";

const DATA_FILE = "courses-data.json";

function writeData(courses: Course[]) {
  writeJsonFile(getDataPath(DATA_FILE), courses);
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
  const courses = getCoursesData();

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
  const courses = getCoursesData();
  const idx = courses.findIndex((c) => c.slug === body.slug);
  if (idx === -1) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });

  courses[idx] = { ...courses[idx], ...body };
  writeData(courses);
  return NextResponse.json(courses[idx]);
}

// DELETE /api/courses — delete course by slug (send { slug } in body)
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  let courses = getCoursesData();
  const before = courses.length;
  courses = courses.filter((c) => c.slug !== body.slug);
  if (courses.length === before) return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });

  writeData(courses);
  return NextResponse.json({ success: true });
}
