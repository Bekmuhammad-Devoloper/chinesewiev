import { redirect, notFound } from "next/navigation";
import { getLessonByIds } from "@/lib/courses-server";
import LessonDetailClient from "./LessonDetailClient";

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
