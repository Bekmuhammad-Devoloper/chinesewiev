"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Course } from "@/data/courses";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    // Kurs nashr qilinganligini tekshirish
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        const courses: Course[] = Array.isArray(data) ? data : [];
        const course = courses.find((c) => c.slug === slug);
        if (course?.published === false) {
          router.replace("/");
        } else {
          router.replace(`/courses/${slug}/lessons`);
        }
      })
      .catch(() => router.replace(`/courses/${slug}/lessons`));
  }, [slug, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="w-[32px] h-[32px] border-[3px] border-gray-200 border-t-[#e8632b] rounded-full animate-spin" />
    </div>
  );
}
