"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import type { Course, Lesson, LessonSection, GrammarRule, Task } from "@/data/courses";
import LessonsClient from "@/components/LessonsClient";

export default function LessonDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const lessonId = Number(params.lessonId);

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch from API so admin edits are reflected
  useEffect(() => {
    setDataLoading(true);
    Promise.all([
      fetch("/api/courses").then((r) => r.json()),
      fetch(`/api/lessons?slug=${slug}&id=${lessonId}`).then((r) => r.json()),
    ])
      .then(([courses, lessonData]) => {
        const arr = Array.isArray(courses) ? courses : [];
        const c = arr.find((x: Course) => x.slug === slug) || null;
        setCourse(c);
        setLesson(lessonData?.id ? lessonData : null);
        setDataLoading(false);
      })
      .catch(() => setDataLoading(false));
  }, [slug, lessonId]);

  const [activeSection, setActiveSection] = useState("new-words");
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    dialogues: true,
    grammar: true,
  });
  const [activeTab, setActiveTab] = useState<"list" | "cards">("list");
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  /* Audio player state */
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrent, setAudioCurrent] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const dialogueAudioRef = useRef<HTMLAudioElement | null>(null);
  const progressAnimRef = useRef<number | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  /* Word audio state */
  const [playingWordIdx, setPlayingWordIdx] = useState<number | null>(null);
  const wordAudioRef = useRef<HTMLAudioElement | null>(null);

  const playWordAudio = useCallback((audioSrc: string | undefined, idx: number) => {
    if (!audioSrc) return;
    // Stop current
    if (wordAudioRef.current) {
      wordAudioRef.current.pause();
      wordAudioRef.current = null;
    }
    if (playingWordIdx === idx) {
      setPlayingWordIdx(null);
      return;
    }
    const audio = new Audio(audioSrc);
    wordAudioRef.current = audio;
    setPlayingWordIdx(idx);
    audio.play().catch(() => {});
    audio.onended = () => {
      setPlayingWordIdx(null);
      wordAudioRef.current = null;
    };
  }, [playingWordIdx]);

  /* Tasks state */
  const [taskAnswers, setTaskAnswers] = useState<Record<string, string>>({});
  const [taskChecked, setTaskChecked] = useState<Record<string, boolean>>({});
  const [taskScore, setTaskScore] = useState<{ correct: number; total: number } | null>(null);

  const formatTime = useCallback((sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  /* Helper: get ALL dialogue lines (with or without audio) */
  const getDialogueLinesAll = useCallback(() => {
    const secs = lesson?.sections || [];
    const dialogueSection = secs.find((s) => s.id === "dialogues");
    if (!dialogueSection?.children) return [];
    const child = dialogueSection.children.find((c) => c.id === activeSection);
    return child?.dialogueLines || [];
  }, [lesson, activeSection]);

  const hasDialogueData = useCallback(() => {
    return getDialogueLinesAll().length > 0;
  }, [getDialogueLinesAll]);

  /* Stop and cleanup current audio */
  const stopAudio = useCallback(() => {
    if (dialogueAudioRef.current) {
      dialogueAudioRef.current.pause();
      dialogueAudioRef.current.removeAttribute("src");
      dialogueAudioRef.current = null;
    }
    if (progressAnimRef.current) {
      cancelAnimationFrame(progressAnimRef.current);
      progressAnimRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  /* Update progress in animation frame for smooth waveform */
  const updateProgress = useCallback(() => {
    const audio = dialogueAudioRef.current;
    if (!audio || audio.paused) return;
    setAudioCurrent(audio.currentTime);
    setAudioDuration(audio.duration || 0);
    if (audio.duration > 0) {
      setAudioProgress((audio.currentTime / audio.duration) * 100);
    }
    progressAnimRef.current = requestAnimationFrame(updateProgress);
  }, []);

  /* Play a specific dialogue line by index (among ALL lines) */
  const playLineByIndex = useCallback((idx: number) => {
    const allLines = getDialogueLinesAll();
    if (idx < 0 || idx >= allLines.length) {
      // Barcha liniyalar tugadi
      stopAudio();
      setAudioProgress(100);
      setCurrentLineIdx(0);
      return;
    }

    // Eski audioni to'xtat
    if (dialogueAudioRef.current) {
      dialogueAudioRef.current.pause();
      dialogueAudioRef.current = null;
    }
    if (progressAnimRef.current) {
      cancelAnimationFrame(progressAnimRef.current);
    }

    setCurrentLineIdx(idx);
    const line = allLines[idx];

    if (!line.audio) {
      // Audio yo'q — faqat highlight qilish, ishlamasdan
      setIsPlaying(false);
      setAudioProgress(0);
      setAudioCurrent(0);
      setAudioDuration(0);
      return;
    }

    const audio = new Audio(line.audio);
    dialogueAudioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setAudioDuration(audio.duration);
    });

    audio.addEventListener("ended", () => {
      // Keyingi liniyaga o'tish
      playLineByIndex(idx + 1);
    });

    audio.addEventListener("error", () => {
      // Xatolik bo'lsa keyingisiga o'tish
      playLineByIndex(idx + 1);
    });

    audio.play().then(() => {
      setIsPlaying(true);
      progressAnimRef.current = requestAnimationFrame(updateProgress);
    }).catch(() => {
      playLineByIndex(idx + 1);
    });
  }, [getDialogueLinesAll, stopAudio, updateProgress]);

  /* Toggle play/pause */
  const togglePlay = useCallback(() => {
    if (!hasDialogueData()) return;

    if (isPlaying && dialogueAudioRef.current) {
      // Pauza
      dialogueAudioRef.current.pause();
      if (progressAnimRef.current) {
        cancelAnimationFrame(progressAnimRef.current);
      }
      setIsPlaying(false);
    } else if (dialogueAudioRef.current && dialogueAudioRef.current.src) {
      // Davom ettirish
      dialogueAudioRef.current.play().then(() => {
        setIsPlaying(true);
        progressAnimRef.current = requestAnimationFrame(updateProgress);
      }).catch(() => {});
    } else {
      // Yangi boshlash
      setAudioProgress(0);
      setAudioCurrent(0);
      playLineByIndex(0);
    }
  }, [hasDialogueData, isPlaying, playLineByIndex, updateProgress]);

  /* Keyingi liniya */
  const playNext = useCallback(() => {
    const allLines = getDialogueLinesAll();
    const nextIdx = currentLineIdx + 1;
    if (nextIdx < allLines.length) {
      playLineByIndex(nextIdx);
    }
  }, [currentLineIdx, getDialogueLinesAll, playLineByIndex]);

  /* Oldingi liniya */
  const playPrev = useCallback(() => {
    const prevIdx = currentLineIdx - 1;
    if (prevIdx >= 0) {
      playLineByIndex(prevIdx);
    } else {
      // Boshiga qaytish
      playLineByIndex(0);
    }
  }, [currentLineIdx, playLineByIndex]);

  /* Dialogue section o'zgarganda audioni to'xtatish */
  useEffect(() => {
    stopAudio();
    setAudioProgress(0);
    setAudioCurrent(0);
    setAudioDuration(0);
    setCurrentLineIdx(0);
  }, [activeSection, stopAudio]);

  /* Component unmount bo'lganda tozalash */
  useEffect(() => {
    return () => {
      if (dialogueAudioRef.current) {
        dialogueAudioRef.current.pause();
        dialogueAudioRef.current = null;
      }
      if (progressAnimRef.current) {
        cancelAnimationFrame(progressAnimRef.current);
      }
    };
  }, []);

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
        <div className="w-[32px] h-[32px] border-[3px] border-gray-200 border-t-[#e8632b] rounded-full animate-spin" />
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
        <p className="text-gray-400 text-[15px]">Darslik topilmadi</p>
      </div>
    );
  }

  const toggleDropdown = (id: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sections: LessonSection[] = lesson.sections || [
    { id: "new-words", title: "Yangi so\u2018zlar", type: "words" },
    { id: "writing", title: "So\u2018z yozilishi", type: "writing" },
    {
      id: "dialogues",
      title: "Dialoglar",
      type: "dialogue",
      children: [
        { id: "dialogue-1", title: "Salomlashuv" },
        { id: "dialogue-2", title: "Gaplashuv" },
        { id: "dialogue-3", title: "Hayrlashuv" },
      ],
    },
    {
      id: "grammar",
      title: "Grammatika",
      type: "grammar",
      children: [
        { id: "grammar-1", title: "Salomlashuv" },
        { id: "grammar-2", title: "Gaplar" },
        { id: "grammar-3", title: "Hayrbashuv" },
      ],
    },
    { id: "tasks", title: "Vazifalar", type: "tasks" },
  ];

  const words = lesson.words || [];
  const tasks = lesson.tasks || [];

  /* Helper: find active dialogue data */
  const getActiveDialogue = () => {
    const dialogueSection = sections.find((s) => s.id === "dialogues");
    if (!dialogueSection?.children) return null;
    const child = dialogueSection.children.find((c) => c.id === activeSection);
    if (!child?.dialogueLines) return null;
    return { title: child.title, lines: child.dialogueLines };
  };

  /* Helper: find active grammar data */
  const getActiveGrammar = (): { title: string; rules: GrammarRule[] } | null => {
    const grammarSection = sections.find((s) => s.id === "grammar");
    if (!grammarSection?.children) return null;
    const child = grammarSection.children.find((c) => c.id === activeSection);
    if (!child?.grammarRules) return null;
    return { title: child.title, rules: child.grammarRules };
  };

  /* Task helpers */
  const handleTaskAnswer = (taskId: string, answer: string) => {
    if (taskChecked[taskId]) return;
    setTaskAnswers((prev) => ({ ...prev, [taskId]: answer }));
  };

  const checkTask = (taskId: string) => {
    setTaskChecked((prev) => ({ ...prev, [taskId]: true }));
  };

  const checkAllTasks = () => {
    const newChecked: Record<string, boolean> = {};
    let correct = 0;
    tasks.forEach((t) => {
      newChecked[t.id] = true;
      if (taskAnswers[t.id]?.trim().toLowerCase() === t.correctAnswer.trim().toLowerCase()) {
        correct++;
      }
    });
    setTaskChecked(newChecked);
    setTaskScore({ correct, total: tasks.length });
  };

  const resetTasks = () => {
    setTaskAnswers({});
    setTaskChecked({});
    setTaskScore(null);
  };

  /* ---- Sidebar icon ---- */
  const sectionIcon = (type: string, isActive: boolean) => {
    const cls = "w-[18px] h-[18px] flex-shrink-0";
    const color = isActive ? "currentColor" : "#9ca3af";
    switch (type) {
      case "words":
        return (
          <svg className={cls} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        );
      case "writing":
        return (
          <svg className={cls} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        );
      case "dialogue":
        return (
          <svg className={cls} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        );
      case "grammar":
        return (
          <svg className={cls} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      case "tasks":
        return (
          <svg className={cls} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#f7f8fa] overflow-hidden">
      {/* ===== NAVBAR — always on top, never scrolls ===== */}
      <div className="flex-shrink-0">
        <LessonsClient />
      </div>

      {/* ===== BODY: sidebar + content, fill remaining height ===== */}
      <div className="flex flex-1 overflow-hidden">

        {/* ===== LEFT SIDEBAR — own scroll ===== */}
        <aside className="hidden lg:flex flex-col w-[260px] flex-shrink-0 bg-[#1a1a2e] border-r border-[#2a2a45] shadow-[2px_0_12px_rgba(0,0,0,0.15)]">
          {/* Sidebar header */}
          <div className="px-[20px] pt-[20px] pb-[14px] border-b border-[#2a2a45]">
            <h2 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.1em]">Bo&apos;limlar</h2>
          </div>

          {/* Sidebar nav — scrollable */}
          <nav className="flex-1 overflow-y-auto py-[6px]">
            {sections.map((section) => {
              const isActive = activeSection === section.id && !section.children;
              return (
                <div key={section.id}>
                  <button
                    onClick={() => {
                      if (section.children) toggleDropdown(section.id);
                      else setActiveSection(section.id);
                    }}
                    className={`w-full flex items-center justify-between px-[20px] py-[11px] text-left text-[13.5px] transition-all duration-200 ${
                      isActive
                        ? "text-[#f5a623] font-semibold bg-white/[0.08] border-r-[3px] border-[#e8632b]"
                        : activeSection === "new-words-practice" && section.id === "new-words"
                          ? "text-[#f5a623]/70 font-semibold bg-white/[0.05]"
                          : "text-white/60 hover:bg-white/[0.05] hover:text-white/80 font-medium"
                    }`}
                  >
                    <span className="flex items-center gap-[10px]">
                      {sectionIcon(section.type, isActive || (activeSection === "new-words-practice" && section.id === "new-words"))}
                      {section.title}
                    </span>
                    {section.children && (
                      <svg
                        className={`w-[13px] h-[13px] text-white/25 transition-transform duration-200 ${
                          openDropdowns[section.id] ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                  </button>

                  {/* Special sub-item: Yangi so'zlar praktisi */}
                  {section.id === "new-words" && (
                    <button
                      onClick={() => setActiveSection("new-words-practice")}
                      className={`w-full text-left pl-[50px] pr-[20px] py-[8px] text-[12.5px] transition-all duration-150 flex items-center gap-[6px] ${
                        activeSection === "new-words-practice"
                          ? "text-[#f5a623] font-semibold bg-white/[0.06]"
                          : "text-white/35 hover:text-white/55"
                      }`}
                    >
                      <svg className="w-[14px] h-[14px] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                      Yangi so&apos;zlar praktisi
                    </button>
                  )}

                  {section.children && openDropdowns[section.id] && (
                    <div className="bg-white/[0.03]">
                      {section.children.map((child, ci) => (
                        <button
                          key={child.id}
                          onClick={() => setActiveSection(child.id)}
                          className={`w-full text-left pl-[50px] pr-[20px] py-[8px] text-[12.5px] transition-all duration-150 ${
                            activeSection === child.id
                              ? "text-[#f5a623] font-semibold"
                              : "text-white/35 hover:text-white/55"
                          }`}
                        >
                          <span className="text-white/20 mr-[3px] text-[11px]">{ci + 1}.</span>
                          {child.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="px-[20px] py-[14px] border-t border-[#2a2a45]">
            <div className="text-[11px] text-white/30 font-medium">{words.length} ta so&apos;z · {lesson.title}</div>
          </div>
        </aside>

        {/* ===== MAIN CONTENT — own scroll ===== */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          <div className="w-full px-[16px] sm:px-[24px] md:px-[36px] lg:px-[40px] py-[24px] md:py-[36px]">

            {/* ── Title ── */}
            {activeSection.startsWith("dialogue-") ? (() => {
              const dlg = getActiveDialogue();
              return (
              <div className="mb-[24px] md:mb-[36px] bg-gradient-to-br from-[#1a1a2e] via-[#252545] to-[#1e1e3a] rounded-[16px] sm:rounded-[20px] shadow-[0_4px_30px_rgba(26,26,46,0.35)] p-[20px] sm:p-[24px] md:p-[30px] relative overflow-hidden">
                {/* Decorative glows */}
                <div className="absolute top-[-30px] right-[20%] w-[180px] h-[100px] bg-[#e8632b]/8 rounded-full blur-[50px] pointer-events-none" />
                <div className="absolute bottom-[-20px] left-[10%] w-[140px] h-[80px] bg-[#f5a623]/6 rounded-full blur-[40px] pointer-events-none" />

                {/* Badge row */}
                <div className="flex items-center gap-[8px] mb-[10px] sm:mb-[12px] relative">
                  <span className="inline-flex items-center gap-[5px] px-[10px] py-[4px] rounded-full bg-[#e8632b]/20 text-[#f5a623] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.05em]">
                    <svg className="w-[12px] h-[12px]" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    Dialoglar
                  </span>
                  <span className="text-white/20 text-[12px]">&middot;</span>
                  <span className="text-white/40 text-[12px] font-medium">{course.title}</span>
                </div>

                <h1 className="text-[24px] sm:text-[30px] md:text-[36px] lg:text-[42px] font-extrabold tracking-[-0.025em] leading-[1.12] relative">
                  <span className="text-[#e8632b]">{lesson.title}:</span>{" "}
                  <span className="text-white">{dlg?.title || lesson.name}</span>
                </h1>

                {/* Stats row */}
                <div className="flex items-center gap-[12px] sm:gap-[16px] mt-[10px] sm:mt-[12px] relative">
                  <span className="inline-flex items-center gap-[5px] text-[12px] sm:text-[13px] text-white/40 font-medium">
                    <svg className="w-[14px] h-[14px] text-[#f5a623]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                    {words.length} ta so&apos;z
                  </span>
                  <span className="inline-flex items-center gap-[5px] text-[12px] sm:text-[13px] text-white/40 font-medium">
                    <svg className="w-[14px] h-[14px] text-[#22c55e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                    {tasks.length} ta vazifa
                  </span>
                  <span className="inline-flex items-center gap-[5px] text-[12px] sm:text-[13px] text-white/40 font-medium">
                    <svg className="w-[14px] h-[14px] text-[#8b5cf6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    {sections.filter(s => s.id === "dialogues").flatMap(s => s.children || []).length} ta dialog
                  </span>
                </div>

                {/* ── Divider ── */}
                <div className="h-[1px] bg-white/10 my-[18px] sm:my-[22px]" />

                {/* ── Integrated Audio Player ── */}
                <div ref={playerRef} className="relative">
                  {/* Disc + title row */}
                  <div className="flex items-center gap-[14px] sm:gap-[16px] mb-[16px] sm:mb-[20px]">
                    {/* Spinning vinyl disc */}
                    <div className={`w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] rounded-full bg-gradient-to-br from-[#333] to-[#111] flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.4)] flex-shrink-0 ${isPlaying ? 'disc-spin' : 'disc-paused'}`}>
                      <div className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] rounded-full bg-gradient-to-br from-[#e8632b] to-[#f5a623]">
                        <div className="w-full h-full rounded-full flex items-center justify-center">
                          <div className="w-[6px] h-[6px] rounded-full bg-[#1a1a2e]" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-[8px]">
                        {/* Equalizer bars */}
                        <div className="flex items-end gap-[2px] h-[16px] sm:h-[18px]">
                          {[1,2,3,4].map((i) => (
                            <div
                              key={i}
                              className={`w-[3px] rounded-full bg-[#f5a623] ${isPlaying ? `eq-bar eq-bar-${i}` : ''}`}
                              style={!isPlaying ? { height: `${4 + i * 2}px` } : undefined}
                            />
                          ))}
                        </div>
                        <span className="text-white text-[13px] sm:text-[14px] font-semibold truncate">
                          {dlg?.title || "Audio"}
                        </span>
                      </div>
                      <span className="text-white/30 text-[10px] sm:text-[11px] font-medium truncate block max-w-[280px] sm:max-w-[400px]">
                        {getDialogueLinesAll()[currentLineIdx]
                          ? `${getDialogueLinesAll()[currentLineIdx].speaker}: ${getDialogueLinesAll()[currentLineIdx].text}`
                          : `${lesson.name} · Dialog audio`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Waveform progress bar */}
                  <div
                    className={`relative h-[32px] sm:h-[36px] flex items-end gap-[1.5px] sm:gap-[2px] mb-[6px] sm:mb-[8px] ${hasDialogueData() ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                    onClick={(e) => {
                      if (!hasDialogueData()) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
                      if (dialogueAudioRef.current && dialogueAudioRef.current.duration) {
                        const seekTime = (pct / 100) * dialogueAudioRef.current.duration;
                        dialogueAudioRef.current.currentTime = seekTime;
                        setAudioProgress(pct);
                        setAudioCurrent(seekTime);
                      }
                    }}
                  >
                    {Array.from({ length: 60 }).map((_, i) => {
                      const total = 60;
                      const pos = (i / total) * 100;
                      const isPassed = pos <= audioProgress;
                      // deterministic pseudo-random heights for a waveform look
                      const h = 30 + Math.abs(Math.sin(i * 0.7) * 70) + Math.abs(Math.cos(i * 1.3) * 30);
                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-colors duration-150 ${
                            isPassed
                              ? 'bg-gradient-to-t from-[#e8632b] to-[#f5a623]'
                              : 'bg-white/15'
                          } ${isPlaying && isPassed ? 'waveform-bar' : ''}`}
                          style={{
                            height: `${h}%`,
                            animationDelay: isPlaying && isPassed ? `${i * 0.03}s` : undefined,
                          }}
                        />
                      );
                    })}
                    {/* Playing head glow dot */}
                    {isPlaying && (
                      <div
                        className="absolute bottom-0 w-[4px] h-full pointer-events-none"
                        style={{ left: `${audioProgress}%` }}
                      >
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[6px] h-[6px] bg-[#f5a623] rounded-full progress-glow" />
                      </div>
                    )}
                  </div>

                  {/* Time labels */}
                  <div className="flex items-center justify-between mb-[14px] sm:mb-[18px]">
                    <span className="text-[10px] sm:text-[11px] text-white/40 font-mono tabular-nums">
                      {formatTime(audioCurrent)}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-white/40 font-mono tabular-nums">
                      -{formatTime(audioDuration > 0 ? audioDuration - audioCurrent : 0)}
                    </span>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-[16px] sm:gap-[22px] md:gap-[28px]">
                    <button aria-label="Shuffle" className="w-[30px] h-[30px] flex items-center justify-center text-white/25 hover:text-white/50 transition-colors">
                      <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" />
                      </svg>
                    </button>

                    <button
                      onClick={playPrev}
                      aria-label="Oldingi"
                      className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] flex items-center justify-center text-white/50 hover:text-white transition-colors hover:scale-110 active:scale-95"
                    >
                      <svg className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                      </svg>
                    </button>

                    {/* Play/Pause */}
                    <button
                      onClick={togglePlay}
                      disabled={!hasDialogueData()}
                      aria-label={isPlaying ? "Pauza" : !hasDialogueData() ? "Audio mavjud emas" : "Tinglash"}
                      title={!hasDialogueData() ? "Dialog audio yuklangan emas" : undefined}
                      className={`w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] md:w-[66px] md:h-[66px] rounded-full flex items-center justify-center transition-all duration-300 ${
                        !hasDialogueData()
                          ? 'bg-white/30 cursor-not-allowed opacity-50'
                          : isPlaying
                            ? 'bg-gradient-to-br from-[#e8632b] to-[#f5a623] shadow-[0_0_24px_rgba(232,99,43,0.5),0_4px_16px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95'
                            : 'bg-white shadow-[0_4px_24px_rgba(255,255,255,0.12),0_2px_8px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95'
                      }`}
                    >
                      {isPlaying ? (
                        <svg viewBox="0 0 24 24" fill="white" className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]">
                          <rect x="6" y="4" width="4" height="16" rx="1.5"/>
                          <rect x="14" y="4" width="4" height="16" rx="1.5"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="#1a1a2e" className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] ml-[2px]">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                      )}
                    </button>

                    <button aria-label="Keyingi" title="Keyingi" onClick={playNext} className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] flex items-center justify-center text-white/50 hover:text-white transition-colors hover:scale-110 active:scale-95">
                      <svg className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                      </svg>
                    </button>

                    <button aria-label="Takrorlash" className="w-[30px] h-[30px] flex items-center justify-center text-white/25 hover:text-white/50 transition-colors">
                      <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              );
            })() : (
            <div className="mb-[24px] md:mb-[36px] bg-gradient-to-r from-[#fff8f4] via-[#fffaf6] to-white rounded-[16px] sm:rounded-[20px] border border-[#f5e6da]/60 p-[20px] sm:p-[24px] md:p-[30px] relative overflow-hidden">
              {/* Decorative bg elements */}
              <div className="absolute top-[-20px] right-[-20px] w-[120px] h-[120px] bg-[#e8632b]/[0.04] rounded-full blur-[40px] pointer-events-none" />
              <div className="absolute bottom-[-10px] left-[-10px] w-[80px] h-[80px] bg-[#f5a623]/[0.05] rounded-full blur-[30px] pointer-events-none" />

              {/* Badge row */}
              <div className="flex items-center gap-[8px] mb-[10px] sm:mb-[12px] relative">
                <span className="inline-flex items-center gap-[5px] px-[10px] py-[4px] rounded-full bg-[#e8632b]/10 text-[#e8632b] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.05em]">
                  <svg className="w-[12px] h-[12px]" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  {activeSection === "new-words-practice"
                    ? "Praktika"
                    : activeSection.startsWith("dialogue-")
                      ? "Dialoglar"
                      : activeSection === "writing"
                        ? "Yozuv"
                        : activeSection.startsWith("grammar-")
                          ? "Grammatika"
                          : activeSection === "tasks"
                            ? "Vazifalar"
                            : "Yangi so\u2018zlar"}
                </span>
                <span className="text-gray-300 text-[12px]">&middot;</span>
                <span className="text-gray-400 text-[12px] font-medium">{course.title}</span>
              </div>

              <h1 className="text-[24px] sm:text-[30px] md:text-[36px] lg:text-[42px] font-extrabold tracking-[-0.025em] leading-[1.12] relative">
                <span className="text-[#e8632b]">
                  {lesson.title}:
                </span>{" "}
                <span className="text-[#1a1a2e]">
                  {activeSection.startsWith("dialogue-")
                    ? (getActiveDialogue()?.title || lesson.name)
                    : activeSection.startsWith("grammar-")
                      ? (getActiveGrammar()?.title || lesson.name)
                      : lesson.name}
                </span>
              </h1>

              {/* Stats row */}
              <div className="flex items-center gap-[12px] sm:gap-[16px] mt-[12px] sm:mt-[14px] relative">
                <span className="inline-flex items-center gap-[5px] text-[12px] sm:text-[13px] text-gray-400 font-medium">
                  <svg className="w-[14px] h-[14px] text-[#f5a623]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                  {words.length} ta so&apos;z
                </span>
                <span className="inline-flex items-center gap-[5px] text-[12px] sm:text-[13px] text-gray-400 font-medium">
                  <svg className="w-[14px] h-[14px] text-[#22c55e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                  {tasks.length} ta vazifa
                </span>
                <span className="inline-flex items-center gap-[5px] text-[12px] sm:text-[13px] text-gray-400 font-medium">
                  <svg className="w-[14px] h-[14px] text-[#8b5cf6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  {sections.filter(s => s.id === "dialogues").flatMap(s => s.children || []).length} ta dialog
                </span>
              </div>
            </div>
            )}

            {/* ── Mobile Sidebar ── */}
            <div className="lg:hidden mb-[16px]">
              <details className="bg-white rounded-[12px] border border-gray-100 overflow-hidden">
                <summary className="px-[16px] py-[12px] text-[13px] font-semibold text-[#444] cursor-pointer flex items-center gap-[8px]">
                  <svg className="w-[16px] h-[16px] text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
                  Bo&apos;limlar
                </summary>
                <nav className="border-t border-gray-50">
                  {sections.map((section) => {
                    const isActive = activeSection === section.id && !section.children;
                    return (
                      <div key={section.id}>
                        <button
                          onClick={() => {
                            if (section.children) toggleDropdown(section.id);
                            else setActiveSection(section.id);
                          }}
                          className={`w-full flex items-center justify-between px-[16px] py-[10px] text-left text-[13px] transition-all ${
                            isActive ? "text-[#e8632b] font-semibold bg-[#fef7f3]" : "text-[#555] hover:bg-gray-50/60 font-medium"
                          }`}
                        >
                          <span className="flex items-center gap-[8px]">
                            {sectionIcon(section.type, isActive)}
                            {section.title}
                          </span>
                          {section.children && (
                            <svg className={`w-[13px] h-[13px] text-gray-300 transition-transform ${openDropdowns[section.id] ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                          )}
                        </button>
                        {/* Mobile: practice sub-item */}
                        {section.id === "new-words" && (
                          <button
                            onClick={() => setActiveSection("new-words-practice")}
                            className={`w-full text-left pl-[42px] pr-[16px] py-[8px] text-[12px] flex items-center gap-[5px] ${
                              activeSection === "new-words-practice" ? "text-[#e8632b] font-semibold" : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            <svg className="w-[12px] h-[12px] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                              <line x1="8" y1="21" x2="16" y2="21" />
                              <line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                            Yangi so&apos;zlar praktisi
                          </button>
                        )}
                        {section.children && openDropdowns[section.id] && (
                          <div className="bg-[#fafbfc]">
                            {section.children.map((child, ci) => (
                              <button key={child.id} onClick={() => setActiveSection(child.id)} className={`w-full text-left pl-[42px] pr-[16px] py-[8px] text-[12px] ${activeSection === child.id ? "text-[#e8632b] font-semibold" : "text-gray-400 hover:text-gray-600"}`}>
                                <span className="text-gray-300 mr-[3px] text-[11px]">{ci + 1}.</span>{child.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </details>
            </div>

            {/* ══════════════════════════════════════════ */}
            {/* ── WORDS LIST VIEW (So'zlar ro'yxati) ── */}
            {/* ══════════════════════════════════════════ */}
            {activeSection === "new-words" && (
              <>
                {/* ── Tab switcher ── */}
                <div className="flex items-center gap-[6px] mb-[16px] md:mb-[20px]">
              <button
                onClick={() => setActiveTab("list")}
                className={`flex items-center gap-[6px] px-[14px] py-[8px] rounded-[8px] text-[12.5px] font-semibold transition-all duration-200 ${
                  activeTab === "list"
                    ? "bg-[#e8632b] text-white shadow-[0_2px_10px_rgba(232,99,43,0.2)]"
                    : "bg-white text-gray-400 border border-gray-200 hover:text-gray-500"
                }`}
              >
                <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                </svg>
                Ro&apos;yxat
              </button>
              <button
                onClick={() => setActiveTab("cards")}
                className={`flex items-center gap-[6px] px-[14px] py-[8px] rounded-[8px] text-[12.5px] font-semibold transition-all duration-200 ${
                  activeTab === "cards"
                    ? "bg-[#e8632b] text-white shadow-[0_2px_10px_rgba(232,99,43,0.2)]"
                    : "bg-white text-gray-400 border border-gray-200 hover:text-gray-500"
                }`}
              >
                <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                </svg>
                Kartochka
              </button>
            </div>

            {/* ── LIST VIEW ── */}
            {activeTab === "list" && (
              <div className="bg-white rounded-[12px] sm:rounded-[14px] border border-gray-200 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                {/* Table header */}
                <div className="hidden sm:grid sm:grid-cols-[40px_1.2fr_1fr_1fr] items-center px-[16px] sm:px-[20px] md:px-[24px] py-[10px] bg-[#f8f9fb] border-b border-gray-200">
                  <span></span>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.08em]">So&apos;z</span>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.08em]">Pinyin</span>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.08em]">Tarjima</span>
                </div>

                {words.map((word, idx) => (
                  <div
                    key={idx}
                    className="group border-b border-gray-100 last:border-b-0 hover:bg-[#fefaf7] transition-colors duration-150"
                  >
                    {/* ── Desktop: notebook-style row ── */}
                    <div className="hidden sm:grid sm:grid-cols-[40px_1.2fr_1fr_1fr] items-center px-[16px] sm:px-[20px] md:px-[24px] py-[14px] sm:py-[16px] gap-x-[12px] sm:gap-x-[16px]">
                      {/* Play button */}
                      <button
                        title={`${word.pinyin} tinglash`}
                        onClick={() => playWordAudio(word.audio, idx)}
                        className={`w-[36px] h-[36px] sm:w-[38px] sm:h-[38px] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 ${
                          word.audio
                            ? playingWordIdx === idx
                              ? "bg-gradient-to-br from-[#22c55e] to-[#16a34a] shadow-[0_2px_8px_rgba(34,197,94,0.3)] scale-105"
                              : "bg-gradient-to-br from-[#f5a623] to-[#e8632b] shadow-[0_2px_6px_rgba(245,166,35,0.2)] hover:shadow-[0_3px_10px_rgba(245,166,35,0.3)]"
                            : "bg-gray-200 cursor-default"
                        }`}
                      >
                        {playingWordIdx === idx ? (
                          <svg viewBox="0 0 24 24" fill="white" className="w-[12px] h-[12px] animate-pulse">
                            <rect x="6" y="5" width="3" height="14" rx="1.5" />
                            <rect x="15" y="5" width="3" height="14" rx="1.5" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="white" className="w-[12px] h-[12px] ml-[1px]">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        )}
                      </button>

                      {/* Hanzi */}
                      <div className="flex items-center gap-[8px]">
                        <span className="text-[28px] sm:text-[30px] md:text-[34px] text-[#1a1a2e] font-semibold leading-none group-hover:text-[#e8632b] transition-colors duration-200">
                          {word.hanzi}
                        </span>
                      </div>

                      {/* Pinyin */}
                      <span className="text-[14px] sm:text-[15px] md:text-[16px] text-[#e8632b] font-medium italic leading-snug">
                        {word.pinyin}
                      </span>

                      {/* Translation */}
                      <span className="text-[14px] sm:text-[15px] md:text-[16px] text-[#333] font-semibold leading-snug">
                        {word.translation}
                      </span>
                    </div>

                    {/* ── Mobile: compact row ── */}
                    <div className="sm:hidden flex items-center gap-[10px] px-[12px] py-[12px]">
                      {/* Play button */}
                      <button
                        title={`${word.pinyin} tinglash`}
                        onClick={() => playWordAudio(word.audio, idx)}
                        className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 ${
                          word.audio
                            ? playingWordIdx === idx
                              ? "bg-gradient-to-br from-[#22c55e] to-[#16a34a] shadow-[0_2px_8px_rgba(34,197,94,0.3)]"
                              : "bg-gradient-to-br from-[#f5a623] to-[#e8632b] shadow-[0_2px_6px_rgba(245,166,35,0.2)]"
                            : "bg-gray-200 cursor-default"
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="white" className="w-[11px] h-[11px] ml-[1px]">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </button>

                      {/* Hanzi */}
                      <span className="text-[26px] text-[#1a1a2e] font-semibold leading-none flex-shrink-0 min-w-[40px] group-hover:text-[#e8632b] transition-colors">
                        {word.hanzi}
                      </span>

                      {/* Pinyin + Translation */}
                      <div className="flex-1 flex flex-col gap-[2px] min-w-0">
                        <span className="text-[13px] text-[#e8632b] font-medium italic leading-snug">
                          {word.pinyin}
                        </span>
                        <span className="text-[13px] text-[#333] font-semibold leading-snug truncate">
                          {word.translation}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── CARDS VIEW ── */}
            {activeTab === "cards" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[10px] sm:gap-[14px] md:gap-[16px]">
                {words.map((word, idx) => (
                  <div
                    key={idx}
                    className="group bg-white rounded-[14px] sm:rounded-[16px] border border-gray-100 p-[18px] sm:p-[22px] md:p-[26px] flex flex-col items-center text-center transition-all duration-200 hover:shadow-[0_6px_24px_rgba(232,99,43,0.1)] hover:border-[#e8632b]/20 hover:-translate-y-[2px] relative overflow-hidden"
                  >
                    {/* Number */}
                    <span className="absolute top-[10px] left-[10px] w-[22px] h-[22px] rounded-[6px] bg-[#f8f4f0] flex items-center justify-center text-[10px] font-bold text-[#c4a882] border border-[#efe8df]">
                      {idx + 1}
                    </span>

                    {/* Image */}
                    {word.image && (
                      <div className="w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] rounded-[10px] overflow-hidden border border-gray-100 mb-[10px] group-hover:border-[#e8632b]/20 transition-colors">
                        <img src={word.image} alt={word.translation} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Hanzi */}
                    <span className="text-[32px] sm:text-[38px] md:text-[44px] text-[#1a1a2e] font-semibold leading-none mb-[8px] sm:mb-[10px] group-hover:text-[#e8632b] transition-colors duration-300">
                      {word.hanzi}
                    </span>

                    {/* Pinyin badge */}
                    <span className="inline-flex items-center px-[8px] py-[3px] rounded-full bg-[#fff5ee] text-[#e8632b] text-[12px] sm:text-[13px] font-semibold italic mb-[6px] border border-[#fde8d8]">
                      {word.pinyin}
                    </span>

                    {/* Translation */}
                    <span className="text-[12px] sm:text-[13px] text-gray-500 font-medium leading-snug">
                      {word.translation}
                    </span>

                    {/* Play button */}
                    <button
                      title={`${word.pinyin} tinglash`}
                      onClick={() => playWordAudio(word.audio, idx + 500)}
                      className={`mt-[12px] sm:mt-[14px] w-[32px] h-[32px] sm:w-[34px] sm:h-[34px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 ${word.audio ? "bg-gradient-to-br from-[#f5a623] to-[#e8632b] shadow-[0_3px_10px_rgba(245,166,35,0.3)]" : "bg-gray-200"}`}
                    >
                      <svg viewBox="0 0 24 24" fill="white" className="w-[11px] h-[11px] ml-[1px]">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Footer ── */}
            <div className="mt-[16px] flex items-center justify-between text-[11px] text-gray-300">
              <span>{words.length} ta so&apos;z</span>
              <span>{lesson.title} · {course.title}</span>
            </div>
              </>
            )}

            {/* ══════════════════════════════════════════════ */}
            {/* ── PRACTICE VIEW (Yangi so'zlar praktisi) ── */}
            {/* ══════════════════════════════════════════════ */}
            {activeSection === "new-words-practice" && words.length > 0 && (
              <div className="flex flex-col items-center">
                {/* Flashcard */}
                <div className="relative w-full max-w-[480px]">
                  {/* Navigation arrows */}
                  <button
                    onClick={() => { setFlipped(false); setPracticeIndex((prev) => (prev - 1 + words.length) % words.length); }}
                    aria-label="Oldingi so'z"
                    className="absolute left-[-20px] sm:left-[-28px] top-1/2 -translate-y-1/2 z-10 w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] bg-gradient-to-br from-[#f5a623] to-[#e8932b] rounded-full flex items-center justify-center shadow-[0_3px_12px_rgba(245,166,35,0.3)] hover:shadow-[0_4px_16px_rgba(245,166,35,0.4)] hover:scale-110 active:scale-95 transition-all duration-200"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  <button
                    onClick={() => { setFlipped(false); setPracticeIndex((prev) => (prev + 1) % words.length); }}
                    aria-label="Keyingi so'z"
                    className="absolute right-[-20px] sm:right-[-28px] top-1/2 -translate-y-1/2 z-10 w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] bg-gradient-to-br from-[#f5a623] to-[#e8932b] rounded-full flex items-center justify-center shadow-[0_3px_12px_rgba(245,166,35,0.3)] hover:shadow-[0_4px_16px_rgba(245,166,35,0.4)] hover:scale-110 active:scale-95 transition-all duration-200"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  {/* Flip Card */}
                  <div
                    className="flashcard-scene mx-[24px] sm:mx-[32px] cursor-pointer"
                    onClick={() => setFlipped((f) => !f)}
                  >
                    <div className={`flashcard-card aspect-[10/11] ${flipped ? "flipped" : ""}`}>
                      {/* ── FRONT FACE: image + hanzi + pinyin + play ── */}
                      <div className="flashcard-face bg-white border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-[20px] sm:p-[28px] md:p-[36px] flex flex-col items-center text-center">
                        {/* Illustration */}
                        <div className="w-full flex-1 max-h-[55%] rounded-[12px] bg-gradient-to-br from-[#f9fafb] to-[#f3f4f6] border border-gray-100 flex items-center justify-center overflow-hidden mb-[16px] sm:mb-[20px]">
                          {words[practiceIndex].image ? (
                            <img
                              src={words[practiceIndex].image!}
                              alt={words[practiceIndex].translation}
                              className="w-full h-full object-contain p-[8px]"
                            />
                          ) : (
                            <span className="text-[60px] sm:text-[80px] text-gray-200">🖼</span>
                          )}
                        </div>

                        {/* Play button */}
                        <button
                          title={`${words[practiceIndex].pinyin} tinglash`}
                          onClick={(e) => { e.stopPropagation(); if (words[practiceIndex].audio) new Audio(words[practiceIndex].audio!).play(); }}
                          className={`w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(245,166,35,0.3)] hover:scale-110 active:scale-95 transition-all duration-200 mb-[12px] ${words[practiceIndex].audio ? "bg-gradient-to-br from-[#f5a623] to-[#e8932b]" : "bg-gray-200"}`}
                        >
                          <svg viewBox="0 0 24 24" fill="white" className="w-[14px] h-[14px] ml-[1px]">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </button>

                        {/* Hanzi */}
                        <h2 className="text-[32px] sm:text-[40px] md:text-[48px] font-bold text-[#1a1a2e] leading-none mb-[6px]">
                          {words[practiceIndex].hanzi}
                        </h2>

                        {/* Pinyin */}
                        <p className="text-[15px] sm:text-[17px] md:text-[19px] text-[#e8632b] font-medium italic mb-[8px]">
                          {words[practiceIndex].pinyin}
                        </p>

                        {/* Flip hint */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
                          className="w-[32px] h-[32px] bg-gradient-to-br from-[#f5a623] to-[#e8932b] rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(245,166,35,0.25)] hover:scale-110 active:scale-95 transition-all duration-200"
                          aria-label="Kartani aylantirish"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]">
                            <path d="M7 16l-4-4 4-4"/>
                            <path d="M3 12h14a4 4 0 010 0"/>
                            <path d="M17 8l4 4-4 4"/>
                            <path d="M21 12H7"/>
                          </svg>
                        </button>
                      </div>

                      {/* ── BACK FACE: image + translation ── */}
                      <div className="flashcard-face flashcard-face--back bg-white border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-[20px] sm:p-[28px] md:p-[36px] flex flex-col items-center text-center">
                        {/* Illustration (same image) */}
                        <div className="w-full flex-1 max-h-[55%] rounded-[12px] bg-gradient-to-br from-[#f9fafb] to-[#f3f4f6] border border-gray-100 flex items-center justify-center overflow-hidden mb-[16px] sm:mb-[20px]">
                          {words[practiceIndex].image ? (
                            <img
                              src={words[practiceIndex].image!}
                              alt={words[practiceIndex].translation}
                              className="w-full h-full object-contain p-[8px]"
                            />
                          ) : (
                            <span className="text-[60px] sm:text-[80px] text-gray-200">🖼</span>
                          )}
                        </div>

                        {/* Translation (big, centered) */}
                        <h2 className="text-[28px] sm:text-[36px] md:text-[44px] font-bold text-[#1a1a2e] leading-none mb-[12px]">
                          {words[practiceIndex].translation}
                        </h2>

                        {/* Flip back hint */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
                          className="w-[32px] h-[32px] bg-gradient-to-br from-[#f5a623] to-[#e8932b] rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(245,166,35,0.25)] hover:scale-110 active:scale-95 transition-all duration-200"
                          aria-label="Kartani orqaga aylantirish"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]">
                            <path d="M7 16l-4-4 4-4"/>
                            <path d="M3 12h14a4 4 0 010 0"/>
                            <path d="M17 8l4 4-4 4"/>
                            <path d="M21 12H7"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Counter */}
                <div className="mt-[20px] sm:mt-[28px] flex items-center gap-[8px] text-[13px] sm:text-[14px] text-gray-400 font-medium">
                  <span className="text-[#e8632b] font-bold">汉字</span>
                  <span>{practiceIndex + 1}/{words.length}</span>
                </div>

                {/* Progress dots */}
                <div className="mt-[12px] flex items-center gap-[6px] flex-wrap justify-center max-w-[400px]">
                  {words.map((w, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setFlipped(false); setPracticeIndex(idx); }}
                      aria-label={`${idx + 1}-so'z: ${w.hanzi}`}
                      className={`w-[8px] h-[8px] rounded-full transition-all duration-200 ${
                        idx === practiceIndex
                          ? "bg-[#e8632b] scale-125"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════ */}
            {/* ── DIALOGUE VIEW                        ── */}
            {/* ══════════════════════════════════════════ */}
            {activeSection.startsWith("dialogue-") && (() => {
              const dialogue = getActiveDialogue();
              if (!dialogue) return null;
              return (
                <div className="flex flex-col gap-[16px] sm:gap-[20px]">

                  {/* ── Dialogue Lines ── */}
                  <div className="bg-white rounded-[14px] border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] px-[20px] sm:px-[28px] md:px-[40px] py-[24px] sm:py-[32px] md:py-[40px]">
                    <div className="flex flex-col gap-[24px] sm:gap-[30px] md:gap-[36px]">
                      {dialogue.lines.map((line, idx) => {
                          /* highlight: currentLineIdx to'g'ridan-to'g'ri idx bilan taqqoslash */
                          const isCurrentlyPlaying = idx === currentLineIdx;
                          return (
                          <div key={idx} className={`group transition-all duration-300 rounded-[10px] px-[12px] py-[10px] -mx-[12px] ${isCurrentlyPlaying ? "bg-gradient-to-r from-[#e8632b]/10 to-[#f5a623]/10 ring-1 ring-[#e8632b]/20" : ""}`}>
                            {/* Xitoycha matni */}
                            <p className="text-[15px] sm:text-[16px] md:text-[17px] leading-[1.7] flex items-start gap-[8px]">
                              <span className="flex-1">
                                <span className={`font-extrabold ${isCurrentlyPlaying ? "text-[#e8632b]" : "text-[#1a1a2e]"} transition-colors duration-300`}>
                                  {line.speaker}
                                </span>
                                <span className="text-gray-300 mx-[2px]">:</span>
                                <span className={`font-medium ml-[4px] ${isCurrentlyPlaying ? "text-[#1a1a2e]" : "text-[#333]"} transition-colors duration-300`}>{line.text}</span>
                              </span>
                              <button
                                onClick={() => {
                                  /* Scroll the content container to top where the player is */
                                  if (scrollContainerRef.current) {
                                    scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
                                  }
                                  /* Flash animation on player */
                                  if (playerRef.current) {
                                    playerRef.current.classList.remove("player-flash");
                                    void playerRef.current.offsetWidth;
                                    playerRef.current.classList.add("player-flash");
                                  }
                                  setTimeout(() => {
                                    playLineByIndex(idx);
                                  }, 400);
                                }}
                                className={`flex-shrink-0 mt-[2px] w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(232,99,43,0.3)] hover:shadow-[0_3px_12px_rgba(232,99,43,0.4)] hover:scale-105 active:scale-95 transition-all ${isCurrentlyPlaying ? "bg-gradient-to-br from-[#c0392b] to-[#e74c3c] animate-pulse" : "bg-gradient-to-br from-[#e8632b] to-[#f5a623]"}`}
                                title={isCurrentlyPlaying ? "Ijro etilmoqda..." : "Tinglash"}
                              >
                                <svg className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] text-white ml-[1px]" viewBox="0 0 24 24" fill="currentColor">
                                  {isCurrentlyPlaying ? (
                                    <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>
                                  ) : (
                                    <polygon points="5 3 19 12 5 21 5 3"/>
                                  )}
                                </svg>
                              </button>
                            </p>
                            {/* Pinyin */}
                            <p className={`text-[13px] sm:text-[14px] italic mt-[3px] ml-[2px] transition-colors duration-300 ${isCurrentlyPlaying ? "text-[#e8632b] font-semibold" : "text-[#e8632b]"}`}>
                              {line.pinyin}
                            </p>
                            {/* O'zbekcha tarjima */}
                            <p className={`text-[13px] sm:text-[14px] mt-[2px] ml-[2px] transition-colors duration-300 ${isCurrentlyPlaying ? "text-gray-600" : "text-gray-400"}`}>
                              {line.translation}
                            </p>
                          </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ══════════════════════════════════════════ */}
            {/* ── WRITING VIEW (So'z yozilishi)        ── */}
            {/* ══════════════════════════════════════════ */}
            {activeSection === "writing" && words.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-[12px] sm:gap-[16px] md:gap-[20px]">
                {words.map((word, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-[14px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col group hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-[#e8632b]/20 transition-all duration-200"
                  >
                    {/* Hanzi display area */}
                    <div className="flex-1 flex flex-col items-center justify-center p-[16px] sm:p-[20px] md:p-[28px] min-h-[120px] sm:min-h-[150px] md:min-h-[180px]">
                      <span className="text-[48px] sm:text-[56px] md:text-[68px] lg:text-[80px] text-[#1a1a2e] font-medium leading-none mb-[8px]">
                        {word.hanzi}
                      </span>
                      <span className="text-[12px] sm:text-[13px] text-[#e8632b] italic font-medium">
                        {word.pinyin}
                      </span>
                      <span className="text-[11px] sm:text-[12px] text-gray-400 mt-[2px]">
                        {word.translation}
                      </span>
                    </div>

                    {/* Action button */}
                    <div className="px-[12px] sm:px-[16px] pb-[12px] sm:pb-[16px]">
                      <button
                        className="w-full py-[8px] sm:py-[10px] bg-gradient-to-r from-[#f5a623] to-[#e8932b] hover:from-[#e89620] hover:to-[#d68325] text-white text-[11px] sm:text-[12px] font-bold rounded-full shadow-[0_2px_8px_rgba(245,166,35,0.3)] hover:shadow-[0_3px_12px_rgba(245,166,35,0.4)] active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-[5px]"
                      >
                        <svg className="w-[13px] h-[13px] sm:w-[14px] sm:h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        Yozish amal →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ══════════════════════════════════════════ */}
            {/* ── GRAMMAR VIEW (Grammatika)             ── */}
            {/* ══════════════════════════════════════════ */}
            {activeSection.startsWith("grammar-") && (() => {
              const grammar = getActiveGrammar();
              if (!grammar) return (
                <div className="bg-white rounded-[14px] border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] p-[32px] text-center">
                  <div className="text-[40px] mb-[12px]">📖</div>
                  <p className="text-gray-400 text-[14px]">Bu bo&apos;lim uchun grammatika hali qo&apos;shilmagan.</p>
                </div>
              );
              return (
                <div className="flex flex-col gap-[20px] sm:gap-[28px]">
                  {grammar.rules.map((rule, rIdx) => (
                    <div key={rule.id} className="bg-white rounded-[14px] border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
                      {/* Rule header */}
                      <div className="bg-gradient-to-r from-[#fef5f0] to-[#fff8f4] border-b border-[#f5ddd0] px-[20px] sm:px-[28px] md:px-[36px] py-[16px] sm:py-[20px]">
                        <div className="flex items-center gap-[10px] mb-[6px]">
                          <span className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] bg-[#e8632b] text-white rounded-full flex items-center justify-center text-[13px] sm:text-[14px] font-bold flex-shrink-0">
                            {rIdx + 1}
                          </span>
                          <h3 className="text-[16px] sm:text-[18px] md:text-[20px] font-bold text-[#1a1a2e] leading-tight">
                            {rule.title}
                          </h3>
                        </div>
                      </div>

                      {/* Rule body */}
                      <div className="px-[20px] sm:px-[28px] md:px-[36px] py-[20px] sm:py-[24px]">
                        {/* Explanation */}
                        <p className="text-[14px] sm:text-[15px] text-gray-600 leading-[1.8] mb-[16px]">
                          {rule.explanation}
                        </p>

                        {/* Structure */}
                        {rule.structure && (
                          <div className="bg-[#f8f9fa] border border-gray-100 rounded-[10px] px-[16px] sm:px-[20px] py-[12px] sm:py-[14px] mb-[20px]">
                            <span className="text-[11px] sm:text-[12px] font-bold text-gray-400 uppercase tracking-[0.08em] block mb-[4px]">Struktura:</span>
                            <code className="text-[14px] sm:text-[16px] font-mono font-bold text-[#e8632b]">
                              {rule.structure}
                            </code>
                          </div>
                        )}

                        {/* Examples */}
                        <div className="mb-[16px]">
                          <h4 className="text-[12px] sm:text-[13px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-[12px] flex items-center gap-[6px]">
                            <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
                            Misollar:
                          </h4>
                          <div className="flex flex-col gap-[10px] sm:gap-[12px]">
                            {rule.examples.map((ex, eIdx) => (
                              <div key={eIdx} className="bg-white border border-gray-100 rounded-[10px] px-[16px] sm:px-[20px] py-[12px] sm:py-[14px] hover:border-[#e8632b]/20 transition-colors">
                                <p className="text-[18px] sm:text-[20px] md:text-[22px] font-medium text-[#1a1a2e] leading-tight">
                                  {ex.chinese}
                                </p>
                                <p className="text-[13px] sm:text-[14px] text-[#e8632b] italic mt-[4px]">
                                  {ex.pinyin}
                                </p>
                                <p className="text-[13px] sm:text-[14px] text-gray-500 mt-[2px]">
                                  {ex.translation}
                                </p>
                                {ex.note && (
                                  <p className="text-[12px] text-gray-400 italic mt-[4px]">💡 {ex.note}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tip */}
                        {rule.tip && (
                          <div className="bg-gradient-to-r from-[#fffbeb] to-[#fef9e7] border border-[#fde68a] rounded-[10px] px-[16px] sm:px-[20px] py-[12px] sm:py-[14px] flex items-start gap-[10px]">
                            <span className="text-[18px] flex-shrink-0 mt-[1px]">💡</span>
                            <p className="text-[13px] sm:text-[14px] text-[#92400e] leading-[1.6] font-medium">
                              {rule.tip}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* ══════════════════════════════════════════ */}
            {/* ── TASKS VIEW (Vazifalar)                ── */}
            {/* ══════════════════════════════════════════ */}
            {activeSection === "tasks" && (() => {
              if (tasks.length === 0) return (
                <div className="bg-white rounded-[14px] border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] p-[32px] text-center">
                  <div className="text-[40px] mb-[12px]">📝</div>
                  <p className="text-gray-400 text-[14px]">Bu darslik uchun vazifalar hali qo&apos;shilmagan.</p>
                </div>
              );
              return (
                <div className="flex flex-col gap-[16px] sm:gap-[20px]">
                  {/* Score banner */}
                  {taskScore && (
                    <div className={`rounded-[14px] px-[20px] sm:px-[28px] py-[16px] sm:py-[20px] flex items-center justify-between shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${
                      taskScore.correct === taskScore.total
                        ? "bg-gradient-to-r from-[#d1fae5] to-[#ecfdf5] border border-[#6ee7b7]"
                        : taskScore.correct >= taskScore.total * 0.7
                          ? "bg-gradient-to-r from-[#fef9c3] to-[#fefce8] border border-[#fde68a]"
                          : "bg-gradient-to-r from-[#fee2e2] to-[#fef2f2] border border-[#fca5a5]"
                    }`}>
                      <div className="flex items-center gap-[12px]">
                        <span className="text-[28px] sm:text-[32px]">
                          {taskScore.correct === taskScore.total ? "🎉" : taskScore.correct >= taskScore.total * 0.7 ? "👍" : "💪"}
                        </span>
                        <div>
                          <p className="text-[15px] sm:text-[17px] font-bold text-[#1a1a2e]">
                            Natija: {taskScore.correct}/{taskScore.total}
                          </p>
                          <p className="text-[12px] sm:text-[13px] text-gray-500">
                            {taskScore.correct === taskScore.total
                              ? "Ajoyib! Barcha javoblar to'g'ri! 🌟"
                              : taskScore.correct >= taskScore.total * 0.7
                                ? "Yaxshi natija! Biroz ko'proq mashq qiling."
                                : "Darslikni qayta ko'rib chiqing va yana urinib ko'ring!"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={resetTasks}
                        className="px-[14px] sm:px-[18px] py-[8px] sm:py-[10px] bg-white border border-gray-200 rounded-[8px] text-[12px] sm:text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
                      >
                        Qayta boshlash
                      </button>
                    </div>
                  )}

                  {/* Task cards */}
                  {tasks.map((task, tIdx) => {
                    const answered = taskAnswers[task.id];
                    const checked = taskChecked[task.id];
                    const isCorrect = answered?.trim().toLowerCase() === task.correctAnswer.trim().toLowerCase();

                    return (
                      <div key={task.id} className={`bg-white rounded-[14px] border shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 ${
                        checked
                          ? isCorrect
                            ? "border-[#34d399]"
                            : "border-[#f87171]"
                          : "border-gray-100"
                      }`}>
                        {/* Task header */}
                        <div className="px-[20px] sm:px-[28px] pt-[18px] sm:pt-[22px] pb-[14px] flex items-start gap-[12px]">
                          <span className={`w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] rounded-full flex items-center justify-center text-[13px] sm:text-[14px] font-bold flex-shrink-0 ${
                            checked
                              ? isCorrect
                                ? "bg-[#34d399] text-white"
                                : "bg-[#f87171] text-white"
                              : "bg-[#f3f4f6] text-gray-500"
                          }`}>
                            {checked ? (isCorrect ? "✓" : "✗") : tIdx + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-[8px] mb-[4px]">
                              <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] px-[8px] py-[2px] rounded-full ${
                                task.type === "multiple-choice" ? "bg-blue-50 text-blue-500"
                                : task.type === "fill-blank" ? "bg-purple-50 text-purple-500"
                                : task.type === "true-false" ? "bg-amber-50 text-amber-600"
                                : "bg-green-50 text-green-600"
                              }`}>
                                {task.type === "multiple-choice" ? "Test"
                                : task.type === "fill-blank" ? "Bo'sh joy"
                                : task.type === "true-false" ? "To'g'ri/Noto'g'ri"
                                : "Tarjima"}
                              </span>
                            </div>
                            <p className="text-[14px] sm:text-[15px] md:text-[16px] text-[#1a1a2e] font-semibold leading-[1.6] whitespace-pre-line">
                              {task.question}
                            </p>
                            {task.hint && !checked && (
                              <p className="text-[12px] sm:text-[13px] text-gray-400 italic mt-[6px]">
                                💡 Maslahat: {task.hint}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Task body */}
                        <div className="px-[20px] sm:px-[28px] pb-[18px] sm:pb-[22px]">
                          {/* Multiple choice / True-false */}
                          {(task.type === "multiple-choice" || task.type === "true-false") && task.options && (
                            <div className="flex flex-col gap-[8px] sm:gap-[10px]">
                              {task.options.map((opt) => {
                                const selected = answered === opt.id;
                                const isOptCorrect = opt.id === task.correctAnswer;
                                return (
                                  <button
                                    key={opt.id}
                                    onClick={() => handleTaskAnswer(task.id, opt.id)}
                                    disabled={!!checked}
                                    className={`w-full text-left px-[16px] sm:px-[20px] py-[12px] sm:py-[14px] rounded-[10px] border text-[13px] sm:text-[14px] font-medium transition-all duration-200 ${
                                      checked
                                        ? isOptCorrect
                                          ? "bg-[#d1fae5] border-[#34d399] text-[#065f46]"
                                          : selected && !isOptCorrect
                                            ? "bg-[#fee2e2] border-[#f87171] text-[#991b1b] line-through"
                                            : "bg-gray-50 border-gray-100 text-gray-400"
                                        : selected
                                          ? "bg-[#fef5f0] border-[#e8632b] text-[#e8632b]"
                                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                                  >
                                    <span className="flex items-center gap-[10px]">
                                      <span className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center text-[11px] flex-shrink-0 ${
                                        checked
                                          ? isOptCorrect
                                            ? "border-[#34d399] bg-[#34d399] text-white"
                                            : selected && !isOptCorrect
                                              ? "border-[#f87171] bg-[#f87171] text-white"
                                              : "border-gray-200"
                                          : selected
                                            ? "border-[#e8632b] bg-[#e8632b] text-white"
                                            : "border-gray-300"
                                      }`}>
                                        {checked && isOptCorrect ? "✓" : checked && selected && !isOptCorrect ? "✗" : opt.id.toUpperCase()}
                                      </span>
                                      {opt.text}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Fill blank / Translate */}
                          {(task.type === "fill-blank" || task.type === "translate") && (
                            <div>
                              <input
                                type="text"
                                placeholder={task.type === "fill-blank" ? "Javobni yozing..." : "Tarjimani yozing..."}
                                value={answered || ""}
                                onChange={(e) => handleTaskAnswer(task.id, e.target.value)}
                                disabled={!!checked}
                                className={`w-full px-[16px] sm:px-[20px] py-[12px] sm:py-[14px] rounded-[10px] border text-[14px] sm:text-[15px] font-medium transition-all duration-200 outline-none ${
                                  checked
                                    ? isCorrect
                                      ? "bg-[#d1fae5] border-[#34d399] text-[#065f46]"
                                      : "bg-[#fee2e2] border-[#f87171] text-[#991b1b]"
                                    : "bg-white border-gray-200 text-[#1a1a2e] focus:border-[#e8632b] focus:ring-2 focus:ring-[#e8632b]/10"
                                }`}
                              />
                              {checked && !isCorrect && (
                                <p className="mt-[8px] text-[13px] font-semibold text-[#059669]">
                                  ✅ To&apos;g&apos;ri javob: <span className="text-[#1a1a2e]">{task.correctAnswer}</span>
                                </p>
                              )}
                            </div>
                          )}

                          {/* Check button */}
                          {answered && !checked && (
                            <button
                              onClick={() => checkTask(task.id)}
                              className="mt-[12px] px-[18px] sm:px-[22px] py-[9px] sm:py-[10px] bg-[#e8632b] text-white text-[12px] sm:text-[13px] font-bold rounded-[8px] hover:bg-[#d55a25] active:scale-[0.97] transition-all shadow-[0_2px_8px_rgba(232,99,43,0.25)]"
                            >
                              Tekshirish
                            </button>
                          )}

                          {/* Explanation */}
                          {checked && task.explanation && (
                            <div className={`mt-[12px] sm:mt-[16px] px-[14px] sm:px-[18px] py-[12px] sm:py-[14px] rounded-[10px] border text-[13px] sm:text-[14px] leading-[1.6] ${
                              isCorrect
                                ? "bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]"
                                : "bg-[#fef2f2] border-[#fecaca] text-[#991b1b]"
                            }`}>
                              <span className="font-bold">{isCorrect ? "✅ To'g'ri!" : "❌ Noto'g'ri."}</span>{" "}
                              {task.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Bottom: Check all / Reset */}
                  <div className="flex items-center justify-center gap-[12px] pt-[8px] pb-[16px]">
                    {!taskScore && (
                      <button
                        onClick={checkAllTasks}
                        className="px-[24px] sm:px-[32px] py-[12px] sm:py-[14px] bg-gradient-to-r from-[#e8632b] to-[#d55a25] text-white text-[14px] sm:text-[15px] font-bold rounded-[10px] hover:from-[#d55a25] hover:to-[#c04f20] active:scale-[0.97] transition-all shadow-[0_4px_16px_rgba(232,99,43,0.3)] flex items-center gap-[8px]"
                      >
                        <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 11l3 3L22 4"/>
                          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                        </svg>
                        Barchasini tekshirish
                      </button>
                    )}
                    {taskScore && (
                      <button
                        onClick={resetTasks}
                        className="px-[24px] sm:px-[32px] py-[12px] sm:py-[14px] bg-white border-2 border-[#e8632b] text-[#e8632b] text-[14px] sm:text-[15px] font-bold rounded-[10px] hover:bg-[#fef5f0] active:scale-[0.97] transition-all flex items-center gap-[8px]"
                      >
                        <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                        </svg>
                        Qayta boshlash
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      </div>
    </div>
  );
}
