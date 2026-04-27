import { redirect } from "next/navigation";
import LessonsList from "./LessonsList";
import LessonsClient from "@/components/LessonsClient";
import Link from "next/link";
import { getCourseBySlug, getCoursesData } from "@/lib/courses-server";

export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return getCoursesData()
    .filter((c) => c.published !== false)
    .map((c) => ({ slug: c.slug }));
}

export default async function LessonsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course || course.published === false) {
    redirect("/");
  }

  const pageTitle = `${course.title.trim()} Darsliklar`;

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <LessonsClient />

      <div className="w-full px-[12px] sm:px-[20px] md:px-[48px] lg:px-[80px] xl:px-[120px] pt-[12px] md:pt-[24px] pb-[30px] md:pb-[60px]">
        <nav className="flex items-center gap-[6px] text-[11px] sm:text-[12px] md:text-[13px] text-gray-400 pb-[8px] md:pb-[14px] border-b border-gray-200">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Asosiy
          </Link>
          <span className="text-gray-300">&gt;</span>
          <span className="text-gray-500 font-medium">{pageTitle}</span>
        </nav>

        <h1 className="text-[20px] sm:text-[24px] md:text-[32px] lg:text-[38px] font-bold text-[#ff4d5a] mt-[12px] md:mt-[24px] mb-[16px] md:mb-[36px]">
          {pageTitle}
        </h1>

        <LessonsList slug={slug} lessons={course.lessons} />
      </div>
    </main>
  );
}
