"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Course } from "@/data/courses";
import type { UserRecord } from "@/app/api/users/route";
import {
  BookOpen,
  GraduationCap,
  Unlock,
  Type,
  ClipboardCheck,
  Users,
  KeyRound,
  Plus,
  ArrowRight,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/seed", { method: "POST" }).then(() => fetch("/api/courses").then((r) => r.json())),
      fetch("/api/users").then((r) => r.json()).catch(() => []),
    ]).then(([coursesData, usersData]) => {
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalLessons = courses.reduce((sum, c) => sum + c.lessons.length, 0);
  const totalWords = courses.reduce((sum, c) => sum + c.lessons.reduce((s, l) => s + (l.words?.length || 0), 0), 0);
  const totalTasks = courses.reduce((sum, c) => sum + c.lessons.reduce((s, l) => s + (l.tasks?.length || 0), 0), 0);
  const openLessons = courses.reduce((sum, c) => sum + c.lessons.filter((l) => !l.locked).length, 0);
  const activeUsers = users.filter((u) => u.active).length;
  const totalKeys = users.length;

  /* ── Chart Data ── */
  // Bar chart — lessons, words, tasks per course
  const courseBarData = courses.map((c) => ({
    name: c.title.replace("(3.0)", "").trim(),
    Darslar: c.lessons.length,
    "So\u2018zlar": c.lessons.reduce((s, l) => s + (l.words?.length || 0), 0),
    Vazifalar: c.lessons.reduce((s, l) => s + (l.tasks?.length || 0), 0),
  }));

  // Area chart — content growth (simulated cumulative per lesson)
  const contentGrowth = (() => {
    const data: { lesson: string; words: number; tasks: number }[] = [];
    let wordSum = 0;
    let taskSum = 0;
    courses.forEach((c) => {
      c.lessons.forEach((l, i) => {
        wordSum += l.words?.length || 0;
        taskSum += l.tasks?.length || 0;
        if (i % 4 === 0 || i === c.lessons.length - 1) {
          data.push({
            lesson: `${c.title.replace(" (3.0)", "").replace("HSK ", "H")}-${i + 1}`,
            words: wordSum,
            tasks: taskSum,
          });
        }
      });
    });
    return data;
  })();

  // Pie chart — course distribution by lessons
  const pieData = courses.map((c) => ({
    name: c.title.replace("(3.0)", "").trim(),
    value: c.lessons.length,
  }));
  const PIE_COLORS = ["#3b82f6", "#f97316", "#10b981", "#8b5cf6", "#ec4899"];

  // User stats
  const userStats = {
    total: users.length,
    active: users.filter((u) => u.active).length,
    blocked: users.filter((u) => !u.active).length,
  };

  const stats = [
    { label: "Kurslar", value: courses.length, icon: BookOpen, color: "text-blue-600", iconBg: "bg-blue-50 text-blue-500", href: "/admin/courses" },
    { label: "Darsliklar", value: totalLessons, icon: GraduationCap, color: "text-orange-600", iconBg: "bg-orange-50 text-orange-500", href: "/admin/lessons" },
    { label: "Ochiq darslar", value: openLessons, icon: Unlock, color: "text-emerald-600", iconBg: "bg-emerald-50 text-emerald-500", href: "/admin/lessons" },
    { label: "So\u2018zlar", value: totalWords, icon: Type, color: "text-violet-600", iconBg: "bg-violet-50 text-violet-500", href: "/admin/lessons" },
    { label: "Vazifalar", value: totalTasks, icon: ClipboardCheck, color: "text-amber-600", iconBg: "bg-amber-50 text-amber-500", href: "/admin/lessons" },
    { label: "Foydalanuvchilar", value: activeUsers, icon: Users, color: "text-cyan-600", iconBg: "bg-cyan-50 text-cyan-500", href: "/admin/users" },
    { label: "Kalitlar", value: totalKeys, icon: KeyRound, color: "text-pink-600", iconBg: "bg-pink-50 text-pink-500", href: "/admin/keys" },
  ];

  const quickActions = [
    { label: "Yangi kurs", desc: "Kurs qo\u2018shish", icon: BookOpen, href: "/admin/courses", gradient: "from-blue-500 to-blue-600" },
    { label: "Yangi dars", desc: "Dars qo\u2018shish", icon: GraduationCap, href: "/admin/lessons", gradient: "from-orange-500 to-orange-600" },
    { label: "Foydalanuvchi", desc: "Yangi qo\u2018shish", icon: Users, href: "/admin/users", gradient: "from-emerald-500 to-emerald-600" },
    { label: "Kalit yaratish", desc: "Kalit generatsiya", icon: KeyRound, href: "/admin/keys", gradient: "from-violet-500 to-violet-600" },
  ];

  return (
    <div className="p-[24px] sm:p-[32px] lg:p-[40px]">
      {/* Header */}
      <div className="mb-[28px]">
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[#1a1a2e] tracking-[-0.02em]">Dashboard</h1>
        <p className="text-[14px] text-gray-400 mt-[4px]">Chinese Wave &mdash; umumiy ko&apos;rinish va analitika</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-[14px]">
            <div className="w-[40px] h-[40px] border-[3px] border-gray-200 border-t-[#063087] rounded-full animate-spin" />
            <p className="text-[13px] text-gray-400">Ma&apos;lumotlar yuklanmoqda...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[12px] mb-[24px]">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <Link
                  key={i}
                  href={s.href}
                  className="group bg-white rounded-[16px] border border-gray-100/80 p-[18px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-gray-200/80 transition-all duration-300 hover:-translate-y-[2px] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50/0 to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-[14px]">
                    <div className={`w-[44px] h-[44px] ${s.iconBg} rounded-[12px] flex items-center justify-center group-hover:scale-105 transition-transform duration-300 flex-shrink-0`}>
                      <Icon size={22} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className={`text-[22px] font-bold ${s.color} leading-none tracking-[-0.01em]`}>{s.value}</p>
                      <p className="text-[12px] text-gray-400 mt-[3px] font-medium">{s.label}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-[24px]">
            <h2 className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.06em] mb-[12px]">Tezkor amallar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-[12px]">
              {quickActions.map((a, i) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={i}
                    href={a.href}
                    className={`group relative bg-gradient-to-br ${a.gradient} rounded-[14px] px-[18px] py-[16px] text-white overflow-hidden hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-[1px] active:scale-[0.98]`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-start justify-between">
                      <div>
                        <span className="text-[14px] font-semibold block">{a.label}</span>
                        <span className="text-[11px] text-white/60 mt-[2px] block">{a.desc}</span>
                      </div>
                      <div className="w-[32px] h-[32px] bg-white/15 rounded-[10px] flex items-center justify-center mt-[-2px]">
                        <Plus size={18} strokeWidth={2} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── ANALYTICS SECTION ── */}
          <div className="mb-[24px]">
            <div className="flex items-center gap-[8px] mb-[14px]">
              <Activity size={16} className="text-[#063087]" />
              <h2 className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.06em]">Analitika</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
              {/* Bar Chart — Kurs bo'yicha kontent */}
              <div className="bg-white rounded-[16px] border border-gray-100/80 p-[22px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-[18px]">
                  <div className="flex items-center gap-[8px]">
                    <div className="w-[32px] h-[32px] bg-blue-50 rounded-[9px] flex items-center justify-center">
                      <BarChart3 size={17} className="text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#1a1a2e]">Kurs bo&apos;yicha kontent</h3>
                      <p className="text-[11px] text-gray-400">Darslar, so&apos;zlar va vazifalar</p>
                    </div>
                  </div>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={courseBarData} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={35} />
                      <Tooltip
                        contentStyle={{
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                          fontSize: "12px",
                          padding: "10px 14px",
                        }}
                      />
                      <Bar dataKey="Darslar" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="So&#x2018;zlar" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Vazifalar" fill="#f97316" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-[16px] mt-[10px]">
                  <div className="flex items-center gap-[5px]"><div className="w-[10px] h-[10px] rounded-[3px] bg-blue-500" /><span className="text-[11px] text-gray-400">Darslar</span></div>
                  <div className="flex items-center gap-[5px]"><div className="w-[10px] h-[10px] rounded-[3px] bg-violet-500" /><span className="text-[11px] text-gray-400">So&apos;zlar</span></div>
                  <div className="flex items-center gap-[5px]"><div className="w-[10px] h-[10px] rounded-[3px] bg-orange-500" /><span className="text-[11px] text-gray-400">Vazifalar</span></div>
                </div>
              </div>

              {/* Area Chart — Kontent o'sishi */}
              <div className="bg-white rounded-[16px] border border-gray-100/80 p-[22px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-[18px]">
                  <div className="flex items-center gap-[8px]">
                    <div className="w-[32px] h-[32px] bg-emerald-50 rounded-[9px] flex items-center justify-center">
                      <TrendingUp size={17} className="text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#1a1a2e]">Kontent o&apos;sishi</h3>
                      <p className="text-[11px] text-gray-400">Kumulyativ so&apos;zlar va vazifalar</p>
                    </div>
                  </div>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={contentGrowth}>
                      <defs>
                        <linearGradient id="gradWords" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradTasks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="lesson" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={35} />
                      <Tooltip
                        contentStyle={{
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                          fontSize: "12px",
                          padding: "10px 14px",
                        }}
                      />
                      <Area type="monotone" dataKey="words" stroke="#3b82f6" strokeWidth={2} fill="url(#gradWords)" name="So'zlar" />
                      <Area type="monotone" dataKey="tasks" stroke="#10b981" strokeWidth={2} fill="url(#gradTasks)" name="Vazifalar" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-[16px] mt-[10px]">
                  <div className="flex items-center gap-[5px]"><div className="w-[10px] h-[10px] rounded-full bg-blue-500" /><span className="text-[11px] text-gray-400">So&apos;zlar</span></div>
                  <div className="flex items-center gap-[5px]"><div className="w-[10px] h-[10px] rounded-full bg-emerald-500" /><span className="text-[11px] text-gray-400">Vazifalar</span></div>
                </div>
              </div>

              {/* Pie Chart — Kurs taqsimoti */}
              <div className="bg-white rounded-[16px] border border-gray-100/80 p-[22px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-[18px]">
                  <div className="flex items-center gap-[8px]">
                    <div className="w-[32px] h-[32px] bg-violet-50 rounded-[9px] flex items-center justify-center">
                      <PieChartIcon size={17} className="text-violet-500" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#1a1a2e]">Darslar taqsimoti</h3>
                      <p className="text-[11px] text-gray-400">Kurslar bo&apos;yicha darslar ulushi</p>
                    </div>
                  </div>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                          fontSize: "12px",
                          padding: "10px 14px",
                        }}
                        formatter={(value: unknown, name: unknown) => [`${value} dars`, String(name)]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value: string) => <span className="text-[12px] text-gray-500 ml-[3px]">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* User Stats Card */}
              <div className="bg-white rounded-[16px] border border-gray-100/80 p-[22px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-[18px]">
                  <div className="flex items-center gap-[8px]">
                    <div className="w-[32px] h-[32px] bg-cyan-50 rounded-[9px] flex items-center justify-center">
                      <Users size={17} className="text-cyan-500" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#1a1a2e]">Foydalanuvchilar holati</h3>
                      <p className="text-[11px] text-gray-400">Aktiv va bloklangan</p>
                    </div>
                  </div>
                  <Link href="/admin/users" className="text-[12px] text-[#063087] font-semibold hover:underline">Barchasi</Link>
                </div>

                {/* Big numbers */}
                <div className="grid grid-cols-3 gap-[12px] mb-[20px]">
                  <div className="bg-gray-50 rounded-[12px] p-[16px] text-center">
                    <p className="text-[28px] font-bold text-[#1a1a2e] leading-none">{userStats.total}</p>
                    <p className="text-[11px] text-gray-400 mt-[5px] font-medium">Jami</p>
                  </div>
                  <div className="bg-emerald-50 rounded-[12px] p-[16px] text-center">
                    <p className="text-[28px] font-bold text-emerald-600 leading-none">{userStats.active}</p>
                    <p className="text-[11px] text-emerald-500 mt-[5px] font-medium">Aktiv</p>
                  </div>
                  <div className="bg-red-50 rounded-[12px] p-[16px] text-center">
                    <p className="text-[28px] font-bold text-red-500 leading-none">{userStats.blocked}</p>
                    <p className="text-[11px] text-red-400 mt-[5px] font-medium">Bloklangan</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-[6px]">
                    <span className="text-[11px] text-gray-400 font-medium">Aktivlik darajasi</span>
                    <span className="text-[12px] font-bold text-emerald-600">
                      {userStats.total > 0 ? Math.round((userStats.active / userStats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-[8px] bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${userStats.total > 0 ? (userStats.active / userStats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Kontent summary at bottom */}
                <div className="mt-[18px] pt-[16px] border-t border-gray-100">
                  <p className="text-[11px] text-gray-400 font-medium mb-[10px]">Kontent xulosa</p>
                  <div className="grid grid-cols-2 gap-[8px]">
                    <div className="flex items-center gap-[8px] bg-blue-50/50 rounded-[8px] px-[10px] py-[8px]">
                      <BookOpen size={14} className="text-blue-500" />
                      <span className="text-[12px] text-gray-600"><b className="text-blue-600">{totalLessons}</b> dars</span>
                    </div>
                    <div className="flex items-center gap-[8px] bg-violet-50/50 rounded-[8px] px-[10px] py-[8px]">
                      <Type size={14} className="text-violet-500" />
                      <span className="text-[12px] text-gray-600"><b className="text-violet-600">{totalWords}</b> so&apos;z</span>
                    </div>
                    <div className="flex items-center gap-[8px] bg-amber-50/50 rounded-[8px] px-[10px] py-[8px]">
                      <ClipboardCheck size={14} className="text-amber-500" />
                      <span className="text-[12px] text-gray-600"><b className="text-amber-600">{totalTasks}</b> vazifa</span>
                    </div>
                    <div className="flex items-center gap-[8px] bg-pink-50/50 rounded-[8px] px-[10px] py-[8px]">
                      <KeyRound size={14} className="text-pink-500" />
                      <span className="text-[12px] text-gray-600"><b className="text-pink-600">{totalKeys}</b> kalit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── BOTTOM SECTION: Courses Table + Recent Users ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[16px]">
            {/* Courses Table */}
            <div className="lg:col-span-2 bg-white rounded-[16px] border border-gray-100/80 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="px-[22px] py-[18px] border-b border-gray-100/60 flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-bold text-[#1a1a2e]">Kurslar</h2>
                  <p className="text-[11px] text-gray-400 mt-[1px]">{courses.length} ta kurs mavjud</p>
                </div>
                <Link href="/admin/courses" className="flex items-center gap-[5px] text-[12px] text-[#063087] font-semibold hover:text-[#041e56] transition-colors group">
                  Barchasi
                  <ArrowRight size={14} className="group-hover:translate-x-[2px] transition-transform" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/60">
                      <th className="px-[22px] py-[11px] text-[10px] uppercase tracking-[0.08em] text-gray-400 font-bold">Kurs</th>
                      <th className="px-[22px] py-[11px] text-[10px] uppercase tracking-[0.08em] text-gray-400 font-bold">Darslar</th>
                      <th className="px-[22px] py-[11px] text-[10px] uppercase tracking-[0.08em] text-gray-400 font-bold">So&apos;zlar</th>
                      <th className="px-[22px] py-[11px] text-[10px] uppercase tracking-[0.08em] text-gray-400 font-bold">Narx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c, idx) => (
                      <tr key={c.slug} className={`hover:bg-gray-50/60 transition-colors ${idx < courses.length - 1 ? "border-b border-gray-50" : ""}`}>
                        <td className="px-[22px] py-[14px]">
                          <div className="flex items-center gap-[10px]">
                            <div className="w-[40px] h-[40px] rounded-[10px] bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 overflow-hidden flex-shrink-0 relative">
                              <Image
                                src={c.image || "/assets/course-1.png"}
                                alt={c.title}
                                fill
                                className="object-contain p-[4px]"
                                sizes="40px"
                              />
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-[#1a1a2e]">{c.title}</p>
                              <p className="text-[11px] text-gray-400">{c.level}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-[22px] py-[14px]">
                          <span className="inline-flex items-center px-[8px] py-[3px] rounded-full bg-blue-50 text-blue-600 text-[12px] font-semibold">
                            {c.lessons.length}
                          </span>
                        </td>
                        <td className="px-[22px] py-[14px] text-[13px] text-gray-500 font-medium">{c.wordsCount}</td>
                        <td className="px-[22px] py-[14px] text-[13px] font-bold text-[#063087]">{c.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-[16px] border border-gray-100/80 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="px-[22px] py-[18px] border-b border-gray-100/60 flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-bold text-[#1a1a2e]">So&apos;nggi foydalanuvchilar</h2>
                  <p className="text-[11px] text-gray-400 mt-[1px]">{users.length} ta foydalanuvchi</p>
                </div>
                <Link href="/admin/users" className="flex items-center gap-[5px] text-[12px] text-[#063087] font-semibold hover:text-[#041e56] transition-colors group">
                  Barchasi
                  <ArrowRight size={14} className="group-hover:translate-x-[2px] transition-transform" />
                </Link>
              </div>
              <div className="p-[16px]">
                {users.length === 0 ? (
                  <div className="text-center py-[36px]">
                    <div className="w-[52px] h-[52px] mx-auto mb-[12px] rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                      <Users size={24} />
                    </div>
                    <p className="text-[13px] text-gray-400 mb-[6px]">Hali foydalanuvchi yo&apos;q</p>
                    <Link href="/admin/users" className="inline-flex items-center gap-[4px] text-[12px] text-[#063087] font-semibold hover:underline">
                      <Plus size={14} />
                      <span>Qo&apos;shish</span>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-[6px]">
                    {users.slice(-5).reverse().map((u) => (
                      <div key={u.id} className="flex items-center gap-[10px] p-[11px] rounded-[12px] hover:bg-gray-50/80 transition-colors">
                        <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#063087] to-[#041e56] flex items-center justify-center text-[12px] text-[#edcc8a] font-bold flex-shrink-0 shadow-[0_2px_8px_rgba(6,48,135,0.2)]">
                          {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#1a1a2e] truncate">{u.name || "Nomsiz"}</p>
                          <p className="text-[11px] text-gray-400 truncate">{u.course || "Kurs tayinlanmagan"}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-[8px] py-[3px] rounded-full ${
                          u.active
                            ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                            : "bg-red-50 text-red-400 ring-1 ring-red-100"
                        }`}>
                          {u.active ? "Aktiv" : "Bloklangan"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
