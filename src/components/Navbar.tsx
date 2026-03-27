"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  { label: "Asosiy", href: "#hero", sectionId: "hero" },
  { label: "Kurs haqida", href: "#about", sectionId: "about" },
  { label: "Darsliklar", href: "#courses", sectionId: "courses" },
  { label: "Narxlar", href: "#pricing", sectionId: "pricing" },
];

interface UserSession {
  id: string;
  name: string;
  course: string;
  expiresAt: string;
}

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("hero");
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const isLessonsPage = pathname.includes("/lessons");
  const isAdminPage = pathname.startsWith("/admin");

  // Check user session & admin session
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_session");
      if (stored) {
        const session = JSON.parse(stored) as UserSession;
        if (new Date(session.expiresAt) > new Date()) {
          setUserSession(session);
        } else {
          localStorage.removeItem("user_session");
        }
      }
    } catch {
      // ignore
    }

    const adminAuth = sessionStorage.getItem("admin_auth");
    if (adminAuth === "true") {
      setIsAdmin(true);
    }
  }, [pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  // Close profile dropdown on route change
  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    setUserSession(null);
    setProfileOpen(false);
    router.push("/");
  };

  if (isLessonsPage || isAdminPage) return null;

  return (
    <nav className="fixed top-[8px] md:top-[12px] lg:top-[14px] left-0 w-full z-50 bg-primary/95 backdrop-blur-sm py-[8px] md:py-[12px] lg:py-[14px]">
      <div className="max-w-[1920px] mx-auto px-[10px] md:px-[40px] lg:px-[80px]">
        <div className="flex items-center justify-between">

          {/* Nav Links — always visible */}
          <div className="flex items-center gap-[2px] sm:gap-[6px] lg:gap-[14px]">
            {navLinks.map((link) => (
              <a
                key={link.sectionId}
                href={isHome ? link.href : `/${link.href}`}
                className={`text-[11px] sm:text-[13px] lg:text-[15px] px-[8px] sm:px-[14px] lg:px-[22px] py-[5px] sm:py-[7px] lg:py-[8px] rounded-[6px] transition-colors tracking-[0.03em] whitespace-nowrap ${
                  activeSection === link.sectionId
                    ? "bg-gold text-primary font-medium hover:bg-gold-light"
                    : "text-gold font-light hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-[6px] sm:gap-[10px]">
            {/* Admin panel link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-[6px] text-[13px] lg:text-[14px] text-gold/70 hover:text-gold font-medium px-[10px] py-[7px] rounded-[6px] hover:bg-white/5 transition-all"
              >
                <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Admin
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="sm:hidden text-gold/70 hover:text-gold w-[30px] h-[30px] flex items-center justify-center rounded-[6px] hover:bg-white/10 transition-colors"
                aria-label="Admin"
              >
                <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </Link>
            )}

            {userSession ? (
              /* User profile dropdown */
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-[6px] sm:gap-[8px] px-[8px] sm:px-[12px] py-[5px] sm:py-[6px] rounded-[8px] hover:bg-white/10 transition-colors"
                >
                  <div className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-[11px] sm:text-[13px]">
                      {userSession.name ? userSession.name[0].toUpperCase() : "U"}
                    </span>
                  </div>
                  <span className="hidden sm:block text-gold text-[13px] lg:text-[14px] font-medium max-w-[120px] truncate">
                    {userSession.name || "Foydalanuvchi"}
                  </span>
                  <svg className={`hidden sm:block w-[12px] h-[12px] text-gold/50 transition-transform ${profileOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] w-[200px] sm:w-[220px] bg-primary border border-gold/20 rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden z-50">
                    <div className="px-[14px] sm:px-[16px] py-[10px] sm:py-[12px] border-b border-gold/10">
                      <p className="text-gold text-[12px] sm:text-[13px] font-semibold truncate">{userSession.name}</p>
                      <p className="text-gold/40 text-[10px] sm:text-[11px] mt-[2px]">{userSession.course}</p>
                    </div>

                    <div className="py-[4px] sm:py-[6px]">
                      <Link
                        href="/courses"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-[8px] sm:gap-[10px] px-[14px] sm:px-[16px] py-[8px] sm:py-[10px] text-gold/70 hover:bg-white/5 hover:text-gold transition-colors text-[12px] sm:text-[13px]"
                      >
                        <svg className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                        Mening kurslarim
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-[8px] sm:gap-[10px] px-[14px] sm:px-[16px] py-[8px] sm:py-[10px] text-gold/70 hover:bg-white/5 hover:text-gold transition-colors text-[12px] sm:text-[13px]"
                        >
                          <svg className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                          </svg>
                          Admin panel
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gold/10 py-[4px] sm:py-[6px]">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-[8px] sm:gap-[10px] px-[14px] sm:px-[16px] py-[8px] sm:py-[10px] text-red-400/70 hover:bg-red-500/5 hover:text-red-400 transition-colors text-[12px] sm:text-[13px] w-full"
                      >
                        <svg className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Chiqish
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-gold text-primary text-[11px] sm:text-[13px] lg:text-[15px] font-semibold px-[12px] sm:px-[18px] lg:px-[22px] py-[5px] sm:py-[7px] lg:py-[8px] rounded-[6px] hover:bg-gold-light transition-colors tracking-[0.03em] whitespace-nowrap"
              >
                Kirish
              </Link>
            )}
          </div>
        </div>
      </div>

    </nav>
  );
}
