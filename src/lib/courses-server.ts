import { Course, Lesson } from "@/data/courses";
import { getDataPath, readJsonFile, writeJsonFile } from "./data";

const DATA_FILE = "courses-data.json";

export function getCoursesData(): Course[] {
  const filePath = getDataPath(DATA_FILE);
  const data = readJsonFile<Course[]>(filePath, []);
  if (data.length === 0) {
    try {
      const seed = require("@/data/courses").courses as Course[];
      writeJsonFile(filePath, seed);
      return seed;
    } catch {
      return [];
    }
  }
  return data;
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
