"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  KeyRound,
  LogOut,
  Globe,
  Lock,
  AlertCircle,
} from "lucide-react";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "boburbek";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Kurslar", icon: BookOpen },
  { href: "/admin/lessons", label: "Darsliklar", icon: GraduationCap },
  { href: "/admin/users", label: "Foydalanuvchilar", icon: Users },
  { href: "/admin/keys", label: "Kalitlar", icon: KeyRound },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_auth");
    if (stored === "true") setAuthed(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_auth", "true");
      setAuthed(true);
      setError("");
    } else {
      setError("Parol noto\u2018g\u2018ri!");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setAuthed(false);
    router.push("/admin");
  };

  if (!authed) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-[16px] overflow-hidden">
        <Image src="/assets/hero-bg.png" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-[#063087]/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#041e56]/60 via-transparent to-[#063087]/80" />
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-[#edcc8a]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-80px] left-[-80px] w-[350px] h-[350px] bg-[#e8632b]/8 rounded-full blur-[100px]" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <span className="absolute top-[8%] left-[10%] text-[80px] text-[#edcc8a]/[0.06] font-bold select-none">{"\u5B66"}</span>
          <span className="absolute top-[20%] right-[15%] text-[100px] text-[#edcc8a]/[0.05] font-bold select-none">{"\u4E2D"}</span>
          <span className="absolute bottom-[15%] left-[20%] text-[90px] text-[#edcc8a]/[0.05] font-bold select-none">{"\u6587"}</span>
          <span className="absolute bottom-[25%] right-[8%] text-[70px] text-[#edcc8a]/[0.06] font-bold select-none">{"\u534E"}</span>
          <span className="absolute top-[50%] left-[5%] text-[60px] text-[#edcc8a]/[0.05] font-bold select-none">{"\u8BED"}</span>
          <span className="absolute top-[40%] right-[5%] text-[110px] text-[#edcc8a]/[0.04] font-bold select-none">{"\u6CE2"}</span>
        </div>
        <form
          onSubmit={handleLogin}
          className="relative bg-white/[0.95] backdrop-blur-2xl rounded-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.4)] p-[36px] sm:p-[52px] w-full max-w-[440px] border border-white/30"
        >
          <div className="absolute top-0 left-[50%] translate-x-[-50%] w-[60%] h-[3px] bg-gradient-to-r from-transparent via-[#edcc8a] to-transparent rounded-full" />
          <div className="text-center mb-[32px]">
            <div className="w-[80px] h-[80px] mx-auto mb-[18px] relative">
              <Image src="/assets/logo.png" alt="Chinese Wave" width={80} height={80} className="rounded-[18px] shadow-[0_8px_28px_rgba(6,48,135,0.2)]" />
            </div>
            <h1 className="text-[26px] font-bold text-[#063087] tracking-[-0.01em]">Admin Panel</h1>
            <p className="text-[14px] text-[#063087]/40 mt-[6px] font-medium">Chinese Wave boshqaruv paneli</p>
          </div>
          <div className="mb-[20px]">
            <label className="block text-[12px] font-bold text-[#063087]/60 uppercase tracking-[0.08em] mb-[8px]">Parol</label>
            <div className="relative">
              <Lock className="absolute left-[14px] top-[50%] translate-y-[-50%] w-[16px] h-[16px] text-[#063087]/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin parolini kiriting..."
                className="w-full pl-[42px] pr-[16px] py-[14px] rounded-[12px] border-2 border-[#063087]/10 text-[15px] text-[#063087] font-medium bg-[#f8faff] focus:border-[#063087] focus:bg-white focus:ring-4 focus:ring-[#063087]/5 outline-none transition-all placeholder:text-[#063087]/25"
              />
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-[10px] px-[14px] py-[10px] mb-[16px] flex items-center gap-[8px]">
              <AlertCircle className="w-[14px] h-[14px] text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-[13px] font-semibold">{error}</p>
            </div>
          )}
          <button
            type="submit"
            className="w-full py-[14px] bg-gradient-to-r from-[#063087] to-[#041e56] text-[#edcc8a] font-bold text-[15px] rounded-[12px] hover:from-[#041e56] hover:to-[#031845] active:scale-[0.98] transition-all shadow-[0_8px_32px_rgba(6,48,135,0.35)] tracking-[0.02em]"
          >
            Kirish &rarr;
          </button>
          <div className="text-center mt-[20px]">
            <Link href="/" className="text-[13px] text-[#063087]/35 hover:text-[#063087]/60 font-medium transition-colors">
              &larr; Saytga qaytish
            </Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f7]">
      {/* Fixed Sidebar */}
      <aside className="w-[260px] fixed top-0 left-0 h-screen z-40 flex flex-col bg-gradient-to-b from-[#0a1e40] via-[#081938] to-[#060f28]">
        <div className="absolute top-0 left-0 w-full h-[180px] bg-gradient-to-b from-[#edcc8a]/[0.04] to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[100px] bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        {/* Logo */}
        <div className="relative px-[20px] py-[24px] flex items-center gap-[12px]">
          <div className="w-[40px] h-[40px] rounded-[11px] overflow-hidden ring-2 ring-[#edcc8a]/20 flex-shrink-0">
            <Image src="/assets/logo.png" alt="Logo" width={40} height={40} className="object-cover w-auto h-auto" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[16px] font-bold leading-tight text-[#edcc8a] tracking-[0.01em]">Chinese Wave</h2>
            <p className="text-[10px] text-white/30 font-medium tracking-[0.06em]">ADMIN PANEL</p>
          </div>
        </div>

        <div className="mx-[20px] h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        {/* Nav */}
        <nav className="flex-1 py-[18px] px-[14px] flex flex-col gap-[2px] relative overflow-y-auto">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/20 font-semibold mb-[8px] px-[12px]">
            Asosiy menyu
          </p>
          {sidebarLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(link.href + "/");
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative flex items-center gap-[12px] px-[12px] py-[11px] rounded-[10px] text-[14px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#edcc8a]/[0.14] to-[#edcc8a]/[0.05] text-[#edcc8a]"
                    : "text-white/45 hover:bg-white/[0.05] hover:text-white/80"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-[50%] translate-y-[-50%] w-[3px] h-[20px] bg-[#edcc8a] rounded-r-full shadow-[0_0_8px_rgba(237,204,138,0.4)]" />
                )}
                <Icon size={20} strokeWidth={isActive ? 2 : 1.6} className={`flex-shrink-0 transition-colors duration-200 ${isActive ? "text-[#edcc8a]" : "text-white/35 group-hover:text-white/65"}`} />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="relative px-[14px] py-[16px]">
          <div className="mx-[6px] mb-[10px] h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
          <button
            onClick={handleLogout}
            className="group flex items-center gap-[12px] px-[12px] py-[10px] rounded-[10px] text-[13px] font-medium text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
          >
            <LogOut size={18} strokeWidth={1.6} className="flex-shrink-0 text-white/25 group-hover:text-red-400 transition-colors" />
            <span>Chiqish</span>
          </button>
          <Link
            href="/"
            className="group flex items-center gap-[12px] px-[12px] py-[10px] rounded-[10px] text-[13px] font-medium text-white/30 hover:bg-white/[0.05] hover:text-white/60 transition-all w-full mt-[1px]"
          >
            <Globe size={18} strokeWidth={1.6} className="flex-shrink-0 text-white/25 group-hover:text-white/60 transition-colors" />
            <span>Saytga qaytish</span>
          </Link>
          <div className="mt-[10px] mx-[4px]">
            <div className="flex items-center gap-[6px] px-[10px] py-[7px] rounded-[8px] bg-white/[0.03] border border-white/[0.05]">
              <div className="w-[6px] h-[6px] rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              <span className="text-[10px] text-white/25 font-medium">v1.0 &mdash; Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-[260px]">
        <div className="sticky top-0 z-30 h-[56px] bg-white/80 backdrop-blur-xl border-b border-gray-200/60 flex items-center justify-between px-[28px]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[7px] h-[7px] rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
            <span className="text-[13px] text-gray-500 font-medium">
              {sidebarLinks.find((l) => l.exact ? pathname === l.href : pathname.startsWith(l.href + "/") || pathname === l.href)?.label || "Admin"}
            </span>
          </div>
          <div className="flex items-center gap-[12px]">
            {/* Saytga qaytish */}
            <Link
              href="/"
              className="flex items-center gap-[6px] text-[12px] text-gray-400 hover:text-[#063087] font-medium px-[10px] py-[6px] rounded-[8px] hover:bg-gray-100 transition-all"
            >
              <Globe size={14} strokeWidth={1.6} />
              <span className="hidden sm:inline">Saytga qaytish</span>
            </Link>
            {/* Kurslar */}
            <Link
              href="/courses"
              className="flex items-center gap-[6px] text-[12px] text-gray-400 hover:text-[#063087] font-medium px-[10px] py-[6px] rounded-[8px] hover:bg-gray-100 transition-all"
            >
              <BookOpen size={14} strokeWidth={1.6} />
              <span className="hidden sm:inline">Kurslar</span>
            </Link>
            {/* Divider */}
            <div className="w-px h-[24px] bg-gray-200" />
            {/* Admin avatar */}
            <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#063087] to-[#041e56] flex items-center justify-center shadow-sm">
              <span className="text-[12px] font-bold text-[#edcc8a]">A</span>
            </div>
          </div>
        </div>
        <div className="min-h-[calc(100vh-56px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
