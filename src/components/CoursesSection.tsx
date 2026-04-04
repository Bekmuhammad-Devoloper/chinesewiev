"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { Course } from "@/data/courses";

export default function CoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  return (
    <section id="courses" className="bg-primary pt-[30px] md:pt-[90px] lg:pt-[100px]">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[60px] lg:px-[156px]">
        <h2 className="text-gold font-bold text-[22px] md:text-[48px] lg:text-[60px] leading-[1.15] text-center mb-[40px] md:mb-[64px] lg:mb-[76px]">
          Darsliklar
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px] md:gap-[24px] lg:gap-[30px]">
          {courses.map((course) => {
            const isComingSoon = course.published === false;
            return (
            <div
              key={course.title}
              className={`bg-accent rounded-[16px] md:rounded-[20px] flex flex-col ${isComingSoon ? "opacity-70" : ""}`}
            >
              {/* Image with padding */}
              <div className="px-[14px] md:px-[22px] lg:px-[28px] pt-[14px] md:pt-[22px] lg:pt-[28px]">
                <div className="h-[180px] md:h-[280px] lg:h-[340px] w-full relative rounded-[10px] md:rounded-[16px] overflow-hidden bg-white">
                  {isComingSoon && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded-[10px] md:rounded-[16px]">
                      <span className="bg-amber-500 text-white text-[14px] md:text-[18px] font-bold px-[20px] py-[8px] rounded-full shadow-lg">
                        🕐 Tez kunda
                      </span>
                    </div>
                  )}
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="px-[16px] md:px-[22px] lg:px-[28px] pt-[16px] md:pt-[22px] lg:pt-[28px] pb-[16px] md:pb-[22px] lg:pb-[28px] flex flex-col flex-1">
                <h3 className="text-gold font-bold text-[18px] md:text-[24px] lg:text-[30px] leading-[1.2] mb-[20px] md:mb-[26px] lg:mb-[30px] text-center">
                  {course.title}
                </h3>
                <ul className="space-y-[4px] md:space-y-[6px] text-gold text-[11px] md:text-[13px] lg:text-[15px] font-normal leading-[1.55] flex-1 mb-[26px] md:mb-[30px]">
                  {course.features.map((feature, i) => (
                    <li key={i}>&bull; {feature}</li>
                  ))}
                </ul>
                {isComingSoon ? (
                  <div className="mt-[14px] md:mt-[18px] w-full bg-gray-400/60 text-white/80 font-bold text-[13px] md:text-[15px] lg:text-[16px] px-[20px] py-[10px] md:py-[12px] rounded-[10px] text-center cursor-default">
                    Tez kunda
                  </div>
                ) : (
                  <Link
                    href={`/courses/${course.slug}/lessons`}
                    className="mt-[14px] md:mt-[18px] w-full bg-gold text-primary font-bold text-[13px] md:text-[15px] lg:text-[16px] px-[20px] py-[10px] md:py-[12px] rounded-[10px] hover:bg-gold-light transition-colors cursor-pointer text-center block"
                  >
                    Batafsil &rarr;
                  </Link>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
