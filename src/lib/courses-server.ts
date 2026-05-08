import { Course, Lesson } from "@/data/courses";
import { getDataPath, readJsonFile, writeJsonFile } from "./data";
import fs from "fs";

const DATA_FILE = "courses-data.json";

// Read courses from disk. CRITICAL: we never auto-seed here. Previously, any
// transient parse failure on the 35 MB JSON returned [] and the caller wrote
// the hardcoded seed back to disk, wiping admin edits ~5–6h after they were
// made. Now: if the file exists but reads fail, we throw — the API surfaces
// 5xx and the on-disk data stays untouched. First-run seeding only happens
// when the file genuinely does not exist yet.
export function getCoursesData(): Course[] {
  const filePath = getDataPath(DATA_FILE);
  if (!fs.existsSync(filePath)) {
    try {
      const seed = require("@/data/courses").courses as Course[];
      writeJsonFile(filePath, seed);
      return seed;
    } catch {
      return [];
    }
  }
  // readJsonFile throws on stat/read/parse errors — let it propagate so a
  // transient failure does not silently degrade into "data is empty".
  return readJsonFile<Course[]>(filePath, []);
}

export function getCourseBySlug(slug: string): Course | null {
  return getCoursesData().find((c) => c.slug === slug) ?? null;
}

export function getLessonByIds(slug: string, lessonId: number) {
  const course = getCourseBySlug(slug);
  if (!course) return { course: null, lesson: null };
  const lesson = course.lessons.find((l) => l.id === lessonId) ?? null;
  return { course, lesson };
}

// Strip heavy per-lesson fields (sections, writingSheets, words, tasks) for
// list/sibling rendering — sections embed Word-extracted base64 images that
// inflate the SSR payload to many MB per page.
export function slimLesson(l: Lesson): Lesson {
  const { sections: _s, writingSheets: _ws, words: _w, tasks: _t, ...rest } = l;
  void _s; void _ws; void _w; void _t;
  return rest as Lesson;
}

export function slimCourse(c: Course): Course {
  return { ...c, lessons: c.lessons.map(slimLesson) };
}
