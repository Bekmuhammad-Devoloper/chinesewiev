"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Plus, X, Pencil, Trash2, Lock, Unlock, Loader2,
  BookOpen, MessageSquare, Languages,
  ClipboardCheck, Settings, Play, Music, FileAudio, ImagePlus,
} from "lucide-react";
import type { Course, Lesson, Word, DialogueLine, GrammarRule, GrammarExample, Task } from "@/data/courses";

export default function AdminLessonsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "words" | "dialogues" | "grammar" | "tasks">("general");
  const [uploadingWord, setUploadingWord] = useState<{ idx: number; type: "audio" | "image" | "writingSheet" } | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const writingSheetInputRef = useRef<HTMLInputElement>(null);
  const dialogueAudioInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadIdx, setActiveUploadIdx] = useState(-1);
  const [uploadingDialogueAudio, setUploadingDialogueAudio] = useState<{ dIdx: number; lIdx: number } | null>(null);
  const [activeDialogueUpload, setActiveDialogueUpload] = useState<{ dIdx: number; lIdx: number } | null>(null);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setCourses(arr);
        if (arr.length > 0) setSelectedSlug(arr[0].slug);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSlug) return;
    fetch(`/api/lessons?slug=${selectedSlug}`)
      .then((r) => r.json())
      .then((data) => setLessons(Array.isArray(data) ? data : []))
      .catch(() => setLessons([]));
  }, [selectedSlug]);

  const refetchLessons = () => {
    if (!selectedSlug) return;
    fetch(`/api/lessons?slug=${selectedSlug}`)
      .then((r) => r.json())
      .then((data) => setLessons(Array.isArray(data) ? data : []));
  };

  const handleSave = async () => {
    if (!editLesson) return;
    setSaving(true);
    try {
      const method = isNew ? "POST" : "PUT";
      const url = isNew
        ? `/api/lessons?slug=${selectedSlug}`
        : `/api/lessons?slug=${selectedSlug}&id=${editLesson.id}`;
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editLesson),
      });
      setEditLesson(null);
      setIsNew(false);
      refetchLessons();
    } catch {
      alert("Xatolik yuz berdi");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Darslik #${id} ni o'chirmoqchimisiz?`)) return;
    await fetch(`/api/lessons?slug=${selectedSlug}&id=${id}`, { method: "DELETE" });
    refetchLessons();
  };

  const handleNew = () => {
    setIsNew(true);
    setActiveTab("general");
    setEditLesson({
      id: 0, title: "", name: "", description: "", image: "", locked: true,
      words: [],
      sections: [
        { id: "new-words", title: "Yangi so'zlar", type: "words" },
        { id: "writing", title: "So'z yozilishi", type: "writing" },
        { id: "dialogues", title: "Dialoglar", type: "dialogue", children: [] },
        { id: "grammar", title: "Grammatika", type: "grammar", children: [] },
        { id: "tasks", title: "Vazifalar", type: "tasks" },
      ],
      tasks: [],
    });
  };

  const updateLesson = (updates: Partial<Lesson>) => {
    if (!editLesson) return;
    setEditLesson({ ...editLesson, ...updates });
  };

  /* ── Upload handler ── */
  const handleFileUpload = async (file: File, wordIdx: number, type: "audio" | "image" | "writingSheet") => {
    setUploadingWord({ idx: wordIdx, type });
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        const words = [...(editLesson?.words || [])];
        words[wordIdx] = { ...words[wordIdx], [type]: data.url };
        updateLesson({ words });
      } else {
        alert(data.error || "Yuklashda xatolik");
      }
    } catch {
      alert("Fayl yuklashda xatolik yuz berdi");
    }
    setUploadingWord(null);
  };

  const triggerAudioUpload = (idx: number) => {
    setActiveUploadIdx(idx);
    setTimeout(() => audioInputRef.current?.click(), 50);
  };
  const triggerImageUpload = (idx: number) => {
    setActiveUploadIdx(idx);
    setTimeout(() => imageInputRef.current?.click(), 50);
  };
  const onAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadIdx >= 0) handleFileUpload(file, activeUploadIdx, "audio");
    if (audioInputRef.current) audioInputRef.current.value = "";
  };
  const onImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadIdx >= 0) handleFileUpload(file, activeUploadIdx, "image");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };
  const triggerWritingSheetUpload = (idx: number) => {
    setActiveUploadIdx(idx);
    setTimeout(() => writingSheetInputRef.current?.click(), 50);
  };
  const onWritingSheetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadIdx >= 0) handleFileUpload(file, activeUploadIdx, "writingSheet");
    if (writingSheetInputRef.current) writingSheetInputRef.current.value = "";
  };

  /* ── Dialogue audio upload handler ── */
  const handleDialogueAudioUpload = async (file: File, dIdx: number, lIdx: number) => {
    setUploadingDialogueAudio({ dIdx, lIdx });
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        const children = [...(getDialogueSection()?.children || [])];
        const lines = [...(children[dIdx].dialogueLines || [])];
        lines[lIdx] = { ...lines[lIdx], audio: data.url };
        children[dIdx] = { ...children[dIdx], dialogueLines: lines };
        updateDialogueChildren(children);
      } else {
        alert(data.error || "Yuklashda xatolik");
      }
    } catch {
      alert("Fayl yuklashda xatolik yuz berdi");
    }
    setUploadingDialogueAudio(null);
  };
  const triggerDialogueAudioUpload = (dIdx: number, lIdx: number) => {
    setActiveDialogueUpload({ dIdx, lIdx });
    setTimeout(() => dialogueAudioInputRef.current?.click(), 50);
  };
  const onDialogueAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeDialogueUpload) handleDialogueAudioUpload(file, activeDialogueUpload.dIdx, activeDialogueUpload.lIdx);
    if (dialogueAudioInputRef.current) dialogueAudioInputRef.current.value = "";
  };

  /* ── Word helpers ── */
  const addWord = () => {
    const words = [...(editLesson?.words || []), { hanzi: "", pinyin: "", translation: "", audio: "", image: "", writingSheet: "" }];
    updateLesson({ words });
  };
  const updateWord = (idx: number, field: keyof Word, value: string) => {
    const words = [...(editLesson?.words || [])];
    words[idx] = { ...words[idx], [field]: value };
    updateLesson({ words });
  };
  const removeWord = (idx: number) => {
    const words = (editLesson?.words || []).filter((_, i) => i !== idx);
    updateLesson({ words });
  };

  /* ── Dialogue helpers ── */
  const getDialogueSection = () => editLesson?.sections?.find((s) => s.id === "dialogues");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateDialogueChildren = (children: any) => {
    const sections = (editLesson?.sections || []).map((s) =>
      s.id === "dialogues" ? { ...s, children } : s
    );
    updateLesson({ sections });
  };
  const addDialogue = () => {
    const ds = getDialogueSection();
    const children = [...(ds?.children || []), { id: `dialogue-${Date.now()}`, title: "Yangi dialog", dialogueLines: [] }];
    updateDialogueChildren(children);
  };
  const updateDialogueTitle = (idx: number, title: string) => {
    const children = [...(getDialogueSection()?.children || [])];
    children[idx] = { ...children[idx], title };
    updateDialogueChildren(children);
  };
  const removeDialogue = (idx: number) => {
    const children = (getDialogueSection()?.children || []).filter((_, i) => i !== idx);
    updateDialogueChildren(children);
  };
  const addDialogueLine = (dIdx: number) => {
    const children = [...(getDialogueSection()?.children || [])];
    const lines = [...(children[dIdx].dialogueLines || []), { speaker: "", text: "", pinyin: "", translation: "" }];
    children[dIdx] = { ...children[dIdx], dialogueLines: lines };
    updateDialogueChildren(children);
  };
  const updateDialogueLine = (dIdx: number, lIdx: number, field: keyof DialogueLine, value: string) => {
    const children = [...(getDialogueSection()?.children || [])];
    const lines = [...(children[dIdx].dialogueLines || [])];
    lines[lIdx] = { ...lines[lIdx], [field]: value };
    children[dIdx] = { ...children[dIdx], dialogueLines: lines };
    updateDialogueChildren(children);
  };
  const removeDialogueLine = (dIdx: number, lIdx: number) => {
    const children = [...(getDialogueSection()?.children || [])];
    const lines = (children[dIdx].dialogueLines || []).filter((_, i) => i !== lIdx);
    children[dIdx] = { ...children[dIdx], dialogueLines: lines };
    updateDialogueChildren(children);
  };

  /* ── Grammar helpers ── */
  const getGrammarSection = () => editLesson?.sections?.find((s) => s.id === "grammar");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateGrammarChildren = (children: any) => {
    const sections = (editLesson?.sections || []).map((s) =>
      s.id === "grammar" ? { ...s, children } : s
    );
    updateLesson({ sections });
  };
  const addGrammarTopic = () => {
    const gs = getGrammarSection();
    const children = [...(gs?.children || []), { id: `grammar-${Date.now()}`, title: "Yangi mavzu", grammarRules: [] }];
    updateGrammarChildren(children);
  };
  const updateGrammarTopicTitle = (idx: number, title: string) => {
    const children = [...(getGrammarSection()?.children || [])];
    children[idx] = { ...children[idx], title };
    updateGrammarChildren(children);
  };
  const removeGrammarTopic = (idx: number) => {
    const children = (getGrammarSection()?.children || []).filter((_, i) => i !== idx);
    updateGrammarChildren(children);
  };
  const addGrammarRule = (tIdx: number) => {
    const children = [...(getGrammarSection()?.children || [])];
    const rules: GrammarRule[] = [...(children[tIdx].grammarRules || []), { id: `gr-${Date.now()}`, title: "", explanation: "", structure: "", examples: [], tip: "" }];
    children[tIdx] = { ...children[tIdx], grammarRules: rules };
    updateGrammarChildren(children);
  };
  const updateGrammarRule = (tIdx: number, rIdx: number, updates: Partial<GrammarRule>) => {
    const children = [...(getGrammarSection()?.children || [])];
    const rules = [...(children[tIdx].grammarRules || [])];
    rules[rIdx] = { ...rules[rIdx], ...updates };
    children[tIdx] = { ...children[tIdx], grammarRules: rules };
    updateGrammarChildren(children);
  };
  const removeGrammarRule = (tIdx: number, rIdx: number) => {
    const children = [...(getGrammarSection()?.children || [])];
    const rules = (children[tIdx].grammarRules || []).filter((_, i) => i !== rIdx);
    children[tIdx] = { ...children[tIdx], grammarRules: rules };
    updateGrammarChildren(children);
  };
  const addGrammarExample = (tIdx: number, rIdx: number) => {
    const children = [...(getGrammarSection()?.children || [])];
    const rules = [...(children[tIdx].grammarRules || [])];
    const examples: GrammarExample[] = [...rules[rIdx].examples, { chinese: "", pinyin: "", translation: "" }];
    rules[rIdx] = { ...rules[rIdx], examples };
    children[tIdx] = { ...children[tIdx], grammarRules: rules };
    updateGrammarChildren(children);
  };
  const updateGrammarExample = (tIdx: number, rIdx: number, eIdx: number, field: keyof GrammarExample, value: string) => {
    const children = [...(getGrammarSection()?.children || [])];
    const rules = [...(children[tIdx].grammarRules || [])];
    const examples = [...rules[rIdx].examples];
    examples[eIdx] = { ...examples[eIdx], [field]: value };
    rules[rIdx] = { ...rules[rIdx], examples };
    children[tIdx] = { ...children[tIdx], grammarRules: rules };
    updateGrammarChildren(children);
  };
  const removeGrammarExample = (tIdx: number, rIdx: number, eIdx: number) => {
    const children = [...(getGrammarSection()?.children || [])];
    const rules = [...(children[tIdx].grammarRules || [])];
    const examples = rules[rIdx].examples.filter((_, i) => i !== eIdx);
    rules[rIdx] = { ...rules[rIdx], examples };
    children[tIdx] = { ...children[tIdx], grammarRules: rules };
    updateGrammarChildren(children);
  };

  /* ── Task helpers ── */
  const addTask = () => {
    const tasks: Task[] = [
      ...(editLesson?.tasks || []),
      { id: `task-${Date.now()}`, type: "multiple-choice", question: "", options: [
        { id: "a", text: "" }, { id: "b", text: "" }, { id: "c", text: "" }, { id: "d", text: "" },
      ], correctAnswer: "" },
    ];
    updateLesson({ tasks });
  };
  const updateTask = (idx: number, updates: Partial<Task>) => {
    const tasks = [...(editLesson?.tasks || [])];
    tasks[idx] = { ...tasks[idx], ...updates };
    updateLesson({ tasks });
  };
  const removeTask = (idx: number) => {
    const tasks = (editLesson?.tasks || []).filter((_, i) => i !== idx);
    updateLesson({ tasks });
  };
  const updateTaskOption = (tIdx: number, oIdx: number, text: string) => {
    const tasks = [...(editLesson?.tasks || [])];
    const options = [...(tasks[tIdx].options || [])];
    options[oIdx] = { ...options[oIdx], text };
    tasks[tIdx] = { ...tasks[tIdx], options };
    updateLesson({ tasks });
  };

  /* ── Shared input ── */
  const Input = ({ value, onChange, placeholder, className = "" }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) => (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} title={placeholder}
      className={`px-[12px] py-[8px] rounded-[6px] border border-gray-200 text-[13px] text-gray-800 focus:border-[#e8632b] outline-none ${className}`} />
  );

  const tabs = [
    { key: "general" as const, label: "Umumiy", Icon: Settings },
    { key: "words" as const, label: "So'zlar", Icon: BookOpen },
    { key: "dialogues" as const, label: "Dialoglar", Icon: MessageSquare },
    { key: "grammar" as const, label: "Grammatika", Icon: Languages },
    { key: "tasks" as const, label: "Vazifalar", Icon: ClipboardCheck },
  ];

  const playAudioPreview = (url: string) => { const a = new Audio(url); a.play().catch(() => {}); };

  return (
    <div className="p-[24px] sm:p-[32px] md:p-[40px]">
      <input type="file" ref={audioInputRef} accept="audio/*" className="hidden" onChange={onAudioFileChange} title="Audio fayl tanlash" />
      <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={onImageFileChange} title="Rasm fayl tanlash" />
      <input type="file" ref={writingSheetInputRef} accept="image/*,.pdf" className="hidden" onChange={onWritingSheetFileChange} title="Husnihat varaqasi tanlash" />
      <input type="file" ref={dialogueAudioInputRef} accept="audio/*" className="hidden" onChange={onDialogueAudioFileChange} title="Dialog audio fayl tanlash" />

      {/* Header */}
      <div className="flex items-center justify-between mb-[28px] flex-wrap gap-[12px]">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#1a1a2e]">Darsliklar</h1>
          <p className="text-[14px] text-gray-400 mt-[4px]">Darsliklarni boshqarish va tahrirlash</p>
        </div>
        <div className="flex items-center gap-[10px]">
          <div className="flex items-center gap-[8px] bg-white border border-gray-200 rounded-[10px] px-[6px] py-[5px]">
            {(() => {
              const sc = courses.find(c => c.slug === selectedSlug);
              return sc ? (
                <div className="w-[32px] h-[32px] rounded-[7px] bg-gray-50 overflow-hidden relative flex-shrink-0">
                  <Image src={sc.image || "/assets/course-1.png"} alt={sc.title} fill className="object-contain p-[2px]" sizes="32px" />
                </div>
              ) : null;
            })()}
            <select value={selectedSlug} onChange={(e) => setSelectedSlug(e.target.value)} title="Kursni tanlang"
              className="px-[8px] py-[5px] rounded-[6px] text-[13px] text-gray-700 font-medium bg-transparent focus:outline-none cursor-pointer">
              {courses.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
            </select>
          </div>
          <button onClick={handleNew}
            className="px-[18px] py-[10px] bg-gradient-to-r from-[#e8632b] to-[#d55a25] text-white text-[13px] font-bold rounded-[10px] hover:from-[#d55a25] hover:to-[#c04f20] active:scale-[0.97] transition-all shadow-[0_4px_16px_rgba(232,99,43,0.3)] flex items-center gap-[6px]">
            <Plus size={16} /> Yangi dars
          </button>
        </div>
      </div>

      {/* ── EDITOR MODAL ── */}
      {editLesson && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-[8px] sm:p-[16px]" onClick={() => { setEditLesson(null); setIsNew(false); }}>
          <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-[960px] h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-[24px] py-[16px] border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h2 className="text-[18px] font-bold text-[#1a1a2e]">{isNew ? "Yangi darslik" : `Tahrirlash: ${editLesson.title}`}</h2>
              <button onClick={() => { setEditLesson(null); setIsNew(false); }} className="w-[32px] h-[32px] rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200" title="Yopish"><X size={16} className="text-gray-500" /></button>
            </div>

            {/* Tabs */}
            <div className="px-[24px] pt-[12px] border-b border-gray-100 flex gap-[4px] flex-shrink-0 overflow-x-auto">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`px-[14px] py-[10px] rounded-t-[8px] text-[12px] sm:text-[13px] font-semibold transition-all whitespace-nowrap flex items-center gap-[6px] ${
                    activeTab === t.key ? "bg-[#e8632b] text-white" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                  }`}>
                  <t.Icon size={14} /> {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-[24px] py-[20px]">

              {/* ── GENERAL TAB ── */}
              {activeTab === "general" && (
                <div className="flex flex-col gap-[14px] max-w-[600px]">
                  <div className="grid grid-cols-2 gap-[12px]">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-[0.06em] mb-[4px]">Sarlavha</label>
                      <Input value={editLesson.title} onChange={(v) => updateLesson({ title: v })} placeholder="Darslik 1" className="w-full" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-[0.06em] mb-[4px]">Nomi</label>
                      <Input value={editLesson.name} onChange={(v) => updateLesson({ name: v })} placeholder="Salomlashuv" className="w-full" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-[0.06em] mb-[4px]">Tavsif</label>
                    <Input value={editLesson.description} onChange={(v) => updateLesson({ description: v })} placeholder="Greetings / Salomlashlar" className="w-full" />
                  </div>
                  <label className="flex items-center gap-[8px] cursor-pointer">
                    <input type="checkbox" checked={!editLesson.locked} onChange={(e) => updateLesson({ locked: !e.target.checked })} className="w-[18px] h-[18px] accent-[#e8632b]" />
                    <span className="text-[13px] font-medium text-gray-700">Ochiq (qulflanmagan)</span>
                  </label>
                </div>
              )}

              {/* ── WORDS TAB ── */}
              {activeTab === "words" && (
                <div>
                  <div className="flex items-center justify-between mb-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <BookOpen size={18} className="text-[#e8632b]" />
                      <p className="text-[15px] font-bold text-gray-700">{(editLesson.words || []).length} ta so&apos;z</p>
                    </div>
                    <button onClick={addWord} className="px-[14px] py-[8px] bg-[#e8632b] text-white text-[12px] font-bold rounded-[8px] hover:bg-[#d55a25] flex items-center gap-[5px] transition-all active:scale-[0.97]">
                      <Plus size={14} /> So&apos;z qo&apos;shish
                    </button>
                  </div>

                  {(editLesson.words || []).length === 0 && (
                    <div className="text-center py-[40px] bg-gray-50/50 rounded-[12px] border-2 border-dashed border-gray-200">
                      <BookOpen size={32} className="text-gray-300 mx-auto mb-[8px]" />
                      <p className="text-[14px] text-gray-400">Hali so&apos;z qo&apos;shilmagan</p>
                      <p className="text-[12px] text-gray-300 mt-[2px]">&quot;So&apos;z qo&apos;shish&quot; tugmasini bosing</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-[10px]">
                    {(editLesson.words || []).map((w, i) => {
                      const isUA = uploadingWord?.idx === i && uploadingWord?.type === "audio";
                      const isUI = uploadingWord?.idx === i && uploadingWord?.type === "image";
                      const isUW = uploadingWord?.idx === i && uploadingWord?.type === "writingSheet";
                      return (
                        <div key={i} className="bg-white border border-gray-100 rounded-[12px] shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all">
                          {/* Text fields */}
                          <div className="flex items-center gap-[6px] px-[14px] pt-[12px] pb-[8px]">
                            <span className="text-[11px] font-bold text-gray-300 bg-gray-50 rounded-full w-[24px] h-[24px] flex items-center justify-center flex-shrink-0">{i + 1}</span>
                            <div className="flex-1 grid grid-cols-3 gap-[6px]">
                              <Input value={w.hanzi} onChange={(v) => updateWord(i, "hanzi", v)} placeholder="汉字" className="w-full text-[15px] font-medium" />
                              <Input value={w.pinyin} onChange={(v) => updateWord(i, "pinyin", v)} placeholder="pīnyīn" className="w-full italic" />
                              <Input value={w.translation} onChange={(v) => updateWord(i, "translation", v)} placeholder="Tarjima" className="w-full" />
                            </div>
                            <button onClick={() => removeWord(i)} className="w-[30px] h-[30px] bg-red-50 text-red-400 rounded-[8px] hover:bg-red-100 flex items-center justify-center flex-shrink-0" title="O'chirish"><Trash2 size={14} /></button>
                          </div>
                          {/* Media row */}
                          <div className="flex items-center gap-[8px] px-[14px] pb-[12px] pt-[4px]">
                            {/* Audio */}
                            <div className="flex items-center gap-[6px] flex-1 min-w-0">
                              {w.audio ? (
                                <div className="flex items-center gap-[6px] bg-emerald-50 rounded-[8px] px-[10px] py-[6px] flex-1 min-w-0">
                                  <button onClick={() => playAudioPreview(w.audio!)} className="w-[28px] h-[28px] bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-emerald-600 transition-colors" title="Tinglash">
                                    <Play size={12} className="text-white ml-[1px]" />
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-emerald-700 truncate flex items-center gap-[3px]"><Music size={10} /> Audio yuklangan</p>
                                    <p className="text-[10px] text-emerald-500 truncate">{w.audio.split("/").pop()}</p>
                                  </div>
                                  <button onClick={() => updateWord(i, "audio", "")} className="w-[22px] h-[22px] bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-200 flex-shrink-0" title="Audioni o'chirish"><X size={11} /></button>
                                </div>
                              ) : (
                                <button onClick={() => triggerAudioUpload(i)} disabled={isUA}
                                  className="flex items-center gap-[6px] bg-blue-50 hover:bg-blue-100 text-blue-600 px-[12px] py-[7px] rounded-[8px] text-[11px] font-semibold transition-all disabled:opacity-50 flex-shrink-0">
                                  {isUA ? <Loader2 size={13} className="animate-spin" /> : <FileAudio size={13} />} Audio yuklash
                                </button>
                              )}
                            </div>
                            {/* Image */}
                            <div className="flex items-center gap-[6px]">
                              {w.image ? (
                                <div className="flex items-center gap-[6px] bg-purple-50 rounded-[8px] px-[8px] py-[4px]">
                                  <div className="w-[36px] h-[36px] rounded-[6px] overflow-hidden relative bg-white border border-purple-100 flex-shrink-0">
                                    <Image src={w.image} alt={w.hanzi} fill className="object-contain p-[2px]" sizes="36px" />
                                  </div>
                                  <button onClick={() => triggerImageUpload(i)} className="text-[10px] text-purple-600 font-semibold hover:underline flex items-center gap-[2px]" title="Rasmni almashtirish"><Pencil size={10} /></button>
                                  <button onClick={() => updateWord(i, "image", "")} className="w-[22px] h-[22px] bg-purple-100 text-purple-600 rounded-full flex items-center justify-center hover:bg-purple-200 flex-shrink-0" title="Rasmni o'chirish"><X size={11} /></button>
                                </div>
                              ) : (
                                <button onClick={() => triggerImageUpload(i)} disabled={isUI}
                                  className="flex items-center gap-[5px] bg-purple-50 hover:bg-purple-100 text-purple-600 px-[12px] py-[7px] rounded-[8px] text-[11px] font-semibold transition-all disabled:opacity-50 flex-shrink-0">
                                  {isUI ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />} Rasm
                                </button>
                              )}
                            </div>
                            {/* Writing Sheet */}
                            <div className="flex items-center gap-[6px]">
                              {w.writingSheet ? (
                                <div className="flex items-center gap-[6px] bg-amber-50 rounded-[8px] px-[8px] py-[4px]">
                                  <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-[3px]"><Pencil size={10} /> Husnihat ✓</span>
                                  <button onClick={() => triggerWritingSheetUpload(i)} className="text-[10px] text-amber-600 font-semibold hover:underline flex items-center gap-[2px]" title="Almashtirish"><Pencil size={10} /></button>
                                  <button onClick={() => updateWord(i, "writingSheet", "")} className="w-[22px] h-[22px] bg-amber-100 text-amber-600 rounded-full flex items-center justify-center hover:bg-amber-200 flex-shrink-0" title="O'chirish"><X size={11} /></button>
                                </div>
                              ) : (
                                <button onClick={() => triggerWritingSheetUpload(i)} disabled={isUW}
                                  className="flex items-center gap-[5px] bg-amber-50 hover:bg-amber-100 text-amber-600 px-[12px] py-[7px] rounded-[8px] text-[11px] font-semibold transition-all disabled:opacity-50 flex-shrink-0">
                                  {isUW ? <Loader2 size={13} className="animate-spin" /> : <Pencil size={13} />} Husnihat
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── DIALOGUES TAB ── */}
              {activeTab === "dialogues" && (
                <div>
                  <div className="flex items-center justify-between mb-[14px]">
                    <div className="flex items-center gap-[8px]"><MessageSquare size={18} className="text-[#e8632b]" /><p className="text-[15px] font-bold text-gray-700">{(getDialogueSection()?.children || []).length} ta dialog</p></div>
                    <button onClick={addDialogue} className="px-[14px] py-[8px] bg-[#e8632b] text-white text-[12px] font-bold rounded-[8px] hover:bg-[#d55a25] flex items-center gap-[5px] active:scale-[0.97]"><Plus size={14} /> Dialog qo&apos;shish</button>
                  </div>
                  <div className="flex flex-col gap-[16px]">
                    {(getDialogueSection()?.children || []).map((d, dIdx) => (
                      <div key={d.id} className="border border-gray-200 rounded-[10px] overflow-hidden">
                        <div className="bg-[#f1f5f9] px-[14px] py-[10px] flex items-center justify-between">
                          <Input value={d.title} onChange={(v) => updateDialogueTitle(dIdx, v)} placeholder="Dialog nomi" className="flex-1 mr-[8px]" />
                          <div className="flex gap-[6px] flex-shrink-0">
                            <button onClick={() => addDialogueLine(dIdx)} className="px-[10px] py-[5px] bg-white border border-gray-200 text-[11px] font-semibold rounded-[6px] text-gray-600 hover:bg-gray-50 flex items-center gap-[3px]"><Plus size={11} /> Qator</button>
                            <button onClick={() => removeDialogue(dIdx)} className="px-[8px] py-[5px] bg-red-50 text-red-400 text-[11px] rounded-[6px] hover:bg-red-100 flex items-center gap-[3px]" title="O'chirish"><Trash2 size={12} /></button>
                          </div>
                        </div>
                        <div className="p-[12px] flex flex-col gap-[6px]">
                          {(d.dialogueLines || []).map((line, lIdx) => {
                            const isDlgAudioUploading = uploadingDialogueAudio?.dIdx === dIdx && uploadingDialogueAudio?.lIdx === lIdx;
                            return (
                            <div key={lIdx} className="flex items-start gap-[6px] bg-white rounded-[6px] p-[8px] border border-gray-100">
                              <span className="text-[10px] text-gray-300 mt-[8px] w-[16px] flex-shrink-0">{lIdx + 1}</span>
                              <div className="flex-1 flex flex-col gap-[4px]">
                                <div className="grid grid-cols-2 gap-[4px]">
                                  <Input value={line.speaker} onChange={(v) => updateDialogueLine(dIdx, lIdx, "speaker", v)} placeholder="So'zlovchi" className="w-full text-[12px]" />
                                  <Input value={line.text} onChange={(v) => updateDialogueLine(dIdx, lIdx, "text", v)} placeholder="Xitoycha matn" className="w-full text-[12px]" />
                                  <Input value={line.pinyin} onChange={(v) => updateDialogueLine(dIdx, lIdx, "pinyin", v)} placeholder="Pinyin" className="w-full text-[12px]" />
                                  <Input value={line.translation} onChange={(v) => updateDialogueLine(dIdx, lIdx, "translation", v)} placeholder="Tarjima" className="w-full text-[12px]" />
                                </div>
                                {/* Audio row */}
                                <div className="flex items-center gap-[6px]">
                                  {line.audio ? (
                                    <div className="flex items-center gap-[5px] bg-emerald-50 rounded-[6px] px-[8px] py-[4px] flex-1 min-w-0">
                                      <button onClick={() => playAudioPreview(line.audio!)} className="w-[22px] h-[22px] bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-emerald-600 transition-colors" title="Tinglash">
                                        <Play size={10} className="text-white ml-[1px]" />
                                      </button>
                                      <p className="text-[10px] font-semibold text-emerald-700 truncate flex items-center gap-[2px] flex-1 min-w-0"><Music size={9} /> {line.audio.split("/").pop()}</p>
                                      <button onClick={() => updateDialogueLine(dIdx, lIdx, "audio", "")} className="w-[18px] h-[18px] bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-200 flex-shrink-0" title="Audioni o'chirish"><X size={9} /></button>
                                    </div>
                                  ) : (
                                    <button onClick={() => triggerDialogueAudioUpload(dIdx, lIdx)} disabled={isDlgAudioUploading}
                                      className="flex items-center gap-[4px] bg-blue-50 hover:bg-blue-100 text-blue-600 px-[8px] py-[4px] rounded-[6px] text-[10px] font-semibold transition-all disabled:opacity-50 flex-shrink-0">
                                      {isDlgAudioUploading ? <Loader2 size={11} className="animate-spin" /> : <FileAudio size={11} />} Audio
                                    </button>
                                  )}
                                </div>
                              </div>
                              <button onClick={() => removeDialogueLine(dIdx, lIdx)} className="w-[24px] h-[24px] bg-red-50 text-red-400 rounded mt-[6px] flex-shrink-0 hover:bg-red-100 flex items-center justify-center" title="O'chirish"><X size={12} /></button>
                            </div>
                            );
                          })}
                          {(d.dialogueLines || []).length === 0 && <p className="text-[12px] text-gray-300 text-center py-[8px]">Hali qator yo&apos;q. &quot;+ Qator&quot; tugmasini bosing.</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── GRAMMAR TAB ── */}
              {activeTab === "grammar" && (
                <div>
                  <div className="flex items-center justify-between mb-[14px]">
                    <div className="flex items-center gap-[8px]"><Languages size={18} className="text-[#e8632b]" /><p className="text-[15px] font-bold text-gray-700">{(getGrammarSection()?.children || []).length} ta mavzu</p></div>
                    <button onClick={addGrammarTopic} className="px-[14px] py-[8px] bg-[#e8632b] text-white text-[12px] font-bold rounded-[8px] hover:bg-[#d55a25] flex items-center gap-[5px] active:scale-[0.97]"><Plus size={14} /> Mavzu qo&apos;shish</button>
                  </div>
                  <div className="flex flex-col gap-[20px]">
                    {(getGrammarSection()?.children || []).map((topic, tIdx) => (
                      <div key={topic.id} className="border border-gray-200 rounded-[10px] overflow-hidden">
                        <div className="bg-[#fef5f0] px-[14px] py-[10px] flex items-center justify-between">
                          <Input value={topic.title} onChange={(v) => updateGrammarTopicTitle(tIdx, v)} placeholder="Mavzu nomi" className="flex-1 mr-[8px]" />
                          <div className="flex gap-[6px] flex-shrink-0">
                            <button onClick={() => addGrammarRule(tIdx)} className="px-[10px] py-[5px] bg-white border border-gray-200 text-[11px] font-semibold rounded-[6px] text-gray-600 hover:bg-gray-50 flex items-center gap-[3px]"><Plus size={11} /> Qoida</button>
                            <button onClick={() => removeGrammarTopic(tIdx)} className="px-[8px] py-[5px] bg-red-50 text-red-400 text-[11px] rounded-[6px] hover:bg-red-100 flex items-center gap-[3px]" title="O'chirish"><Trash2 size={12} /></button>
                          </div>
                        </div>
                        <div className="p-[12px] flex flex-col gap-[12px]">
                          {(topic.grammarRules || []).map((rule, rIdx) => (
                            <div key={rule.id} className="bg-white border border-gray-100 rounded-[8px] p-[12px]">
                              <div className="flex items-center justify-between mb-[8px]">
                                <span className="text-[11px] text-gray-400 font-bold">Qoida {rIdx + 1}</span>
                                <button onClick={() => removeGrammarRule(tIdx, rIdx)} className="text-[11px] text-red-400 hover:text-red-500 flex items-center gap-[3px]" title="O'chirish"><X size={12} /> O&apos;chirish</button>
                              </div>
                              <div className="flex flex-col gap-[6px]">
                                <Input value={rule.title} onChange={(v) => updateGrammarRule(tIdx, rIdx, { title: v })} placeholder="Qoida sarlavhasi" className="w-full" />
                                <textarea value={rule.explanation} onChange={(e) => updateGrammarRule(tIdx, rIdx, { explanation: e.target.value })} placeholder="Tushuntirish..." title="Tushuntirish" rows={2}
                                  className="w-full px-[12px] py-[8px] rounded-[6px] border border-gray-200 text-[13px] text-gray-800 focus:border-[#e8632b] outline-none resize-none" />
                                <Input value={rule.structure || ""} onChange={(v) => updateGrammarRule(tIdx, rIdx, { structure: v })} placeholder="Struktura" className="w-full" />
                                <Input value={rule.tip || ""} onChange={(v) => updateGrammarRule(tIdx, rIdx, { tip: v })} placeholder="Maslahat (tip)" className="w-full" />
                                <div className="mt-[4px]">
                                  <div className="flex items-center justify-between mb-[4px]">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Misollar</span>
                                    <button onClick={() => addGrammarExample(tIdx, rIdx)} className="text-[10px] text-[#e8632b] font-bold hover:underline flex items-center gap-[3px]"><Plus size={10} /> Misol</button>
                                  </div>
                                  {rule.examples.map((ex, eIdx) => (
                                    <div key={eIdx} className="flex items-center gap-[4px] mb-[4px]">
                                      <Input value={ex.chinese} onChange={(v) => updateGrammarExample(tIdx, rIdx, eIdx, "chinese", v)} placeholder="Xitoycha" className="flex-1 text-[12px] min-w-0" />
                                      <Input value={ex.pinyin} onChange={(v) => updateGrammarExample(tIdx, rIdx, eIdx, "pinyin", v)} placeholder="Pinyin" className="flex-1 text-[12px] min-w-0" />
                                      <Input value={ex.translation} onChange={(v) => updateGrammarExample(tIdx, rIdx, eIdx, "translation", v)} placeholder="Tarjima" className="flex-1 text-[12px] min-w-0" />
                                      <button onClick={() => removeGrammarExample(tIdx, rIdx, eIdx)} className="text-red-300 hover:text-red-500 flex-shrink-0" title="O'chirish"><X size={12} /></button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                          {(topic.grammarRules || []).length === 0 && <p className="text-[12px] text-gray-300 text-center py-[8px]">Hali qoida yo&apos;q.</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TASKS TAB ── */}
              {activeTab === "tasks" && (
                <div>
                  <div className="flex items-center justify-between mb-[14px]">
                    <div className="flex items-center gap-[8px]"><ClipboardCheck size={18} className="text-[#e8632b]" /><p className="text-[15px] font-bold text-gray-700">{(editLesson.tasks || []).length} ta vazifa</p></div>
                    <button onClick={addTask} className="px-[14px] py-[8px] bg-[#e8632b] text-white text-[12px] font-bold rounded-[8px] hover:bg-[#d55a25] flex items-center gap-[5px] active:scale-[0.97]"><Plus size={14} /> Vazifa qo&apos;shish</button>
                  </div>
                  <div className="flex flex-col gap-[12px]">
                    {(editLesson.tasks || []).map((task, tIdx) => (
                      <div key={task.id} className="border border-gray-200 rounded-[10px] p-[14px]">
                        <div className="flex items-center justify-between mb-[10px]">
                          <div className="flex items-center gap-[8px]">
                            <span className="text-[12px] font-bold text-gray-400">#{tIdx + 1}</span>
                            <select value={task.type} onChange={(e) => updateTask(tIdx, { type: e.target.value as Task["type"] })} title="Vazifa turi"
                              className="px-[10px] py-[5px] rounded-[6px] border border-gray-200 text-[12px] text-gray-600 bg-white outline-none">
                              <option value="multiple-choice">Test (tanlash)</option>
                              <option value="fill-blank">Bo&apos;sh joy to&apos;ldirish</option>
                              <option value="true-false">To&apos;g&apos;ri/Noto&apos;g&apos;ri</option>
                              <option value="translate">Tarjima</option>
                            </select>
                          </div>
                          <button onClick={() => removeTask(tIdx)} className="text-[11px] text-red-400 hover:text-red-500 flex items-center gap-[3px]" title="O'chirish"><Trash2 size={12} /> O&apos;chirish</button>
                        </div>
                        <textarea value={task.question} onChange={(e) => updateTask(tIdx, { question: e.target.value })} placeholder="Savol matni..." title="Savol" rows={2}
                          className="w-full px-[12px] py-[8px] rounded-[6px] border border-gray-200 text-[13px] text-gray-800 focus:border-[#e8632b] outline-none resize-none mb-[8px]" />
                        {(task.type === "multiple-choice" || task.type === "true-false") && (
                          <div className="flex flex-col gap-[4px] mb-[8px]">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Variantlar:</span>
                            {(task.options || []).map((opt, oIdx) => (
                              <div key={opt.id} className="flex items-center gap-[6px]">
                                <span className="text-[12px] font-bold text-gray-400 w-[18px]">{opt.id.toUpperCase()}</span>
                                <Input value={opt.text} onChange={(v) => updateTaskOption(tIdx, oIdx, v)} placeholder={`Variant ${opt.id}`} className="flex-1" />
                              </div>
                            ))}
                          </div>
                        )}
                        {(task.type === "fill-blank" || task.type === "translate") && (
                          <Input value={task.hint || ""} onChange={(v) => updateTask(tIdx, { hint: v })} placeholder="Maslahat (hint)" className="w-full mb-[8px]" />
                        )}
                        <div className="flex items-center gap-[8px]">
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex-shrink-0">To&apos;g&apos;ri javob:</span>
                          <Input value={task.correctAnswer} onChange={(v) => updateTask(tIdx, { correctAnswer: v })} placeholder="a, b, c, d yoki matn" className="flex-1" />
                        </div>
                        <div className="mt-[8px]"><Input value={task.explanation || ""} onChange={(v) => updateTask(tIdx, { explanation: v })} placeholder="Tushuntirish..." className="w-full" /></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-[24px] py-[14px] border-t border-gray-100 flex items-center justify-between flex-shrink-0">
              <p className="text-[12px] text-gray-300">
                {(editLesson.words || []).length} so&apos;z · {(editLesson.tasks || []).length} vazifa · {(getDialogueSection()?.children || []).length} dialog · {(getGrammarSection()?.children || []).length} grammatika
              </p>
              <div className="flex gap-[8px]">
                <button onClick={() => { setEditLesson(null); setIsNew(false); }} className="px-[16px] py-[9px] rounded-[8px] border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50">Bekor</button>
                <button onClick={handleSave} disabled={saving} className="px-[20px] py-[9px] bg-[#e8632b] text-white text-[13px] font-bold rounded-[8px] hover:bg-[#d55a25] disabled:opacity-50 transition-all flex items-center gap-[5px]">
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Saqlanmoqda...</> : "Saqlash"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LESSONS LIST ── */}
      {loading ? (
        <div className="flex items-center justify-center h-[200px]"><div className="w-[32px] h-[32px] border-[3px] border-gray-200 border-t-[#e8632b] rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-[14px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f9fafb] text-[11px] uppercase tracking-[0.06em] text-gray-400 font-semibold">
                  <th className="px-[16px] py-[12px] w-[50px]">ID</th>
                  <th className="px-[16px] py-[12px]">Sarlavha</th>
                  <th className="px-[16px] py-[12px]">Nomi</th>
                  <th className="px-[16px] py-[12px] w-[70px]">So&apos;zlar</th>
                  <th className="px-[16px] py-[12px] w-[70px]">Vazifa</th>
                  <th className="px-[16px] py-[12px] w-[80px]">Holat</th>
                  <th className="px-[16px] py-[12px] w-[140px]">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((l) => (
                  <tr key={l.id} className="border-t border-gray-50 hover:bg-[#fafbfc] transition-colors">
                    <td className="px-[16px] py-[12px] text-[13px] text-gray-400 font-mono">{l.id}</td>
                    <td className="px-[16px] py-[12px] text-[13px] font-semibold text-[#1a1a2e]">{l.title}</td>
                    <td className="px-[16px] py-[12px] text-[13px] text-gray-600">{l.name}</td>
                    <td className="px-[16px] py-[12px] text-[13px] text-gray-500">{l.words?.length || 0}</td>
                    <td className="px-[16px] py-[12px] text-[13px] text-gray-500">{l.tasks?.length || 0}</td>
                    <td className="px-[16px] py-[12px]">
                      <span className={`text-[11px] font-bold px-[8px] py-[3px] rounded-full flex items-center gap-[3px] w-fit ${l.locked ? "bg-red-50 text-red-400" : "bg-green-50 text-green-600"}`}>
                        {l.locked ? <><Lock size={11} /> Qulf</> : <><Unlock size={11} /> Ochiq</>}
                      </span>
                    </td>
                    <td className="px-[16px] py-[12px]">
                      <div className="flex gap-[6px]">
                        <button onClick={() => { setEditLesson(l); setIsNew(false); setActiveTab("general"); }}
                          className="px-[12px] py-[6px] bg-[#f1f5f9] text-[11px] font-semibold text-[#1a1a2e] rounded-[6px] hover:bg-[#e2e8f0] flex items-center gap-[4px]"><Pencil size={12} /> Tahrir</button>
                        <button onClick={() => handleDelete(l.id)}
                          className="px-[10px] py-[6px] bg-red-50 text-red-400 text-[11px] rounded-[6px] hover:bg-red-100 flex items-center justify-center" title="O'chirish"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {lessons.length === 0 && <tr><td colSpan={7} className="text-center py-[32px] text-[14px] text-gray-300">Hali darslik yo&apos;q</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
