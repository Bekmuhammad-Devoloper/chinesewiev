"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, X, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
import type { Course } from "@/data/courses";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editCourse) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setEditCourse({ ...editCourse, image: data.url } as Course);
      } else {
        alert(data.error || "Yuklashda xatolik");
      }
    } catch {
      alert("Rasm yuklashda xatolik yuz berdi");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fetchCourses = () => {
    setLoading(true);
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => { setCourses(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSave = async () => {
    if (!editCourse) return;
    setSaving(true);
    try {
      const url = "/api/courses";
      const method = isNew ? "POST" : "PUT";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editCourse),
      });
      setEditCourse(null);
      setIsNew(false);
      fetchCourses();
    } catch (err) {
      alert("Xatolik yuz berdi");
    }
    setSaving(false);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`"${slug}" kursini o'chirmoqchimisiz?`)) return;
    await fetch("/api/courses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    fetchCourses();
  };

  const handleNew = () => {
    setIsNew(true);
    setEditCourse({
      slug: "",
      title: "",
      level: "",
      image: "/assets/course-1.png",
      features: [],
      description: "",
      duration: "",
      lessonsCount: "0 ta dars",
      wordsCount: "0 so'z",
      grammarCount: "0 mavzu",
      price: "0",
      priceNote: "so'm / oyiga",
      published: false,
      lessons: [],
    });
  };

  const updateField = (field: keyof Course, value: string | string[]) => {
    if (!editCourse) return;
    setEditCourse({ ...editCourse, [field]: value } as Course);
  };

  return (
    <div className="p-[24px] sm:p-[32px] md:p-[40px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-[28px]">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#1a1a2e]">Kurslar</h1>
          <p className="text-[14px] text-gray-400 mt-[4px]">Barcha kurslarni boshqarish</p>
        </div>
        <button
          onClick={handleNew}
          className="px-[18px] py-[10px] bg-gradient-to-r from-[#e8632b] to-[#d55a25] text-white text-[13px] font-bold rounded-[10px] hover:from-[#d55a25] hover:to-[#c04f20] active:scale-[0.97] transition-all shadow-[0_4px_16px_rgba(232,99,43,0.3)] flex items-center gap-[8px]"
        >
          <span className="text-[16px]"><Plus size={16} /></span> Yangi kurs
        </button>
      </div>

      {/* Edit Modal */}
      {editCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-[16px]" onClick={() => { setEditCourse(null); setIsNew(false); }}>
          <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-[24px] py-[20px] border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-[16px] z-10">
              <h2 className="text-[18px] font-bold text-[#1a1a2e]">{isNew ? "Yangi kurs qo'shish" : "Kursni tahrirlash"}</h2>
              <button onClick={() => { setEditCourse(null); setIsNew(false); }} className="w-[32px] h-[32px] rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200" title="Yopish"><X size={16} className="text-gray-500" /></button>
            </div>
            <div className="px-[24px] py-[20px] flex flex-col gap-[16px]">
              {/* Slug */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-[0.06em] mb-[6px]">Slug (URL)</label>
                <input
                  value={editCourse.slug}
                  onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="hsk-1"
                  disabled={!isNew}
                  className="w-full px-[14px] py-[10px] rounded-[8px] border border-gray-200 text-[14px] text-gray-800 focus:border-[#e8632b] outline-none disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              {/* Image preview + Upload */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-[0.06em] mb-[6px]">Kurs rasmi</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-[12px]">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-[100px] h-[100px] rounded-[12px] bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex-shrink-0 relative group hover:border-[#e8632b] hover:bg-orange-50/30 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                  >
                    {editCourse.image ? (
                      <Image
                        src={editCourse.image}
                        alt="Kurs rasmi"
                        fill
                        className="object-contain p-[6px]"
                        sizes="100px"
                      />
                    ) : null}
                    {/* Overlay */}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all ${editCourse.image ? "bg-black/0 group-hover:bg-black/40" : "bg-transparent"}`}>
                      {uploading ? (
                        <Loader2 size={22} className="text-[#e8632b] animate-spin" />
                      ) : (
                        <div className={`flex flex-col items-center gap-[4px] transition-opacity ${editCourse.image ? "opacity-0 group-hover:opacity-100" : "opacity-60"}`}>
                          <Upload size={20} className={editCourse.image ? "text-white" : "text-gray-400"} />
                          <span className={`text-[10px] font-semibold ${editCourse.image ? "text-white" : "text-gray-400"}`}>Yuklash</span>
                        </div>
                      )}
                    </div>
                  </button>
                  <div className="flex-1 flex flex-col gap-[6px]">
                    <input
                      value={editCourse.image || ""}
                      onChange={(e) => updateField("image", e.target.value)}
                      placeholder="/assets/course-1.png"
                      className="w-full px-[14px] py-[10px] rounded-[8px] border border-gray-200 text-[14px] text-gray-800 focus:border-[#e8632b] outline-none"
                    />
                    <p className="text-[11px] text-gray-400">Rasmni bosib yuklang yoki URL kiriting</p>
                  </div>
                </div>
              </div>
              {/* Title */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-[0.06em] mb-[6px]">Kurs nomi</label>
                <input value={editCourse.title} onChange={(e) => updateField("title", e.target.value)} placeholder="HSK 1 (3.0)" className="w-full px-[14px] py-[10px] rounded-[8px] border border-gray-200 text-[14px] text-gray-800 focus:border-[#e8632b] outline-none" />
              </div>
              {/* Level */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-[0.06em] mb-[6px]">Daraja</label>
                <input value={editCourse.level} onChange={(e) => updateField("level", e.target.value)} placeholder="Boshlang'ich" className="w-full px-[14px] py-[10px] rounded-[8px] border border-gray-200 text-[14px] text-gray-800 focus:border-[#e8632b] outline-none" />
              </div>
              {/* Description */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-[0.06em] mb-[6px]">Tavsif</label>
                <textarea value={editCourse.description} onChange={(e) => updateField("description", e.target.value)} rows={3} className="w-full px-[14px] py-[10px] rounded-[8px] border border-gray-200 text-[14px] text-gray-800 focus:border-[#e8632b] outline-none resize-none" />
              </div>
              {/* Two cols */}
              <div className="grid grid-cols-2 gap-[12px]">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-[0.06em] mb-[6px]">Davomiyligi</label>
                  <input value={editCourse.duration} onChange={(e) => updateField("duration", e.target.value)} placeholder="3 oy" className="w-full px-[14px] py-[10px] rounded-[8px] border border-gray-200 text-[14px] text-gray-800 focus:border-[#e8632b] outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-[0.06em] mb-[6px]">Narx</label>
                  <input value={editCourse.price} onChange={(e) => updateField("price", e.target.value)} placeholder="500 000" className="w-full px-[14px] py-[10px] rounded-[8px] border border-gray-200 text-[14px] text-gray-800 focus:border-[#e8632b] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-[12px]">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-[0.06em] mb-[6px]">Darslar soni</label>
                  <input value={editCourse.lessonsCount} onChange={(e) => updateField("lessonsCount", e.target.value)} className="w-full px-[14px] py-[10px] rounded-[8px] border border-gray-200 text-[14px] text-gray-800 focus:border-[#e8632b] outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-[0.06em] mb-[6px]">So'zlar soni</label>
                  <input value={editCourse.wordsCount} onChange={(e) => updateField("wordsCount", e.target.value)} className="w-full px-[14px] py-[10px] rounded-[8px] border border-gray-200 text-[14px] text-gray-800 focus:border-[#e8632b] outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-[0.06em] mb-[6px]">Grammatika</label>
                  <input value={editCourse.grammarCount} onChange={(e) => updateField("grammarCount", e.target.value)} className="w-full px-[14px] py-[10px] rounded-[8px] border border-gray-200 text-[14px] text-gray-800 focus:border-[#e8632b] outline-none" />
                </div>
              </div>
              {/* Features */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-[0.06em] mb-[6px]">Xususiyatlar (har qatori alohida)</label>
                <textarea
                  value={(editCourse.features || []).join("\n")}
                  onChange={(e) => updateField("features", e.target.value.split("\n"))}
                  rows={4}
                  className="w-full px-[14px] py-[10px] rounded-[8px] border border-gray-200 text-[14px] text-gray-800 focus:border-[#e8632b] outline-none resize-none"
                  placeholder="Har bir xususiyat yangi qatorda..."
                />
              </div>
              {/* Nashr holati */}
              <div className={`rounded-[12px] border-2 p-[16px] transition-all duration-300 ${
                editCourse.published !== false
                  ? "border-green-200 bg-gradient-to-r from-green-50/80 to-emerald-50/50"
                  : "border-amber-200 bg-gradient-to-r from-amber-50/80 to-orange-50/50"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[12px]">
                    <div className={`w-[40px] h-[40px] rounded-[10px] flex items-center justify-center ${
                      editCourse.published !== false
                        ? "bg-green-100"
                        : "bg-amber-100"
                    }`}>
                      {editCourse.published !== false ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px] text-green-600">
                          <circle cx="12" cy="12" r="10" /><polyline points="9 12 12 12 12 9" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><line x1="2" y1="12" x2="22" y2="12" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px] text-amber-600">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`text-[14px] font-bold ${
                        editCourse.published !== false ? "text-green-700" : "text-amber-700"
                      }`}>
                        {editCourse.published !== false ? "Nashr qilingan" : "Tez kunda"}
                      </p>
                      <p className={`text-[11px] mt-[2px] ${
                        editCourse.published !== false ? "text-green-500" : "text-amber-500"
                      }`}>
                        {editCourse.published !== false
                          ? "Kurs foydalanuvchilarga ko'rinadi"
                          : "Kurs hali foydalanuvchilarga ko'rinmaydi"}
                      </p>
                    </div>
                  </div>
                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setEditCourse({ ...editCourse, published: editCourse.published === false ? true : false } as Course)}
                    className={`relative w-[52px] h-[28px] rounded-full transition-all duration-300 flex-shrink-0 ${
                      editCourse.published !== false
                        ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                        : "bg-gray-300"
                    }`}
                  >
                    <span className={`absolute top-[3px] w-[22px] h-[22px] bg-white rounded-full shadow-md transition-all duration-300 ${
                      editCourse.published !== false ? "left-[27px]" : "left-[3px]"
                    }`} />
                  </button>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="px-[24px] py-[16px] border-t border-gray-100 flex items-center justify-end gap-[10px] sticky bottom-0 bg-white rounded-b-[16px]">
              <button onClick={() => { setEditCourse(null); setIsNew(false); }} className="px-[18px] py-[10px] rounded-[8px] border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50">
                Bekor qilish
              </button>
              <button onClick={handleSave} disabled={saving} className="px-[22px] py-[10px] bg-[#e8632b] text-white text-[13px] font-bold rounded-[8px] hover:bg-[#d55a25] disabled:opacity-50 transition-all">
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-[200px]">
          <div className="w-[32px] h-[32px] border-[3px] border-gray-200 border-t-[#e8632b] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
          {courses.map((c) => (
            <div key={c.slug} className={`group bg-white rounded-[16px] border overflow-hidden transition-all duration-300 hover:-translate-y-[2px] ${
              c.published === false
                ? "border-amber-200 shadow-[0_2px_12px_rgba(245,158,11,0.08)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)]"
                : "border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            }`}>
              {/* Course Image */}
              <div className="relative h-[180px] bg-gradient-to-br from-[#063087]/5 to-[#063087]/10 overflow-hidden">
                {c.published === false && (
                  <div className="absolute inset-0 z-10 bg-black/10" />
                )}
                <Image
                  src={c.image || "/assets/course-1.png"}
                  alt={c.title}
                  fill
                  className={`object-contain p-[16px] group-hover:scale-105 transition-transform duration-500 ${c.published === false ? "opacity-60" : ""}`}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-[10px] left-[10px] flex items-center gap-[6px]">
                  <span className="px-[8px] py-[3px] bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-[#063087] shadow-sm">{c.slug}</span>
                  <span className="px-[8px] py-[3px] bg-[#063087]/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-white shadow-sm">{c.level}</span>
                </div>
                {/* Nashr holat badge — o'ng yuqori burchak */}
                <div className="absolute top-[10px] right-[10px]">
                  {c.published === false ? (
                    <span className="px-[10px] py-[4px] bg-amber-500 backdrop-blur-sm rounded-full text-[10px] font-bold text-white shadow-lg flex items-center gap-[4px]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[12px] h-[12px]"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      Tez kunda
                    </span>
                  ) : (
                    <span className="px-[10px] py-[4px] bg-green-500 backdrop-blur-sm rounded-full text-[10px] font-bold text-white shadow-lg flex items-center gap-[4px]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[12px] h-[12px]"><polyline points="20 6 9 17 4 12" /></svg>
                      Nashr
                    </span>
                  )}
                </div>
              </div>
              {/* Course Info */}
              <div className="px-[18px] py-[16px]">
                <h3 className="text-[17px] font-bold text-[#1a1a2e] mb-[12px]">{c.title}</h3>
                <div className="grid grid-cols-3 gap-[8px] mb-[14px]">
                  <div className="bg-blue-50/60 rounded-[10px] py-[10px] text-center">
                    <p className="text-[18px] font-bold text-blue-600">{c.lessons.length}</p>
                    <p className="text-[10px] text-blue-400 font-medium">Darslar</p>
                  </div>
                  <div className="bg-emerald-50/60 rounded-[10px] py-[10px] text-center">
                    <p className="text-[18px] font-bold text-emerald-600">{c.lessons.filter(l => !l.locked).length}</p>
                    <p className="text-[10px] text-emerald-400 font-medium">Ochiq</p>
                  </div>
                  <div className="bg-orange-50/60 rounded-[10px] py-[10px] text-center">
                    <p className="text-[18px] font-bold text-[#e8632b]">{c.price}</p>
                    <p className="text-[10px] text-orange-400 font-medium">so&apos;m</p>
                  </div>
                </div>
                <div className="flex items-center gap-[8px]">
                  <button
                    onClick={() => { setEditCourse(c); setIsNew(false); }}
                    className="flex-1 py-[9px] bg-[#f1f5f9] text-[#1a1a2e] text-[12px] font-semibold rounded-[10px] hover:bg-[#e2e8f0] transition-colors text-center flex items-center justify-center gap-[5px]"
                  >
                    <Pencil size={13} /> Tahrirlash
                  </button>
                  <button
                    onClick={() => handleDelete(c.slug)}
                    className="py-[9px] px-[14px] bg-red-50 text-red-500 text-[12px] font-semibold rounded-[10px] hover:bg-red-100 transition-colors flex items-center justify-center"
                    title="O'chirish"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
