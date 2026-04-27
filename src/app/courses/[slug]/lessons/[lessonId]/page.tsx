import { redirect, notFound } from "next/navigation";
import { getLessonByIds, getCoursesData } from "@/lib/courses-server";
import LessonDetailClient from "./LessonDetailClient";

export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  const params: Array<{ slug: string; lessonId: string }> = [];
  for (const course of getCoursesData()) {
    if (course.published === false) continue;
    for (const lesson of course.lessons) {
      if (lesson.published === false) continue;
      params.push({ slug: course.slug, lessonId: String(lesson.id) });
    }
  }
  return params;
}

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId: lessonIdStr } = await params;
  const lessonId = Number(lessonIdStr);
  const { course, lesson } = getLessonByIds(slug, lessonId);

  if (!course || course.published === false) {
    redirect("/");
  }
  if (!lesson) {
    notFound();
  }
  if (lesson.published === false) {
    redirect(`/courses/${slug}/lessons`);
  }

  return (
    <LessonDetailClient
      slug={slug}
      lessonId={lessonId}
      initialCourse={course}
      initialLesson={lesson}
    />
  );
}
