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
  const [mobileOpen, setMobileOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Close mobile menu on scroll
  useEffect(() => {
    if (!mobileOpen) return;
    const close = () => setMobileOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    setUserSession(null);
    setProfileOpen(false);
    router.push("/");
  };

  if (isLessonsPage || isAdminPage) return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-primary/95 backdrop-blur-sm py-[8px] md:py-[14px] lg:py-[16px]">
      <div className="max-w-[1920px] mx-auto px-[10px] md:px-[40px] lg:px-[80px]">
        <div className="flex items-center justify-between">

          {/* Mobile: Hamburger */}
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

          {/* Right side — Desktop */}
          <div className="hidden md:flex items-center gap-[10px]">
            {/* Admin panel link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-[6px] text-[13px] lg:text-[14px] text-gold/70 hover:text-gold font-medium px-[14px] py-[7px] rounded-[6px] hover:bg-white/5 transition-all"
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

            {userSession ? (
              /* User profile dropdown */
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-[8px] px-[12px] py-[6px] rounded-[8px] hover:bg-white/10 transition-colors"
                >
                  <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-[13px]">
                      {userSession.name ? userSession.name[0].toUpperCase() : "U"}
                    </span>
                  </div>
                  <span className="text-gold text-[13px] lg:text-[14px] font-medium max-w-[120px] truncate">
                    {userSession.name || "Foydalanuvchi"}
                  </span>
                  <svg className={`w-[12px] h-[12px] text-gold/50 transition-transform ${profileOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] w-[220px] bg-primary border border-gold/20 rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden z-50">
                    <div className="px-[16px] py-[12px] border-b border-gold/10">
                      <p className="text-gold text-[13px] font-semibold truncate">{userSession.name}</p>
                      <p className="text-gold/40 text-[11px] mt-[2px]">{userSession.course}</p>
                    </div>

                    <div className="py-[6px]">
                      <Link
                        href="/courses"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-[10px] px-[16px] py-[10px] text-gold/70 hover:bg-white/5 hover:text-gold transition-colors text-[13px]"
                      >
                        <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                        Mening kurslarim
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-[10px] px-[16px] py-[10px] text-gold/70 hover:bg-white/5 hover:text-gold transition-colors text-[13px]"
                        >
                          <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                          </svg>
                          Admin panel
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gold/10 py-[6px]">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-[10px] px-[16px] py-[10px] text-red-400/70 hover:bg-red-500/5 hover:text-red-400 transition-colors text-[13px] w-full"
                      >
                        <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                className="bg-gold text-primary text-[13px] lg:text-[15px] font-semibold px-[20px] py-[8px] lg:px-[24px] lg:py-[9px] rounded-[6px] hover:bg-gold-light transition-colors tracking-[0.03em] whitespace-nowrap"
              >
                Kirish
              </Link>
            )}
          </div>

          {/* Right side — Mobile */}
          <div className="md:hidden flex items-center gap-[6px]">
            {isAdmin && (
              <Link
                href="/admin"
                className="text-gold/70 hover:text-gold w-[32px] h-[32px] flex items-center justify-center rounded-[6px] hover:bg-white/10 transition-colors"
                aria-label="Admin"
              >
                <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </Link>
            )}

            {userSession ? (
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center"
              >
                <span className="text-primary font-bold text-[11px]">
                  {userSession.name ? userSession.name[0].toUpperCase() : "U"}
                </span>
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-gold text-primary text-[11px] font-semibold px-[14px] py-[6px] rounded-[6px] hover:bg-gold-light transition-colors tracking-[0.03em] whitespace-nowrap"
              >
                Kirish
              </Link>
            )}
          </div>
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

            {/* Mobile: user info & admin */}
            {userSession && (
              <>
                <div className="h-px bg-gold/10 my-[6px]" />
                <div className="flex items-center gap-[10px] px-[14px] py-[8px]">
                  <div className="w-[28px] h-[28px] rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-[11px]">{userSession.name ? userSession.name[0].toUpperCase() : "U"}</span>
                  </div>
                  <div>
                    <p className="text-gold text-[13px] font-semibold">{userSession.name}</p>
                    <p className="text-gold/40 text-[10px]">{userSession.course}</p>
                  </div>
                </div>

                <Link
                  href="/courses"
                  onClick={() => setMobileOpen(false)}
                  className="text-[14px] px-[14px] py-[10px] rounded-[8px] text-gold font-light hover:bg-white/10 transition-colors flex items-center gap-[8px]"
                >
                  <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                  Mening kurslarim
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="text-[14px] px-[14px] py-[10px] rounded-[8px] text-gold font-light hover:bg-white/10 transition-colors flex items-center gap-[8px]"
                  >
                    <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    Admin panel
                  </Link>
                )}

                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="text-[14px] px-[14px] py-[10px] rounded-[8px] text-red-400/70 hover:bg-red-500/5 hover:text-red-400 transition-colors flex items-center gap-[8px] w-full text-left"
                >
                  <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Chiqish
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile Profile Dropdown (when avatar clicked) */}
      {profileOpen && userSession && !mobileOpen && (
        <div className="md:hidden fixed top-[52px] right-[10px] w-[200px] bg-primary border border-gold/20 rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden z-50">
          <div className="px-[14px] py-[10px] border-b border-gold/10">
            <p className="text-gold text-[12px] font-semibold truncate">{userSession.name}</p>
            <p className="text-gold/40 text-[10px] mt-[1px]">{userSession.course}</p>
          </div>
          <div className="py-[4px]">
            <Link href="/courses" onClick={() => setProfileOpen(false)} className="flex items-center gap-[8px] px-[14px] py-[8px] text-gold/70 hover:bg-white/5 text-[12px]">
              <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
              Kurslarim
            </Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-[8px] px-[14px] py-[8px] text-gold/70 hover:bg-white/5 text-[12px]">
                <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Admin panel
              </Link>
            )}
          </div>
          <div className="border-t border-gold/10 py-[4px]">
            <button onClick={handleLogout} className="flex items-center gap-[8px] px-[14px] py-[8px] text-red-400/70 hover:text-red-400 text-[12px] w-full">
              <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              Chiqish
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
