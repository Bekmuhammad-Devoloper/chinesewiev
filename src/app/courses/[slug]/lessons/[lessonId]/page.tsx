"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import type { Course, Lesson, LessonSection, GrammarRule, Task } from "@/data/courses";
import LessonsClient from "@/components/LessonsClient";
import { getWordEmoji } from "@/lib/word-emoji";

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const lessonId = Number(params.lessonId);

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch from API so admin edits are reflected
  useEffect(() => {
    setDataLoading(true);

    // Session tekshirish
    let isAuth = false;
    try {
      const session = localStorage.getItem("user_session");
      if (session) {
        const user = JSON.parse(session);
        if (user && new Date(user.expiresAt) > new Date()) {
          // Umumiy kurs kaliti — barcha darslarga kirish mumkin
          if (user.course === slug && !user.lessonId) {
            isAuth = true;
          }
          // Bitta dars uchun kalit — faqat o'sha darsga kirish mumkin
          if (user.course === slug && user.lessonId === lessonId) {
            isAuth = true;
          }
        }
      }
    } catch {}

    Promise.all([
      fetch("/api/courses").then((r) => r.json()),
      fetch(`/api/lessons?slug=${slug}&id=${lessonId}`).then((r) => r.json()),
    ])
      .then(([courses, lessonData]) => {
        const arr = Array.isArray(courses) ? courses : [];
        const c = arr.find((x: Course) => x.slug === slug) || null;
        setCourse(c);
        const les = lessonData?.id ? lessonData : null;
        setLesson(les);
        // Agar dars nashr qilinmagan bo'lsa — kirish mumkin emas
        if (les?.published === false) {
          router.replace(`/courses/${slug}/lessons`);
          return;
        }
        // Agar dars locked va foydalanuvchi login qilmagan bo'lsa
        if (les?.locked && !isAuth) {
          router.replace("/login");
          return;
        }
        setDataLoading(false);
      })
      .catch(() => setDataLoading(false));
  }, [slug, lessonId, router]);

  const [activeSection, setActiveSection] = useState("new-words");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    dialogues: true,
    grammar: true,
  });
  const [activeTab, setActiveTab] = useState<"list" | "cards">("list");
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [fetchedImages, setFetchedImages] = useState<Record<string, string>>({});

  /* So'zlar uchun rasmlarni avtomatik yuklash (rasm yo'q bo'lganda) */
  useEffect(() => {
    if (!lesson?.words) return;
    const wordsWithoutImages = lesson.words.filter((w) => !w.image);
    if (wordsWithoutImages.length === 0) return;

    wordsWithoutImages.forEach((word) => {
      const key = `${word.hanzi}|${word.translation}`;
      if (fetchedImages[key]) return;
      fetch(`/api/word-image?hanzi=${encodeURIComponent(word.hanzi)}&translation=${encodeURIComponent(word.translation)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.url) {
            setFetchedImages((prev) => ({ ...prev, [key]: data.url }));
          }
        })
        .catch(() => {});
    });
  }, [lesson?.words]); // eslint-disable-line react-hooks/exhaustive-deps

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

  /* Lightbox state for writing sheets */
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

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

  /* Helper: get dialogue-level audio URL */
  const getDialogueAudio = useCallback(() => {
    const secs = lesson?.sections || [];
    const dialogueSection = secs.find((s) => s.id === "dialogues");
    if (!dialogueSection?.children) return "";
    const child = dialogueSection.children.find((c) => c.id === activeSection);
    return child?.audio || "";
  }, [lesson, activeSection]);

  const hasDialogueData = useCallback(() => {
    return getDialogueLinesAll().length > 0 || !!getDialogueAudio();
  }, [getDialogueLinesAll, getDialogueAudio]);

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
    const groupAudio = getDialogueAudio();

    // Eski audioni to'xtat
    if (dialogueAudioRef.current) {
      dialogueAudioRef.current.pause();
      dialogueAudioRef.current = null;
    }
    if (progressAnimRef.current) {
      cancelAnimationFrame(progressAnimRef.current);
    }

    // Agar dialog umumiy audio bo'lsa — to'g'ridan-to'g'ri play qilish
    if (groupAudio && idx === 0) {
      setCurrentLineIdx(0);
      const audio = new Audio(groupAudio);
      dialogueAudioRef.current = audio;

      audio.addEventListener("loadedmetadata", () => {
        setAudioDuration(audio.duration);
      });

      audio.addEventListener("ended", () => {
        stopAudio();
        setAudioProgress(100);
        setCurrentLineIdx(0);
      });

      audio.addEventListener("error", () => {
        stopAudio();
      });

      audio.play().then(() => {
        setIsPlaying(true);
        progressAnimRef.current = requestAnimationFrame(updateProgress);
      }).catch(() => {
        stopAudio();
      });
      return;
    }

    // Agar dialog umumiy audio bo'lsa va idx > 0 — hech nima qilmaslik
    if (groupAudio) {
      return;
    }

    if (idx < 0 || idx >= allLines.length) {
      stopAudio();
      setAudioProgress(100);
      setCurrentLineIdx(0);
      return;
    }

    setCurrentLineIdx(idx);

    // Har bir qator uchun alohida audio
    const line = allLines[idx];

    if (!line.audio) {
      // Audio yo'q — playerda vizual ko'rsatish uchun qisqa animatsiya
      setIsPlaying(true);
      setAudioProgress(0);
      setAudioCurrent(0);
      setAudioDuration(0);
      setTimeout(() => {
        setIsPlaying(false);
      }, 1500);
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
  }, [getDialogueLinesAll, getDialogueAudio, stopAudio, updateProgress]);

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
  ];

  const words = lesson.words || [];
  const tasks = lesson.tasks || [];

  /* Helper: find active dialogue data */
  const getActiveDialogue = () => {
    const dialogueSection = sections.find((s) => s.id === "dialogues");
    if (!dialogueSection?.children) return null;
    const child = dialogueSection.children.find((c) => c.id === activeSection);
    if (!child?.dialogueLines && !child?.contentHtml) return null;
    return { title: child.title, lines: child.dialogueLines || [], contentHtml: child.contentHtml };
  };

  /* Helper: find active grammar data */
  const getActiveGrammar = (): { title: string; rules: GrammarRule[]; contentHtml?: string } | null => {
    const grammarSection = sections.find((s) => s.id === "grammar");
    if (!grammarSection?.children) return null;
    const child = grammarSection.children.find((c) => c.id === activeSection);
    if (!child?.grammarRules && !child?.contentHtml) return null;
    return { title: child.title, rules: child.grammarRules || [], contentHtml: child.contentHtml };
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

  /* ---- Mobile "Menu" trigger button ---- */
  const renderMobileTrigger = () => (
    <button
      onClick={() => setSidebarOpen(true)}
      className="lg:hidden self-start flex items-center gap-[8px] text-[14px] text-gray-500 font-medium hover:text-gray-700 transition-colors py-[4px] mb-[12px]"
    >
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
      Menu
    </button>
  );

  /* ---- Sidebar nav content (shared between desktop + mobile) ---- */
  const renderSidebarNav = () => (
    <>
      {sections.filter((s) => s.id !== "writing").map((section) => {
        const isActive = activeSection === section.id && !section.children;
        const isParentOfActive =
          (activeSection === "new-words-practice" && section.id === "new-words") ||
          (activeSection === "writing" && section.id === "new-words") ||
          (section.children && section.children.some((c) => c.id === activeSection));

        return (
          <div key={section.id} className="mb-[4px]">
            <button
              onClick={() => {
                if (section.children) toggleDropdown(section.id);
                else { setActiveSection(section.id); setSidebarOpen(false); }
              }}
              className={`w-full flex items-center justify-between px-[14px] py-[11px] text-left text-[13.5px] rounded-[12px] transition-all duration-200 ${
                isActive
                  ? "text-white font-bold bg-gradient-to-r from-[#f5a623] to-[#f0c040] shadow-[0_3px_12px_rgba(245,166,35,0.35)]"
                  : isParentOfActive
                    ? "text-[#f5a623] font-semibold bg-[#fef7e7]"
                    : "text-gray-700 hover:bg-gray-50 font-medium"
              }`}
            >
              <span className="flex items-center gap-[10px]">
                {sectionIcon(section.type, isActive || !!isParentOfActive, isActive)}
                {section.title}
              </span>
              {section.children && (
                <svg
                  className={`w-[16px] h-[16px] transition-transform duration-200 ${
                    isActive ? "text-white" : isParentOfActive ? "text-[#f5a623]" : "text-gray-400"
                  } ${openDropdowns[section.id] ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </button>

            {section.id === "new-words" && (
              <div className="ml-[18px] mt-[4px] space-y-[2px]">
                <button
                  onClick={() => { setActiveSection("new-words-practice"); setSidebarOpen(false); }}
                  className={`w-full text-left px-[10px] py-[8px] text-[12.5px] rounded-[8px] transition-all duration-150 flex items-center gap-[8px] ${
                    activeSection === "new-words-practice"
                      ? "text-[#e8632b] font-semibold bg-orange-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-[16px] h-[16px] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                  </svg>
                  Yangi so&apos;zlar praktikasi
                </button>
                <button
                  onClick={() => { setActiveSection("writing"); setSidebarOpen(false); }}
                  className={`w-full text-left px-[10px] py-[8px] text-[12.5px] rounded-[8px] transition-all duration-150 flex items-center gap-[8px] ${
                    activeSection === "writing"
                      ? "text-[#e8632b] font-semibold bg-orange-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-[16px] h-[16px] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  So&apos;z yozilishi
                </button>
              </div>
            )}

            {section.children && openDropdowns[section.id] && (
              <div className="ml-[18px] mt-[4px] space-y-[2px]">
                {section.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => { setActiveSection(child.id); setSidebarOpen(false); }}
                    className={`w-full text-left px-[10px] py-[8px] text-[12.5px] rounded-[8px] transition-all duration-150 flex items-center gap-[8px] ${
                      activeSection === child.id
                        ? "text-[#e8632b] font-semibold bg-orange-50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {sectionIcon(section.type, activeSection === child.id)}
                    {child.title}
                  </button>
                ))}
              </div>
            )}

            {section.id !== "tasks" && (
              <div className="h-[1px] bg-gray-100 mx-[6px] my-[8px]" />
            )}
          </div>
        );
      })}
    </>
  );

  /* ---- Sidebar icon ---- */
  const sectionIcon = (type: string, isActive: boolean, isWhite?: boolean) => {
    const cls = "w-[18px] h-[18px] flex-shrink-0";
    const color = isWhite ? "#ffffff" : isActive ? "#f5a623" : "#6b7280";
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

        {/* ===== MOBILE SIDEBAR OVERLAY ===== */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            {/* Drawer */}
            <aside className="absolute left-0 top-0 h-full w-[260px] bg-white shadow-[4px_0_20px_rgba(0,0,0,0.1)] flex flex-col animate-slide-in-left">
              {/* Header */}
              <div className="flex items-center justify-between px-[14px] py-[12px] border-b border-gray-100">
                <span className="text-[14px] font-bold text-gray-700">Menu</span>
                <button onClick={() => setSidebarOpen(false)} title="Yopish" className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] hover:bg-gray-100 transition-colors">
                  <svg className="w-[18px] h-[18px] text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              {/* Nav */}
              <nav className="flex-1 overflow-y-auto py-[14px] px-[12px]">
                {renderSidebarNav()}
              </nav>
            </aside>
          </div>
        )}

        {/* ===== LEFT SIDEBAR — desktop only ===== */}
        <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 bg-white border-r border-gray-200 shadow-[1px_0_8px_rgba(0,0,0,0.04)]">

          {/* Sidebar nav — scrollable */}
          <nav className="flex-1 overflow-y-auto py-[14px] px-[12px]">
            {renderSidebarNav()}
          </nav>
        </aside>

        {/* ===== MAIN CONTENT — own scroll ===== */}
        <div ref={scrollContainerRef} className={`flex-1 ${activeSection === "new-words-practice" ? "overflow-hidden" : "overflow-y-auto"}`}>
          <div className={`w-full px-[16px] sm:px-[24px] md:px-[36px] lg:px-[40px] ${activeSection === "new-words-practice" ? "py-[12px] md:py-[16px] h-full" : "py-[24px] md:py-[36px]"}`}>

            {activeSection.startsWith("dialogue-") ? (() => {
              const dlg = getActiveDialogue();
              return (
              <div className="mb-[24px] md:mb-[36px] bg-gradient-to-br from-[#1a1a2e] via-[#252545] to-[#1e1e3a] rounded-[16px] sm:rounded-[20px] shadow-[0_4px_30px_rgba(26,26,46,0.35)] p-[20px] sm:p-[24px] md:p-[30px] relative overflow-hidden">
                {/* Decorative glows */}
                <div className="absolute top-[-30px] right-[20%] w-[180px] h-[100px] bg-[#e8632b]/8 rounded-full blur-[50px] pointer-events-none" />
                <div className="absolute bottom-[-20px] left-[10%] w-[140px] h-[80px] bg-[#f5a623]/6 rounded-full blur-[40px] pointer-events-none" />

                {/* ── Integrated Audio Player ── */}
                <div ref={playerRef} className="relative">

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
                  <div className="flex items-center justify-center">
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
                  </div>
                </div>
              </div>
              );
            })() : (
            <>
            </>
            )}

            {/* ══════════════════════════════════════════ */}
            {/* ── WORDS LIST VIEW (So'zlar ro'yxati) ── */}
            {/* ══════════════════════════════════════════ */}
            {activeSection === "new-words" && (
              <>
                {renderMobileTrigger()}

            {/* ── LIST VIEW ── */}
            {(
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
                    <div className="hidden sm:grid sm:grid-cols-[40px_1.2fr_1fr_1fr] items-start px-[16px] sm:px-[20px] md:px-[24px] py-[14px] sm:py-[16px] gap-x-[12px] sm:gap-x-[16px]">
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
                      <div className="flex items-center gap-[8px] min-w-0">
                        <span className="text-[28px] sm:text-[30px] md:text-[34px] text-[#1a1a2e] font-semibold leading-none group-hover:text-[#e8632b] transition-colors duration-200 break-all">
                          {word.hanzi}
                        </span>
                      </div>

                      {/* Pinyin */}
                      <span className="text-[14px] sm:text-[15px] md:text-[16px] text-[#e8632b] font-medium italic leading-snug break-all min-w-0">
                        {word.pinyin}
                      </span>

                      {/* Translation */}
                      <span className="text-[14px] sm:text-[15px] md:text-[16px] text-[#333] font-semibold leading-snug break-all min-w-0">
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
                        <span className="text-[13px] text-[#e8632b] font-medium italic leading-snug break-all">
                          {word.pinyin}
                        </span>
                        <span className="text-[13px] text-[#333] font-semibold leading-snug break-all">
                          {word.translation}
                        </span>
                      </div>
                    </div>
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
              <div className="flex flex-col items-center h-[calc(100vh-140px)]">
                {renderMobileTrigger()}
                {/* Flashcard */}
                <div className="relative w-full max-w-[480px] flex-1 min-h-0 flex flex-col justify-center">
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
                    <div className={`flashcard-card aspect-[10/14] sm:aspect-[10/13] max-h-[calc(100vh-220px)] ${flipped ? "flipped" : ""}`}>
                      {/* ── FRONT FACE: image + hanzi + pinyin + play ── */}
                      <div className={`flashcard-face bg-white border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-[16px] sm:p-[24px] md:p-[32px] flex flex-col items-center text-center gap-[14px] sm:gap-[18px] ${!words[practiceIndex].image ? "justify-center" : ""}`}>
                        {/* Illustration — faqat admin rasm yuklagan bo'lsa yoki Pixabay'dan topilgan bo'lsa */}
                        {(words[practiceIndex].image || fetchedImages[`${words[practiceIndex].hanzi}|${words[practiceIndex].translation}`]) ? (
                          <div className="w-full flex-1 max-h-[48%] rounded-[12px] bg-gradient-to-br from-[#f9fafb] to-[#f3f4f6] border border-gray-100 flex items-center justify-center overflow-hidden">
                            <img
                              src={words[practiceIndex].image || fetchedImages[`${words[practiceIndex].hanzi}|${words[practiceIndex].translation}`]}
                              alt={words[practiceIndex].translation}
                              className="w-full h-full object-contain p-[4px]"
                            />
                          </div>
                        ) : null}

                        {/* Play button */}
                        <button
                          title={`${words[practiceIndex].pinyin} tinglash`}
                          onClick={(e) => { e.stopPropagation(); if (words[practiceIndex].audio) new Audio(words[practiceIndex].audio!).play(); }}
                          className={`w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(245,166,35,0.3)] hover:scale-110 active:scale-95 transition-all duration-200 flex-shrink-0 ${words[practiceIndex].audio ? "bg-gradient-to-br from-[#f5a623] to-[#e8932b]" : "bg-gray-200"}`}
                        >
                          <svg viewBox="0 0 24 24" fill="white" className="w-[14px] h-[14px] ml-[1px]">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </button>

                        {/* Hanzi */}
                        <h2 className="text-[32px] sm:text-[40px] md:text-[48px] font-bold text-[#1a1a2e] leading-none">
                          {words[practiceIndex].hanzi}
                        </h2>

                        {/* Pinyin */}
                        <p className="text-[15px] sm:text-[17px] md:text-[19px] text-[#e8632b] font-medium italic">
                          {words[practiceIndex].pinyin}
                        </p>

                        {/* Flip hint */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
                          className="w-[32px] h-[32px] bg-gradient-to-br from-[#f5a623] to-[#e8932b] rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(245,166,35,0.25)] hover:scale-110 active:scale-95 transition-all duration-200 flex-shrink-0"
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
                      <div className={`flashcard-face flashcard-face--back bg-white border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-[16px] sm:p-[24px] md:p-[32px] flex flex-col items-center text-center gap-[14px] sm:gap-[18px] justify-center`}>
                        {/* Illustration (same image) — faqat rasm mavjud bo'lganda */}
                        {(words[practiceIndex].image || fetchedImages[`${words[practiceIndex].hanzi}|${words[practiceIndex].translation}`]) ? (
                          <div className="w-full flex-1 max-h-[48%] rounded-[12px] bg-gradient-to-br from-[#f9fafb] to-[#f3f4f6] border border-gray-100 flex items-center justify-center overflow-hidden">
                            <img
                              src={words[practiceIndex].image || fetchedImages[`${words[practiceIndex].hanzi}|${words[practiceIndex].translation}`]}
                              alt={words[practiceIndex].translation}
                              className="w-full h-full object-contain p-[4px]"
                            />
                          </div>
                        ) : null}

                        {/* Translation (big, centered) */}
                        <h2 className="text-[28px] sm:text-[36px] md:text-[44px] font-bold text-[#1a1a2e] leading-tight">
                          {words[practiceIndex].translation}
                        </h2>

                        {/* Flip back hint */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
                          className="w-[32px] h-[32px] bg-gradient-to-br from-[#f5a623] to-[#e8932b] rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(245,166,35,0.25)] hover:scale-110 active:scale-95 transition-all duration-200 flex-shrink-0"
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

                  {/* ── Mobile Menu trigger ── */}
                  <div className="lg:hidden mt-[16px]">
                    {renderMobileTrigger()}
                  </div>

                  {/* ── Dialogue Content ── */}
                  <div className="bg-white rounded-[14px] border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] px-[20px] sm:px-[28px] md:px-[40px] py-[24px] sm:py-[32px] md:py-[40px]">
                    {dialogue.contentHtml ? (
                      <div
                        className="word-content prose prose-sm sm:prose-base max-w-none"
                        dangerouslySetInnerHTML={{ __html: dialogue.contentHtml }}
                      />
                    ) : (
                    <div className="flex flex-col gap-[24px] sm:gap-[30px] md:gap-[36px]">
                      {dialogue.lines.map((line, idx) => {
                          const isCurrentlyPlaying = idx === currentLineIdx;
                          return (
                          <div key={idx} className={`group transition-all duration-300 rounded-[10px] px-[12px] py-[10px] -mx-[12px] ${isCurrentlyPlaying ? "bg-gradient-to-r from-[#e8632b]/10 to-[#f5a623]/10 ring-1 ring-[#e8632b]/20" : ""}`}>
                            <p className="text-[15px] sm:text-[16px] md:text-[17px] leading-[1.7]">
                              <span className={`font-extrabold ${isCurrentlyPlaying ? "text-[#e8632b]" : "text-[#1a1a2e]"} transition-colors duration-300`}>
                                {line.speaker}
                              </span>
                              <span className="text-gray-300 mx-[2px]">:</span>
                              <span className={`font-medium ml-[4px] ${isCurrentlyPlaying ? "text-[#1a1a2e]" : "text-[#333]"} transition-colors duration-300`}>{line.text}</span>
                            </p>
                            <p className={`text-[13px] sm:text-[14px] italic mt-[3px] ml-[2px] transition-colors duration-300 ${isCurrentlyPlaying ? "text-[#e8632b] font-semibold" : "text-[#e8632b]"}`}>
                              {line.pinyin}
                            </p>
                            <p className={`text-[13px] sm:text-[14px] mt-[2px] ml-[2px] transition-colors duration-300 ${isCurrentlyPlaying ? "text-gray-600" : "text-gray-400"}`}>
                              {line.translation}
                            </p>
                          </div>
                          );
                        })}
                    </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ══════════════════════════════════════════ */}
            {/* ── WRITING VIEW (So'z yozilishi)        ── */}
            {/* ══════════════════════════════════════════ */}
            {activeSection === "writing" && (
              <div>
                {renderMobileTrigger()}
                {(lesson?.writingSheets || []).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-[10px] md:gap-x-[14px] gap-y-[6px] h-[calc(100vh-130px)]" style={{ gridTemplateRows: `repeat(${Math.ceil(lesson!.writingSheets!.length / 3)}, 1fr)` }}>
                    {(lesson!.writingSheets!).map((sheet, sIdx) => (
                      <div key={sIdx} className="flex flex-col items-center min-h-0">
                        {/* Kartochka */}
                        <div className="flex-1 min-h-0 aspect-[3/4] bg-white rounded-[10px] border border-gray-800 overflow-hidden cursor-pointer" onClick={() => setLightboxImg(sheet)}>
                          <img
                            src={sheet}
                            alt={`Husnihat ${sIdx + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        {/* Yuklab olish tugmasi */}
                        <div className="shrink-0 pt-[10px] pb-[2px]">
                          <a
                            href={sheet}
                            download={`${lesson!.title}-husnihat-${sIdx + 1}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-[4px] px-[14px] py-[5px] bg-[#ffb520] hover:bg-[#e8a41c] text-white text-[11px] font-medium rounded-[50px] active:scale-[0.97] transition-all duration-200"
                          >
                            Yuklab olish
                            <svg className="w-[11px] h-[11px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-[40px] sm:p-[60px] text-center max-w-[520px] mx-auto">
                    <div className="w-[64px] h-[64px] bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-[16px]">
                      <svg className="w-[28px] h-[28px] text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </div>
                    <p className="text-[16px] sm:text-[18px] font-bold text-gray-700">Husnihat varaqasi</p>
                    <p className="text-[13px] sm:text-[14px] text-gray-400 mt-[6px]">Hali yuklanmagan. Tez orada qo&apos;shiladi!</p>
                  </div>
                )}

                {/* Lightbox Modal */}
                {lightboxImg && (
                  <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
                    <button className="absolute top-4 right-4 w-[40px] h-[40px] bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-[24px] transition-colors" onClick={() => setLightboxImg(null)}>✕</button>
                    <img
                      src={lightboxImg}
                      alt="Husnihat"
                      className="max-w-[90vw] max-h-[90vh] object-contain rounded-[12px] shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>
            )}

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
                  {renderMobileTrigger()}
                  {grammar.contentHtml ? (
                    <div className="bg-white rounded-[14px] border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden px-[20px] sm:px-[28px] md:px-[36px] py-[20px] sm:py-[24px]">
                      <div
                        className="word-content prose prose-sm sm:prose-base max-w-none"
                        dangerouslySetInnerHTML={{ __html: grammar.contentHtml }}
                      />
                    </div>
                  ) : (
                  grammar.rules.map((rule, rIdx) => (
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
                  ))
                  )}
                </div>
              );
            })()}

          </div>
        </div>
      </div>
    </div>
  );
}
