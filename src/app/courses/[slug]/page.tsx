import { redirect } from "next/navigation";
import { getCourseBySlug } from "@/lib/courses-server";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course || course.published === false) {
    redirect("/");
  }
  redirect(`/courses/${slug}/lessons`);
}
