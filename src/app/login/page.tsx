"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const contacts = [
  {
    icon: "/assets/phone-icon.svg",
    label: "+998 90 000 00 00",
    href: "tel:+998900000000",
  },
  {
    icon: "/assets/telegram-icon.svg",
    label: "Telegram orqali bog\u2018lanish",
    href: "https://t.me/chinesewave_uz",
  },
  {
    icon: "/assets/telegram-icon.svg",
    label: "Telegram kanal",
    href: "https://t.me/chinesewave_uz",
  },
  {
    icon: "/assets/instagram-icon.svg",
    label: "Instagram sahifa",
    href: "https://instagram.com/chinesewave.uz",
  },
];

export default function LoginPage() {
  const [key, setKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!key.trim()) {
      setLoginError("Kalit kiritilmagan");
      return;
    }
    setLoginLoading(true);
    setLoginError("");
    try {
      // Device ID yaratish
      let deviceId = localStorage.getItem("device_id");
      if (!deviceId) {
        deviceId = "dev-" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem("device_id", deviceId);
      }

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim(), deviceId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Xatolik yuz berdi");
        setLoginLoading(false);
        return;
      }
      // Session saqlash
      localStorage.setItem("user_session", JSON.stringify(data.user));
      // Foydalanuvchining kursiga yo'naltirish
      const courseSlug = data.user.course || "hsk-1";
      router.push(`/courses/${courseSlug}/lessons`);
    } catch {
      setLoginError("Server bilan bog'lanishda xatolik");
      setLoginLoading(false);
    }
  };

  return (
    <main className="bg-primary min-h-screen lg:h-screen lg:overflow-hidden">
      <div className="lg:h-screen lg:flex lg:flex-col">

        {/* ===== MAIN CONTENT ===== */}
        <section className="max-w-[1920px] mx-auto w-full px-[16px] md:px-[60px] lg:px-[100px] xl:px-[132px] pt-[70px] pb-[20px] md:pt-[100px] md:pb-[30px] lg:pt-[56px] lg:pb-0 lg:flex-1 lg:flex lg:items-center">
          <div className="flex flex-col lg:flex-row gap-[16px] lg:gap-[50px] xl:gap-[70px] items-center lg:items-center w-full">

            {/* ===== LEFT: Title + Logo (Desktop) ===== */}
            <div className="hidden lg:flex flex-col items-start flex-1 max-w-[480px]">
              <h1 className="font-[family-name:var(--font-castoro-titling)] italic text-gold text-[28px] xl:text-[36px] leading-[1.15] mb-[16px] xl:mb-[24px] whitespace-nowrap">
                Kalit orqali login:
              </h1>
              <div className="w-[220px] xl:w-[280px] aspect-[626/543] relative">
                <Image
                  src="/assets/logo.png"
                  alt="Chinese Wave"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* ===== LEFT: Title + Logo (Mobile/Tablet) ===== */}
            <div className="lg:hidden flex flex-col items-center gap-[8px] w-full">
              <h1 className="font-[family-name:var(--font-castoro-titling)] italic text-gold text-[14px] md:text-[26px] leading-tight whitespace-nowrap">
                Kalit orqali login:
              </h1>
              <Image
                src="/assets/logo.png"
                alt="Chinese Wave"
                width={280}
                height={220}
                className="w-[160px] md:w-[200px] h-auto object-contain"
              />
            </div>

            {/* ===== RIGHT: Login Card ===== */}
            <div className="w-full max-w-[580px] xl:max-w-[620px] bg-white rounded-[16px] md:rounded-[20px] lg:rounded-[24px] p-[16px] md:p-[24px] lg:p-[22px] xl:p-[26px] shadow-2xl">

              {/* Qadamlar heading */}
              <h2 className="text-primary font-bold text-[20px] md:text-[30px] lg:text-[28px] text-center mb-[10px] md:mb-[14px] lg:mb-[8px]">
                Qadamlar
              </h2>

              {/* Steps */}
              <div className="space-y-[8px] md:space-y-[10px] lg:space-y-[6px] mb-[10px] md:mb-[14px] lg:mb-[8px]">
                <Step number={1} text="Telegram orqali biz bilan bog'lanib o'zingizga mos kurs uchun darsga yoziling." linkText="biz bilan bog'lanib" linkHref="https://t.me/Bobur_676" />
                <Step number={2} text="To'lov qiling va skreenshotni Telegram orqali jo'nating." />
                <Step number={3} text="Sizga kalit paroli beriladi, shu orqali websitega kirishingiz mumkin." highlight />
              </div>

              {/* Warning */}
              <div className="bg-gold-pale rounded-[10px] px-[12px] py-[7px] md:px-[16px] md:py-[10px] lg:px-[16px] lg:py-[6px] flex items-center gap-[8px] mb-[10px] md:mb-[14px] lg:mb-[8px]">
                <span className="text-[13px] md:text-[16px] flex-shrink-0">⚠️</span>
                <p className="text-[10px] md:text-[13px] lg:text-[14px]">
                  <span className="text-black font-semibold">Eslatma!</span>{" "}
                  <span className="text-[#555]">Kalit orqali faqat ikta device dan kirish mumkin</span>
                </p>
              </div>

              {/* Divider + "Kalit orqali kirish" */}
              <div className="flex items-center gap-[10px] mb-[10px] md:mb-[12px] lg:mb-[6px]">
                <div className="h-px bg-gray-300 flex-1" />
                <h3 className="text-primary font-bold text-[15px] md:text-[22px] lg:text-[24px] whitespace-nowrap">
                  Kalit orqali kirish
                </h3>
                <div className="h-px bg-gray-300 flex-1" />
              </div>

              {/* Input area */}
              <div className="bg-[#e8e8ec] rounded-[10px] p-[12px] md:p-[14px] lg:p-[12px] mb-[10px] md:mb-[12px] lg:mb-[8px]">
                <div className="flex items-center gap-[6px] mb-[5px]">
                  <svg width="15" height="11" viewBox="0 0 20 14" fill="none" className="text-gray-500 flex-shrink-0">
                    <path d="M7 7C7 5.34315 8.34315 4 10 4C11.6569 4 13 5.34315 13 7C13 8.65685 11.6569 10 10 10C8.34315 10 7 8.65685 7 7Z" fill="currentColor"/>
                    <path d="M1 7C1 7 4 1 10 1C16 1 19 7 19 7C19 7 16 13 10 13C4 13 1 7 1 7Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                  <span className="text-[#555] text-[10px] md:text-[14px] lg:text-[15px] font-medium">Kalit parolini kiriting:</span>
                </div>
                <div className="bg-white rounded-[6px] px-[10px] py-[6px] md:px-[12px] md:py-[8px] flex items-center border border-gray-200">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={key}
                    onChange={(e) => { setKey(e.target.value); setLoginError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
                    placeholder="•••••••••••••••••"
                    className="flex-1 text-[#444] text-[12px] md:text-[16px] lg:text-[17px] outline-none bg-transparent"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 ml-2 cursor-pointer hover:text-gray-600 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[14px] h-[14px] md:w-[18px] md:h-[18px]">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Error message */}
              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-[8px] px-[12px] py-[6px] mb-[8px] md:mb-[10px] lg:mb-[6px]">
                  <p className="text-red-600 text-[11px] md:text-[13px] font-semibold text-center">{loginError}</p>
                </div>
              )}

              {/* Login Button */}
              <div className="flex justify-center mb-[8px] md:mb-[10px] lg:mb-[6px]">
                <button
                  onClick={handleLogin}
                  disabled={loginLoading}
                  className={`bg-green hover:bg-green/90 text-white font-bold text-[14px] md:text-[22px] lg:text-[24px] px-[32px] py-[7px] md:px-[40px] md:py-[8px] lg:px-[44px] lg:py-[8px] rounded-full transition-colors cursor-pointer shadow-lg shadow-green/30 ${loginLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {loginLoading ? (
                    <span className="flex items-center gap-[8px]">
                      <span className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      KIRISH...
                    </span>
                  ) : (
                    "KIRISH"
                  )}
                </button>
              </div>

              {/* Telegram link */}
              <div className="bg-[#f4f4f7] rounded-[8px] px-[12px] py-[6px] md:px-[16px] md:py-[8px] text-center">
                <a href="https://t.me/Bobur_676" target="_blank" rel="noopener noreferrer" className="text-[#666] hover:text-primary text-[10px] md:text-[12px] lg:text-[13px] transition-colors">
                  Agar sizda kalit bo&apos;lmasa telegram orqali bog&apos;laning →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="max-w-[1920px] mx-auto w-full px-[16px] md:px-[60px] lg:px-[100px] xl:px-[132px] pt-[24px] pb-[16px] lg:pt-[14px] lg:pb-[10px]">
          <div className="flex flex-row items-end justify-between gap-[16px]">
            <div>
              <h3 className="text-gold font-bold text-[16px] md:text-[24px] lg:text-[24px] leading-[1.2] mb-[16px] md:mb-[20px] lg:mb-[14px] text-left">
                Bog&apos;lanish:
              </h3>
              <ul className="space-y-[16px] md:space-y-[18px] lg:space-y-[12px]">
                {contacts.map((c) => (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-[6px] md:gap-[10px] text-gold text-[11px] md:text-[15px] lg:text-[16px] font-normal leading-[1.4] hover:text-gold-light transition-colors"
                    >
                      <Image src={c.icon} alt="" width={24} height={24} className="w-[14px] h-[14px] md:w-[18px] md:h-[18px] lg:w-[20px] lg:h-[20px]" />
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-shrink-0">
              <Image src="/assets/logo.png" alt="Chinese Wave" width={400} height={320} className="w-[110px] md:w-[180px] lg:w-[200px] h-auto object-contain" />
            </div>
          </div>
          <div className="mt-[12px] lg:mt-[8px] border-t border-gold/30"></div>
        </footer>
      </div>
    </main>
  );
}

function Step({
  number,
  text,
  highlight = false,
  linkText,
  linkHref,
}: {
  number: number;
  text: string;
  highlight?: boolean;
  linkText?: string;
  linkHref?: string;
}) {
  const renderText = () => {
    if (text.includes("kalit paroli")) {
      return (
        <>
          Sizga <span className="text-black font-semibold">kalit paroli</span> beriladi, shu orqali
          websitega kirishingiz mumkin.
        </>
      );
    }
    if (linkText && linkHref && text.includes(linkText)) {
      const parts = text.split(linkText);
      return (
        <>
          {parts[0]}
          <a href={linkHref} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline hover:text-primary/80 transition-colors">
            {linkText}
          </a>
          {parts[1]}
        </>
      );
    }
    return text;
  };

  return (
    <div className="flex items-start gap-[8px] md:gap-[10px]">
      <div
        className={`w-[26px] h-[26px] md:w-[36px] md:h-[36px] lg:w-[34px] lg:h-[34px] rounded-full flex items-center justify-center flex-shrink-0 ${
          highlight ? "bg-gold" : "bg-gold/25"
        }`}
      >
        <span className={`font-bold text-[11px] md:text-[16px] lg:text-[15px] ${highlight ? "text-primary" : "text-primary/70"}`}>{number}</span>
      </div>
      <p className="text-[#444] text-[10px] md:text-[14px] lg:text-[14px] leading-[1.55] pt-[3px] md:pt-[6px] lg:pt-[5px]">
        {renderText()}
      </p>
    </div>
  );
}
