"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    router.replace(`/courses/${slug}/lessons`);
  }, [slug, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="w-[32px] h-[32px] border-[3px] border-gray-200 border-t-[#e8632b] rounded-full animate-spin" />
    </div>
  );
}
