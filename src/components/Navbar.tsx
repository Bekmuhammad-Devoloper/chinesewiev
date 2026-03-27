"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Asosiy", href: "#hero", sectionId: "hero" },
  { label: "Kurs haqida", href: "#about", sectionId: "about" },
  { label: "Darsliklar", href: "#courses", sectionId: "courses" },
  { label: "Narxlar", href: "#pricing", sectionId: "pricing" },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isLessonsPage = pathname.includes("/lessons");
  const isAdminPage = pathname.startsWith("/admin");

  useEffect(() => {
    if (!isHome) {
      setActiveSection("");
      return;
    }

    const allSections = [
      { id: "hero", navId: "hero" },
      { id: "about", navId: "about" },
      { id: "lessons", navId: "about" },
      { id: "why-us", navId: "about" },
      { id: "courses", navId: "courses" },
      { id: "pricing", navId: "pricing" },
      { id: "outcomes", navId: "pricing" },
      { id: "result", navId: "pricing" },
      { id: "contact", navId: "pricing" },
    ];

    const handleScroll = () => {
      const scrollY = window.scrollY + 200;

      for (let i = allSections.length - 1; i >= 0; i--) {
        const el = document.getElementById(allSections[i].id);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(allSections[i].navId);
          return;
        }
      }
      setActiveSection("hero");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile menu on scroll
  useEffect(() => {
    if (!mobileOpen) return;
    const close = () => setMobileOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [mobileOpen]);

  if (isLessonsPage || isAdminPage) return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-primary/95 backdrop-blur-sm py-[8px] md:py-[14px] lg:py-[16px]">
      <div className="max-w-[1920px] mx-auto px-[10px] md:px-[40px] lg:px-[80px]">
        <div className="flex items-center justify-between">

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-[10px] lg:gap-[16px]">
            {navLinks.map((link) => (
              <a
                key={link.sectionId}
                href={isHome ? link.href : `/${link.href}`}
                className={`text-[13px] lg:text-[15px] px-[20px] py-[8px] lg:px-[24px] lg:py-[9px] rounded-[6px] transition-colors tracking-[0.03em] whitespace-nowrap ${
                  activeSection === link.sectionId
                    ? "bg-gold text-primary font-medium hover:bg-gold-light"
                    : "text-gold font-light hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile: Hamburger + Kirish */}
          <div className="flex md:hidden items-center gap-[8px]">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="w-[36px] h-[36px] flex items-center justify-center text-gold rounded-[6px] hover:bg-white/10 transition-colors"
              aria-label="Menyu"
            >
              {mobileOpen ? (
                <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop Kirish Button */}
          <Link
            href="/login"
            className="hidden md:inline-flex bg-gold text-primary text-[13px] lg:text-[15px] font-semibold px-[20px] py-[8px] lg:px-[24px] lg:py-[9px] rounded-[6px] hover:bg-gold-light transition-colors tracking-[0.03em] whitespace-nowrap"
          >
            Kirish
          </Link>

          {/* Mobile Kirish Button (always visible) */}
          <Link
            href="/login"
            className="md:hidden bg-gold text-primary text-[11px] font-semibold px-[14px] py-[6px] rounded-[6px] hover:bg-gold-light transition-colors tracking-[0.03em] whitespace-nowrap"
          >
            Kirish
          </Link>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-primary/98 backdrop-blur-md border-t border-gold/20 mt-[8px]">
          <div className="px-[16px] py-[12px] flex flex-col gap-[4px]">
            {navLinks.map((link) => (
              <a
                key={link.sectionId}
                href={isHome ? link.href : `/${link.href}`}
                onClick={() => setMobileOpen(false)}
                className={`text-[14px] px-[14px] py-[10px] rounded-[8px] transition-colors tracking-[0.03em] ${
                  activeSection === link.sectionId
                    ? "bg-gold text-primary font-medium"
                    : "text-gold font-light hover:bg-white/10"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
