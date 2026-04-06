"use client";

import { useState, useEffect } from "react";
import { KeyRound, CheckCircle, Package, Clock, Search, Copy, Check, X, Trash2, Loader2, Lightbulb, Plus } from "lucide-react";
import type { UserRecord } from "@/app/api/users/route";
import type { Course, Lesson } from "@/data/courses";

export default function AdminKeysPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGen, setShowGen] = useState(false);
  const [genCount, setGenCount] = useState(1);
  const [genCourse, setGenCourse] = useState("");
  const [genLessonId, setGenLessonId] = useState<number | null>(null);
  const [genExpiry, setGenExpiry] = useState(365);
  const [genName, setGenName] = useState("");
  const [genPhone, setGenPhone] = useState("");
  const [genUseExpiry, setGenUseExpiry] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "unused">("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then((r) => r.json()).catch(() => []),
      fetch("/api/courses").then((r) => r.json()).catch(() => []),
    ]).then(([u, c]) => {
      setUsers(Array.isArray(u) ? u : []);
      setCourses(Array.isArray(c) ? c : []);
      setLoading(false);
    });
  }, []);

  // Kurs tanlanganda darslarni yuklash
  useEffect(() => {
    if (genCourse) {
      fetch(`/api/lessons?slug=${genCourse}`).then((r) => r.json()).then((data) => {
        setLessons(Array.isArray(data) ? data : []);
      }).catch(() => setLessons([]));
    } else {
      setLessons([]);
      setGenLessonId(null);
    }
  }, [genCourse]);

  const refetch = () => fetch("/api/users").then((r) => r.json()).then((d) => setUsers(Array.isArray(d) ? d : []));

  const generateKeys = async () => {
    setGenerating(true);
    const promises = [];
    for (let i = 0; i < genCount; i++) {
      promises.push(
        fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: genName.trim(),
            phone: genPhone.trim(),
            telegram: "",
            course: genCourse,
            lessonId: genLessonId || undefined,
            maxDevices: 2,
            active: true,
            ...(genUseExpiry
              ? { expiresAt: new Date(Date.now() + genExpiry * 24 * 60 * 60 * 1000).toISOString() }
              : {}),
          }),
        })
      );
    }
    await Promise.all(promises);
    setShowGen(false);
    setGenerating(false);
    setGenName("");
    setGenPhone("");
    setGenLessonId(null);
    setGenUseExpiry(false);
    refetch();
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const copyAllKeys = () => {
    const keys = filtered.map((u) => u.key).join("\n");
    navigator.clipboard.writeText(keys);
    setCopiedKey("ALL");
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const toggleActive = async (user: UserRecord) => {
    await fetch(`/api/users?id=${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !user.active }),
    });
    refetch();
  };

  const deleteKey = async (id: string) => {
    if (!confirm("Bu kalitni o'chirmoqchimisiz?")) return;
    await fetch(`/api/users?id=${id}`, { method: "DELETE" });
    refetch();
  };

  const filtered = users.filter((u) => {
    if (filter === "active" && !u.active) return false;
    if (filter === "inactive" && u.active) return false;
    if (filter === "unused" && (u.name || u.devices?.length > 0)) return false;
    if (search && !u.key.toLowerCase().includes(search.toLowerCase()) && !u.name.toLowerCase().includes(search.toLowerCase()) && !(u.phone || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeKeys = users.filter((u) => u.active).length;
  const unusedKeys = users.filter((u) => !u.name && (!u.devices || u.devices.length === 0)).length;
  const expiredKeys = users.filter((u) => new Date(u.expiresAt) < new Date()).length;

  return (
    <div className="p-[20px] sm:p-[28px] md:p-[36px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-[24px] flex-wrap gap-[12px]">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-bold text-[#1a1a2e] tracking-[-0.02em]">Kalitlar</h1>
          <p className="text-[13px] text-gray-400 mt-[2px]">Kirish kalitlarini yaratish va boshqarish</p>
        </div>
        <button onClick={() => setShowGen(true)}
          className="px-[18px] py-[10px] bg-gradient-to-r from-violet-600 to-violet-700 text-white text-[13px] font-bold rounded-[10px] hover:opacity-90 active:scale-[0.97] transition-all shadow-[0_4px_16px_rgba(124,58,237,0.25)] flex items-center gap-[6px]">
          <KeyRound size={16} /> Kalit yaratish
        </button>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[10px] mb-[20px]">
        <div className="bg-white rounded-[12px] border border-gray-100 p-[14px] flex items-center gap-[10px]">
          <div className="w-[34px] h-[34px] bg-violet-50 rounded-[8px] flex items-center justify-center"><KeyRound size={16} className="text-violet-500" /></div>
          <div><p className="text-[18px] font-bold text-[#1a1a2e]">{users.length}</p><p className="text-[10px] text-gray-400">Jami kalitlar</p></div>
        </div>
        <div className="bg-white rounded-[12px] border border-gray-100 p-[14px] flex items-center gap-[10px]">
          <div className="w-[34px] h-[34px] bg-emerald-50 rounded-[8px] flex items-center justify-center"><CheckCircle size={16} className="text-emerald-500" /></div>
          <div><p className="text-[18px] font-bold text-emerald-600">{activeKeys}</p><p className="text-[10px] text-gray-400">Aktiv</p></div>
        </div>
        <div className="bg-white rounded-[12px] border border-gray-100 p-[14px] flex items-center gap-[10px]">
          <div className="w-[34px] h-[34px] bg-amber-50 rounded-[8px] flex items-center justify-center"><Package size={16} className="text-amber-500" /></div>
          <div><p className="text-[18px] font-bold text-amber-600">{unusedKeys}</p><p className="text-[10px] text-gray-400">Ishlatilmagan</p></div>
        </div>
        <div className="bg-white rounded-[12px] border border-gray-100 p-[14px] flex items-center gap-[10px]">
          <div className="w-[34px] h-[34px] bg-red-50 rounded-[8px] flex items-center justify-center"><Clock size={16} className="text-red-400" /></div>
          <div><p className="text-[18px] font-bold text-red-500">{expiredKeys}</p><p className="text-[10px] text-gray-400">Muddati o&apos;tgan</p></div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-[10px] mb-[16px] flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[350px]">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kalit yoki ism bo'yicha qidirish..."
            title="Qidirish" className="w-full px-[14px] py-[10px] pl-[36px] rounded-[10px] border border-gray-200 text-[13px] bg-white text-gray-700 focus:border-[#063087] outline-none" />
          <Search size={15} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex gap-[4px]">
          {(["all", "active", "inactive", "unused"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-[12px] py-[7px] rounded-[8px] text-[11px] font-semibold transition-all ${filter === f ? "bg-[#063087] text-[#edcc8a]" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
              {f === "all" ? "Barchasi" : f === "active" ? "Aktiv" : f === "inactive" ? "Bloklangan" : "Ishlatilmagan"}
            </button>
          ))}
        </div>
        {filtered.length > 0 && (
          <button onClick={copyAllKeys} className="px-[12px] py-[7px] rounded-[8px] text-[11px] font-semibold bg-violet-50 text-violet-600 hover:bg-violet-100 transition-all flex items-center gap-[4px]">
            {copiedKey === "ALL" ? <><Check size={12} /> Nusxalandi!</> : <><Copy size={12} /> Barchasini nusxalash</>}
          </button>
        )}
      </div>

      {/* ── GENERATE MODAL ── */}
      {showGen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-[12px]" onClick={() => setShowGen(false)}>
          <div className="bg-white rounded-[18px] shadow-2xl w-full max-w-[420px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-[24px] py-[16px] border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-[#1a1a2e] flex items-center gap-[6px]"><KeyRound size={18} className="text-violet-600" /> Kalit yaratish</h2>
              <button onClick={() => setShowGen(false)} className="w-[30px] h-[30px] rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200" title="Yopish"><X size={14} className="text-gray-500" /></button>
            </div>
            <div className="px-[24px] py-[20px] flex flex-col gap-[14px]">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-[0.06em] mb-[4px]">Ism (ixtiyoriy)</label>
                <input type="text" value={genName} onChange={(e) => setGenName(e.target.value)}
                  placeholder="Foydalanuvchi ismi"
                  title="Ism"
                  className="w-full px-[12px] py-[10px] rounded-[8px] border border-gray-200 text-[14px] bg-[#f9fafb] text-gray-800 outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-[0.06em] mb-[4px]">Telefon raqami (ixtiyoriy)</label>
                <input type="tel" value={genPhone} onChange={(e) => setGenPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  title="Telefon"
                  className="w-full px-[12px] py-[10px] rounded-[8px] border border-gray-200 text-[14px] bg-[#f9fafb] text-gray-800 outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-[0.06em] mb-[4px]">Nechta kalit</label>
                <input type="number" value={genCount} onChange={(e) => setGenCount(Math.max(1, Math.min(50, Number(e.target.value))))}
                  title="Nechta kalit" min={1} max={50}
                  className="w-full px-[12px] py-[10px] rounded-[8px] border border-gray-200 text-[14px] bg-[#f9fafb] text-gray-800 outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-[0.06em] mb-[4px]">Kurs</label>
                <select value={genCourse} onChange={(e) => { setGenCourse(e.target.value); setGenLessonId(null); }} title="Kurs"
                  className="w-full px-[12px] py-[10px] rounded-[8px] border border-gray-200 text-[13px] bg-[#f9fafb] text-gray-800 outline-none">
                  <option value="">Tanlanmagan (umumiy)</option>
                  {courses.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                </select>
              </div>
              {genCourse && lessons.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-[0.06em] mb-[4px]">Dars (ixtiyoriy)</label>
                  <select value={genLessonId ?? ""} onChange={(e) => setGenLessonId(e.target.value ? Number(e.target.value) : null)} title="Dars"
                    className="w-full px-[12px] py-[10px] rounded-[8px] border border-gray-200 text-[13px] bg-[#f9fafb] text-gray-800 outline-none">
                    <option value="">Barcha darslar (umumiy)</option>
                    {lessons.map((l) => <option key={l.id} value={l.id}>{l.title} — {l.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="flex items-center gap-[8px] cursor-pointer">
                  <input type="checkbox" checked={genUseExpiry} onChange={(e) => setGenUseExpiry(e.target.checked)}
                    className="w-[16px] h-[16px] accent-violet-600 rounded" />
                  <span className="text-[12px] font-semibold text-gray-600">Muddat belgilash</span>
                </label>
              </div>
              {genUseExpiry && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-[0.06em] mb-[4px]">Amal qilish muddati</label>
                  <select value={genExpiry} onChange={(e) => setGenExpiry(Number(e.target.value))} title="Muddat"
                    className="w-full px-[12px] py-[10px] rounded-[8px] border border-gray-200 text-[13px] bg-[#f9fafb] text-gray-800 outline-none">
                    <option value={30}>30 kun</option>
                    <option value={90}>90 kun</option>
                    <option value={180}>6 oy</option>
                    <option value={365}>1 yil</option>
                    <option value={730}>2 yil</option>
                    <option value={3650}>10 yil (cheksiz)</option>
                  </select>
                </div>
              )}
              <div className="bg-violet-50 rounded-[10px] p-[12px] text-[12px] text-violet-700 flex items-start gap-[6px]">
                <Lightbulb size={14} className="mt-[1px] flex-shrink-0" /> <span><strong>{genCount}</strong> ta yangi kalit yaratiladi{genName ? ` — ${genName}` : ""}{genPhone ? ` (${genPhone})` : ""}{genLessonId ? `, dars: ${lessons.find(l => l.id === genLessonId)?.title || genLessonId}` : ""}{genUseExpiry ? `, muddat: ${genExpiry} kun` : ", muddatsiz"}.</span>
              </div>
            </div>
            <div className="px-[24px] py-[14px] border-t border-gray-100 flex justify-end gap-[8px]">
              <button onClick={() => setShowGen(false)} className="px-[16px] py-[9px] rounded-[8px] border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50">Bekor</button>
              <button onClick={generateKeys} disabled={generating}
                className="px-[20px] py-[9px] bg-gradient-to-r from-violet-600 to-violet-700 text-white text-[13px] font-bold rounded-[8px] hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-[5px]">
                {generating ? <><Loader2 size={14} className="animate-spin" /> Yaratilmoqda...</> : <><KeyRound size={14} /> {genCount} ta yaratish</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── KEYS TABLE ── */}
      {loading ? (
        <div className="flex items-center justify-center h-[200px]">
          <div className="w-[32px] h-[32px] border-[3px] border-gray-200 border-t-violet-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-[14px] border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f9fafb] text-[10px] uppercase tracking-[0.08em] text-gray-400 font-bold">
                  <th className="px-[16px] py-[10px]">#</th>
                  <th className="px-[16px] py-[10px]">Kalit</th>
                  <th className="px-[16px] py-[10px]">Foydalanuvchi</th>
                  <th className="px-[16px] py-[10px]">Kurs</th>
                  <th className="px-[16px] py-[10px]">Dars</th>
                  <th className="px-[16px] py-[10px]">Qurilmalar</th>
                  <th className="px-[16px] py-[10px]">Muddat</th>
                  <th className="px-[16px] py-[10px]">Holat</th>
                  <th className="px-[16px] py-[10px]">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const expired = new Date(u.expiresAt) < new Date();
                  return (
                    <tr key={u.id} className="border-t border-gray-50 hover:bg-[#fafbfc] transition-colors">
                      <td className="px-[16px] py-[10px] text-[11px] text-gray-300">{i + 1}</td>
                      <td className="px-[16px] py-[10px]">
                        <div className="flex items-center gap-[6px]">
                          <code className="text-[11px] font-mono text-violet-700 bg-violet-50 px-[6px] py-[2px] rounded font-bold">{u.key}</code>
                          <button onClick={() => copyKey(u.key)} className="text-[10px] text-gray-400 hover:text-violet-600" title="Nusxalash">
                            {copiedKey === u.key ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-[16px] py-[10px] text-[12px] text-gray-600">
                        {u.name ? (
                          <div>
                            <span>{u.name}</span>
                            {u.phone && <span className="block text-[10px] text-gray-400">{u.phone}</span>}
                          </div>
                        ) : (
                          <span className="text-gray-300 italic">Tayinlanmagan</span>
                        )}
                      </td>
                      <td className="px-[16px] py-[10px] text-[12px] text-gray-500">{courses.find((c) => c.slug === u.course)?.title || u.course || "—"}</td>
                      <td className="px-[16px] py-[10px] text-[12px] text-gray-500">{u.lessonId ? `Dars ${u.lessonId}` : <span className="text-gray-300">Umumiy</span>}</td>
                      <td className="px-[16px] py-[10px] text-[12px] text-gray-500">{u.devices?.length || 0} / {u.maxDevices}</td>
                      <td className="px-[16px] py-[10px]">
                        <span className={`text-[11px] font-medium ${expired ? "text-red-400" : "text-gray-500"}`}>
                          {expired ? <span className="flex items-center gap-[3px]"><Clock size={11} /> Muddati o&apos;tgan</span> : new Date(u.expiresAt).toLocaleDateString("uz")}
                        </span>
                      </td>
                      <td className="px-[16px] py-[10px]">
                        <button onClick={() => toggleActive(u)}
                          className={`text-[10px] font-bold px-[8px] py-[3px] rounded-full cursor-pointer ${u.active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-400"}`}>
                          {u.active ? "Aktiv" : "Bloklangan"}
                        </button>
                      </td>
                      <td className="px-[16px] py-[10px]">
                        <button onClick={() => deleteKey(u.id)}
                          className="px-[8px] py-[4px] bg-red-50 text-red-400 text-[10px] rounded-[6px] hover:bg-red-100" title="O'chirish"><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-[32px] text-[13px] text-gray-300">
                    {search ? "Natija topilmadi" : "Hali kalit yo'q. Kalit yaratish tugmasini bosing."}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
