"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import type { Course } from "@/data/courses";
import LessonsClient from "@/components/LessonsClient";

export default function LessonsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Foydalanuvchi sessiyasini tekshirish
    try {
      const session = localStorage.getItem("user_session");
      if (session) {
        const user = JSON.parse(session);
        // Muddati tugamaganini tekshirish
        if (user && user.course === slug && new Date(user.expiresAt) > new Date()) {
          setIsAuthenticated(true);
        }
      }
    } catch {}

    fetch("/api/courses")
      .then((r) => r.json())
      .then((courses: Course[]) => {
        const c = courses.find((x) => x.slug === slug) || null;
        setCourse(c);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-[32px] h-[32px] border-[3px] border-gray-200 border-t-[#e8632b] rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <p className="text-gray-400 text-[15px]">Kurs topilmadi</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      {/* ===== PREMIUM TOP BAR — Clock & Weather ===== */}
      <LessonsClient />

      {/* ===== MAIN CONTENT ===== */}
      <div className="w-full px-[12px] sm:px-[20px] md:px-[48px] lg:px-[80px] xl:px-[120px] pt-[12px] md:pt-[24px] pb-[30px] md:pb-[60px]">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-[6px] text-[11px] sm:text-[12px] md:text-[13px] text-gray-400 pb-[8px] md:pb-[14px] border-b border-gray-200">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Asosiy
          </Link>
          <span className="text-gray-300">&gt;</span>
          <span className="text-gray-500 font-medium">
            HSK 1.0 Darsliklar
          </span>
        </nav>

        {/* Page Title */}
        <h1 className="text-[20px] sm:text-[24px] md:text-[32px] lg:text-[38px] font-bold text-[#ff4d5a] mt-[12px] md:mt-[24px] mb-[16px] md:mb-[36px]">
          HSK 1.0 Darsliklar
        </h1>

        {/* Lessons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[8px] sm:gap-[12px] md:gap-[16px] lg:gap-[20px]">
          {course.lessons.map((lesson) => {
            // Agar foydalanuvchi login qilgan bo'lsa, barcha darslar ochiq
            const isLocked = isAuthenticated ? false : lesson.locked;
            const href = isLocked
              ? "/login"
              : `/courses/${slug}/lessons/${lesson.id}`;

            return (
              <Link
                key={lesson.id}
                href={href}
                className="group bg-white rounded-[10px] sm:rounded-[12px] md:rounded-[14px] overflow-hidden border border-gray-100 shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all duration-200 block cursor-pointer"
              >
                {/* Card Image / Lock Area */}
                <div className="relative w-full aspect-[5/4] bg-[#f7f7f7] flex items-center justify-center overflow-hidden">
                  {isLocked ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#c0c0c0"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-[28px] sm:w-[36px] md:w-[44px] lg:w-[50px] h-auto opacity-50 group-hover:opacity-70 transition-opacity"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  ) : lesson.image ? (
                    <Image
                      src={lesson.image}
                      alt={lesson.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>

                {/* Card Content */}
                <div className="flex flex-col gap-[10px] px-[8px] sm:px-[10px] md:px-[12px] lg:px-[14px] xl:px-[16px] py-[12px] sm:py-[14px] md:py-[16px] lg:py-[18px] xl:py-[20px]">
                  <h3 className="text-[11px] sm:text-[12px] md:text-[14px] lg:text-[15px] xl:text-[16px] font-bold text-orange-500 leading-tight">
                    {lesson.title}
                  </h3>
                  <p className="text-[8px] sm:text-[9px] md:text-[11px] lg:text-[12px] xl:text-[13px] text-gray-400 leading-[1.3] line-clamp-1">
                    {lesson.description}
                  </p>
                  {!isLocked ? (
                    <span className="inline-block bg-orange-500 text-white text-[9px] sm:text-[10px] md:text-[12px] font-semibold px-[12px] sm:px-[16px] md:px-[20px] py-[4px] sm:py-[5px] md:py-[6px] rounded-full group-hover:bg-orange-600 transition-colors shadow-sm group-hover:shadow-md">
                      Kirish
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-[8px] text-[8px] sm:text-[9px] md:text-[10px] text-gray-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[10px] sm:w-[12px] h-auto">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Yopiq
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
