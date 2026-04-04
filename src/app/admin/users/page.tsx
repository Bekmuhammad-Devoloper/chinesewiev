"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, UserX, Plus, X, Pencil, Trash2, KeyRound, Copy, Check, Search, Save, Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import type { UserRecord } from "@/app/api/users/route";
import type { Course } from "@/data/courses";

/* ── Shared input — OUTSIDE component to avoid focus loss ── */
const Input = ({ value, onChange, placeholder, className = "", type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string; type?: string;
}) => (
  <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} title={placeholder}
    className={`px-[12px] py-[10px] rounded-[8px] border border-gray-200 text-[13px] text-gray-800 focus:border-[#063087] focus:ring-2 focus:ring-[#063087]/10 outline-none transition-all bg-[#f9fafb] focus:bg-white ${className}`}
  />
);

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

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

  const refetch = () => fetch("/api/users").then((r) => r.json()).then((d) => setUsers(Array.isArray(d) ? d : []));

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const method = isNew ? "POST" : "PUT";
      const url = isNew ? "/api/users" : `/api/users?id=${editUser.id}`;
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editUser) });
      setEditUser(null);
      setIsNew(false);
      refetch();
    } catch { alert("Xatolik!"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu foydalanuvchini o'chirmoqchimisiz?")) return;
    await fetch(`/api/users?id=${id}`, { method: "DELETE" });
    refetch();
  };

  const handleNew = () => {
    setIsNew(true);
    setEditUser({
      id: "", name: "", phone: "", telegram: "", course: courses[0]?.slug || "",
      key: "", devices: [], maxDevices: 2, active: true,
      createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
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

  const filtered = users.filter((u) =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search) || u.key.toLowerCase().includes(search.toLowerCase()) ||
    u.telegram.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = users.filter((u) => u.active).length;
  const blockedCount = users.filter((u) => !u.active).length;

  return (
    <div className="p-[20px] sm:p-[28px] md:p-[36px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-[24px] flex-wrap gap-[12px]">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-bold text-[#1a1a2e] tracking-[-0.02em]">Foydalanuvchilar</h1>
          <p className="text-[13px] text-gray-400 mt-[2px]">Foydalanuvchilar va ularning kalitlarini boshqarish</p>
        </div>
        <button onClick={handleNew}
          className="px-[18px] py-[10px] bg-gradient-to-r from-[#063087] to-[#041e56] text-[#edcc8a] text-[13px] font-bold rounded-[10px] hover:opacity-90 active:scale-[0.97] transition-all shadow-[0_4px_16px_rgba(6,48,135,0.25)] flex items-center gap-[6px]">
          <span className="text-[16px]"><Plus size={16} /></span> Yangi foydalanuvchi
        </button>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-[10px] mb-[20px]">
        <div className="bg-white rounded-[12px] border border-gray-100 p-[14px] flex items-center gap-[10px]">
          <div className="w-[34px] h-[34px] bg-blue-50 rounded-[8px] flex items-center justify-center"><Users size={16} className="text-blue-500" /></div>
          <div><p className="text-[18px] font-bold text-[#1a1a2e]">{users.length}</p><p className="text-[10px] text-gray-400">Jami</p></div>
        </div>
        <div className="bg-white rounded-[12px] border border-gray-100 p-[14px] flex items-center gap-[10px]">
          <div className="w-[34px] h-[34px] bg-emerald-50 rounded-[8px] flex items-center justify-center"><UserCheck size={16} className="text-emerald-500" /></div>
          <div><p className="text-[18px] font-bold text-emerald-600">{activeCount}</p><p className="text-[10px] text-gray-400">Aktiv</p></div>
        </div>
        <div className="bg-white rounded-[12px] border border-gray-100 p-[14px] flex items-center gap-[10px]">
          <div className="w-[34px] h-[34px] bg-red-50 rounded-[8px] flex items-center justify-center"><UserX size={16} className="text-red-400" /></div>
          <div><p className="text-[18px] font-bold text-red-500">{blockedCount}</p><p className="text-[10px] text-gray-400">Bloklangan</p></div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-[16px] relative inline-block">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ism, telefon, kalit bo'yicha qidirish..."
          title="Qidirish"
          className="w-full max-w-[400px] px-[14px] py-[10px] pl-[36px] rounded-[10px] border border-gray-200 text-[13px] bg-white text-gray-700 focus:border-[#063087] outline-none transition-all"
        />
        <Search size={15} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* ── EDITOR MODAL ── */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-[12px]" onClick={() => { setEditUser(null); setIsNew(false); }}>
          <div className="bg-white rounded-[18px] shadow-2xl w-full max-w-[520px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-[24px] py-[16px] border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-[#1a1a2e]">{isNew ? "Yangi foydalanuvchi" : "Tahrirlash"}</h2>
              <button onClick={() => { setEditUser(null); setIsNew(false); }} className="w-[30px] h-[30px] rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200" title="Yopish"><X size={14} className="text-gray-500" /></button>
            </div>
            <div className="px-[24px] py-[20px] flex flex-col gap-[12px]">
              <div className="grid grid-cols-2 gap-[10px]">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-[0.06em] mb-[4px]">Ism</label>
                  <Input value={editUser.name} onChange={(v) => setEditUser({ ...editUser, name: v })} placeholder="Ism familiya" className="w-full" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-[0.06em] mb-[4px]">Telefon</label>
                  <Input value={editUser.phone} onChange={(v) => setEditUser({ ...editUser, phone: v })} placeholder="+998 90 123 45 67" className="w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-[10px]">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-[0.06em] mb-[4px]">Telegram</label>
                  <Input value={editUser.telegram} onChange={(v) => setEditUser({ ...editUser, telegram: v })} placeholder="@username" className="w-full" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-[0.06em] mb-[4px]">Kurs</label>
                  <select value={editUser.course} onChange={(e) => setEditUser({ ...editUser, course: e.target.value })} title="Kurs"
                    className="w-full px-[12px] py-[10px] rounded-[8px] border border-gray-200 text-[13px] bg-[#f9fafb] text-gray-800 outline-none">
                    <option value="">Tanlanmagan</option>
                    {courses.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-[10px]">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-[0.06em] mb-[4px]">Max qurilmalar</label>
                  <Input value={String(editUser.maxDevices)} onChange={(v) => setEditUser({ ...editUser, maxDevices: Number(v) || 2 })} placeholder="2" className="w-full" type="number" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-[0.06em] mb-[4px]">Muddati</label>
                  <Input value={editUser.expiresAt.slice(0, 10)} onChange={(v) => setEditUser({ ...editUser, expiresAt: new Date(v).toISOString() })} placeholder="2027-01-01" className="w-full" type="date" />
                </div>
              </div>
              <div className="flex items-center gap-[12px]">
                <label className="flex items-center gap-[8px] cursor-pointer">
                  <input type="checkbox" checked={editUser.active} onChange={(e) => setEditUser({ ...editUser, active: e.target.checked })}
                    className="w-[18px] h-[18px] accent-emerald-500" />
                  <span className="text-[13px] font-medium text-gray-700">Aktiv</span>
                </label>
              </div>
              {!isNew && editUser.key && (
                <div className="bg-[#f0f4ff] rounded-[10px] p-[12px] flex items-center gap-[8px]">
                  <KeyRound size={15} className="text-[#063087]" />
                  <code className="text-[13px] font-mono text-[#063087] font-bold flex-1">{editUser.key}</code>
                  <button onClick={() => copyKey(editUser.key)} className="text-[11px] text-[#063087] font-semibold hover:underline flex items-center gap-[3px]">
                    {copiedKey === editUser.key ? <><Check size={12} /> Nusxalandi</> : <><Copy size={12} /> Nusxa</>}
                  </button>
                </div>
              )}
            </div>
            <div className="px-[24px] py-[14px] border-t border-gray-100 flex justify-end gap-[8px]">
              <button onClick={() => { setEditUser(null); setIsNew(false); }} className="px-[16px] py-[9px] rounded-[8px] border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50">Bekor</button>
              <button onClick={handleSave} disabled={saving}
                className="px-[20px] py-[9px] bg-[#063087] text-[#edcc8a] text-[13px] font-bold rounded-[8px] hover:bg-[#041e56] disabled:opacity-50 transition-all flex items-center gap-[5px]">
                {saving ? <><Loader2 size={13} className="animate-spin" /> Saqlanmoqda...</> : <><Save size={13} /> Saqlash</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── USERS TABLE ── */}
      {loading ? (
        <div className="flex items-center justify-center h-[200px]">
          <div className="w-[32px] h-[32px] border-[3px] border-gray-200 border-t-[#063087] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-[14px] border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f9fafb] text-[10px] uppercase tracking-[0.08em] text-gray-400 font-bold">
                  <th className="px-[16px] py-[10px]">Foydalanuvchi</th>
                  <th className="px-[16px] py-[10px]">Kurs</th>
                  <th className="px-[16px] py-[10px]">Kalit</th>
                  <th className="px-[16px] py-[10px]">Qurilmalar</th>
                  <th className="px-[16px] py-[10px]">Holat</th>
                  <th className="px-[16px] py-[10px]">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t border-gray-50 hover:bg-[#fafbfc] transition-colors">
                    <td className="px-[16px] py-[12px]">
                      <div className="flex items-center gap-[10px]">
                        <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-[#063087] to-[#041e56] flex items-center justify-center text-[11px] text-[#edcc8a] font-bold flex-shrink-0">
                          {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[#1a1a2e]">{u.name || "Nomsiz"}</p>
                          <p className="text-[11px] text-gray-400">{u.phone || u.telegram || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-[16px] py-[12px] text-[12px] text-gray-600">{courses.find((c) => c.slug === u.course)?.title || u.course || "—"}</td>
                    <td className="px-[16px] py-[12px]">
                      <div className="flex items-center gap-[6px]">
                        <code className="text-[11px] font-mono text-[#063087] bg-[#f0f4ff] px-[6px] py-[2px] rounded">{u.key}</code>
                        <button onClick={() => copyKey(u.key)} className="text-[10px] text-gray-400 hover:text-[#063087]" title="Nusxalash">
                          {copiedKey === u.key ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-[16px] py-[12px] text-[12px] text-gray-500">{u.devices?.length || 0} / {u.maxDevices}</td>
                    <td className="px-[16px] py-[12px]">
                      <button onClick={() => toggleActive(u)}
                        className={`text-[11px] font-bold px-[8px] py-[3px] rounded-full cursor-pointer transition-colors flex items-center gap-[4px] ${u.active ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-red-50 text-red-400 hover:bg-red-100"}`}>
                        {u.active ? <><ShieldCheck size={12} /> Aktiv</> : <><ShieldOff size={12} /> Bloklangan</>}
                      </button>
                    </td>
                    <td className="px-[16px] py-[12px]">
                      <div className="flex gap-[4px]">
                        <button onClick={() => { setEditUser(u); setIsNew(false); }}
                          className="px-[10px] py-[5px] bg-[#f1f5f9] text-[11px] font-semibold text-[#1a1a2e] rounded-[6px] hover:bg-[#e2e8f0]" title="Tahrirlash"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(u.id)}
                          className="px-[8px] py-[5px] bg-red-50 text-red-400 text-[11px] rounded-[6px] hover:bg-red-100" title="O'chirish"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-[32px] text-[13px] text-gray-300">
                    {search ? "Natija topilmadi" : "Hali foydalanuvchi yo'q"}
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
