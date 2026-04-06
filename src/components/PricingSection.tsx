"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export default function PricingSection() {
  const [activeCard, setActiveCard] = useState(1); // Start with OMMABOP (middle card)
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const nextCard = useCallback(() => {
    setActiveCard((prev) => (prev + 1) % 3);
  }, []);

  const prevCard = useCallback(() => {
    setActiveCard((prev) => (prev - 1 + 3) % 3);
  }, []);

  // Auto-play: rotate every 4 seconds
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      nextCard();
    }, 4000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [nextCard]);

  // Reset auto-play timer on manual interaction
  const handleManualNav = (direction: "next" | "prev") => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (direction === "next") nextCard();
    else prevCard();
    autoPlayRef.current = setInterval(() => {
      nextCard();
    }, 4000);
  };

  // Swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      handleManualNav(diff > 0 ? "next" : "prev");
    }
  };

  return (
    <section id="pricing" className="bg-primary pt-[30px] md:pt-[80px] lg:pt-[100px]">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[60px] lg:px-[156px]">
        {/* Title */}
        <h2 className="font-[family-name:var(--font-castoro-titling)] text-gold text-[26px] md:text-[50px] lg:text-[70px] leading-[1.15] text-center mb-[16px] md:mb-[40px] lg:mb-[50px] italic">
          Narxlar
        </h2>

        {/* Cards wrapper with dark bg */}
        <div className="bg-card-bg rounded-[16px] md:rounded-[30px] lg:rounded-[40px] px-[12px] md:px-[30px] lg:px-[40px] py-[16px] md:py-[36px] lg:py-[50px]">

          {/* Mobile Carousel */}
          <div
            className="md:hidden relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Left Arrow */}
            <button
              onClick={() => handleManualNav("prev")}
              className="absolute left-[-8px] top-1/2 -translate-y-1/2 z-10 text-white text-[28px] font-bold w-[32px] h-[48px] flex items-center justify-center cursor-pointer"
              aria-label="Previous card"
            >
              ‹
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => handleManualNav("next")}
              className="absolute right-[-8px] top-1/2 -translate-y-1/2 z-10 text-white text-[28px] font-bold w-[32px] h-[48px] flex items-center justify-center cursor-pointer"
              aria-label="Next card"
            >
              ›
            </button>

            {/* Cards container */}
            <div className="overflow-hidden px-[20px]">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${activeCard * 100}%)` }}
              >
                {/* MINIMAL Card - Mobile */}
                <div className="w-full flex-shrink-0 px-[4px]">
                  <div className={`bg-white rounded-[14px] px-[14px] py-[18px] w-full flex flex-col ${activeCard === 0 ? "" : ""}`}>
                    <h3 className="font-[family-name:var(--font-castoro-titling)] text-primary text-[18px] leading-[1.2] text-center uppercase mb-[10px]">
                      Saytdan foydalanish
                    </h3>
                    <div className="flex justify-center mb-[14px]">
                      <span className="bg-primary text-white text-[10px] font-bold tracking-[0.15em] uppercase px-[16px] py-[4px] rounded-full">
                        MINIMAL
                      </span>
                    </div>
                    <p className="text-primary font-bold text-[32px] leading-[1.1] text-center mb-[20px]">
                      200.000
                    </p>
                    <div className="mb-[12px]">
                      <div className="flex items-center gap-[6px] mb-[4px]">
                        <span className="w-[18px] h-[18px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                        <h4 className="text-primary font-bold text-[13px]">Dars kontenti</h4>
                      </div>
                      <ul className="text-primary text-[11px] leading-[1.7] pl-[26px] space-y-[1px]">
                        <li>• Grammatik tushuntirishlar</li>
                        <li>• So&apos;zlar ro&apos;yxati + tarjima</li>
                        <li>• So&apos;zlar amaliyoti</li>
                        <li>• Iyeroglif yozish tartibi (stroke order)</li>
                        <li>• Audio fayllar (tinglab tushunish uchun)</li>
                        <li>• Dialoglar va ularning tasnifi</li>
                        <li>• Har bir dars uchun mashqlar</li>
                      </ul>
                    </div>
                    <div className="mb-[12px]">
                      <div className="flex items-center gap-[6px] mb-[4px]">
                        <span className="w-[18px] h-[18px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                        <h4 className="text-primary font-bold text-[13px]">Amaliyot</h4>
                      </div>
                      <ul className="text-primary text-[11px] leading-[1.7] pl-[26px] space-y-[1px]">
                        <li>• Vazifalar (har mavzudan keyin)</li>
                        <li>• Modul yakuniy imtihon</li>
                        <li>• Daraja aniqlash testi</li>
                        <li>• So&apos;z yodlash mini-trenajyor</li>
                      </ul>
                    </div>
                    <div className="mb-[16px]">
                      <div className="flex items-center gap-[6px] mb-[4px]">
                        <span className="w-[18px] h-[18px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                        <h4 className="text-primary font-bold text-[13px]">Imkoniyatlar</h4>
                      </div>
                      <ul className="text-primary text-[11px] leading-[1.7] pl-[26px] space-y-[1px]">
                        <li>• 24/7 kirish</li>
                        <li>• Telefon + kompyuterdan foydalanish</li>
                        <li>• Shaxsiy kabinet</li>
                        <li>• O&apos;qish progressini ko&apos;rish</li>
                      </ul>
                    </div>
                    <div className="mt-auto pt-[12px] flex justify-center">
                      <a href="https://t.me/chinesewave_2026" target="_blank" rel="noopener noreferrer" className="bg-primary text-white font-semibold text-[12px] px-[20px] py-[9px] rounded-full hover:bg-primary-light transition-colors cursor-pointer inline-block text-center">
                        Kursga yozilish
                      </a>
                    </div>
                  </div>
                </div>

                {/* OMMABOP Card - Mobile */}
                <div className="w-full flex-shrink-0 px-[4px]">
                  <div className="bg-white rounded-[14px] px-[14px] py-[18px] w-full flex flex-col border-[3px] border-gold shadow-xl">
                    <h3 className="font-[family-name:var(--font-castoro-titling)] text-primary text-[20px] leading-[1.2] text-center mb-[10px]">
                      Guruh darslar
                    </h3>
                    <div className="flex justify-center mb-[14px]">
                      <span className="bg-gold text-primary text-[10px] font-bold tracking-[0.15em] uppercase px-[16px] py-[4px] rounded-full">
                        OMMABOP
                      </span>
                    </div>
                    <p className="text-primary font-bold text-[36px] leading-[1.1] text-center mb-[20px]">
                      700.000
                    </p>
                    <div className="mb-[12px]">
                      <div className="flex items-center gap-[6px] mb-[4px]">
                        <span className="w-[18px] h-[18px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                        <h4 className="text-primary font-bold text-[13px]">Jonli darslar</h4>
                      </div>
                      <ul className="text-primary text-[11px] leading-[1.7] pl-[26px] space-y-[1px]">
                        <li>• Haftasiga 3 marta Zoom dars</li>
                        <li>• Jonli dialog mashqlari</li>
                        <li>• Savol-javob sessiyalari</li>
                        <li>• Talaffuz ustida ishlash</li>
                      </ul>
                    </div>
                    <div className="mb-[12px]">
                      <div className="flex items-center gap-[6px] mb-[4px]">
                        <span className="w-[18px] h-[18px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                        <h4 className="text-primary font-bold text-[13px]">Nazorat</h4>
                      </div>
                      <ul className="text-primary text-[11px] leading-[1.7] pl-[26px] space-y-[1px]">
                        <li>• Uy vazifa tekshiruvi</li>
                        <li>• Oylik mini test</li>
                        <li>• O&apos;qituvchi feedback</li>
                        <li>• O&apos;quvchi reyting tizimi</li>
                      </ul>
                    </div>
                    <div className="mb-[12px]">
                      <div className="flex items-center gap-[6px] mb-[4px]">
                        <span className="w-[18px] h-[18px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                        <h4 className="text-primary font-bold text-[13px]">Amaliy muhit</h4>
                      </div>
                      <ul className="text-primary text-[11px] leading-[1.7] pl-[26px] space-y-[1px]">
                        <li>• Guruhda speaking practice</li>
                        <li>• Telegram chat guruh</li>
                        <li>• Darsni qayta ko&apos;rish imkoniyati</li>
                        <li>• Qo&apos;shimcha materiallar</li>
                      </ul>
                    </div>
                    <div className="mb-[16px]">
                      <div className="flex items-center gap-[6px] mb-[4px]">
                        <span className="w-[18px] h-[18px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                        <h4 className="text-primary font-bold text-[13px]">Qo&apos;shimcha</h4>
                      </div>
                      <ul className="text-primary text-[11px] leading-[1.7] pl-[26px] space-y-[1px]">
                        <li>• HSK imtihoniga yo&apos;naltirish</li>
                        <li>• Motivatsion nazorat</li>
                      </ul>
                    </div>
                    <div className="mt-auto pt-[12px] flex justify-center">
                      <a href="https://t.me/chinesewave_2026" target="_blank" rel="noopener noreferrer" className="bg-primary text-white font-semibold text-[13px] px-[24px] py-[10px] rounded-full hover:bg-primary-light transition-colors cursor-pointer inline-block text-center">
                        Kursga yozilish
                      </a>
                    </div>
                  </div>
                </div>

                {/* PREMIUM Card - Mobile */}
                <div className="w-full flex-shrink-0 px-[4px]">
                  <div className="bg-white rounded-[14px] px-[14px] py-[18px] w-full flex flex-col">
                    <h3 className="font-[family-name:var(--font-castoro-titling)] text-primary text-[18px] leading-[1.2] text-center uppercase mb-[10px]">
                      Individual
                    </h3>
                    <div className="flex justify-center mb-[14px]">
                      <span className="bg-primary text-white text-[10px] font-bold tracking-[0.15em] uppercase px-[16px] py-[4px] rounded-full">
                        PREMIUM
                      </span>
                    </div>
                    <p className="text-primary font-bold text-[32px] leading-[1.1] text-center mb-[20px]">
                      1.300.000
                    </p>
                    <div className="mb-[12px]">
                      <div className="flex items-center gap-[6px] mb-[4px]">
                        <span className="w-[18px] h-[18px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                        <h4 className="text-primary font-bold text-[13px]">1:1 ustoz bilan</h4>
                      </div>
                      <ul className="text-primary text-[11px] leading-[1.7] pl-[26px] space-y-[1px]">
                        <li>• Shaxsiy o&apos;quv reja</li>
                        <li>• Moslashuvchan jadval</li>
                        <li>• Tezlashtirilgan o&apos;quv tizimi</li>
                        <li>• Zaif joylar ustida ishlash</li>
                      </ul>
                    </div>
                    <div className="mb-[12px]">
                      <div className="flex items-center gap-[6px] mb-[4px]">
                        <span className="w-[18px] h-[18px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                        <h4 className="text-primary font-bold text-[13px]">Maxsus tayyorlov</h4>
                      </div>
                      <ul className="text-primary text-[11px] leading-[1.7] pl-[26px] space-y-[1px]">
                        <li>• HSK 3.0 imtihon tayyorlov</li>
                        <li>• Xitoyda o&apos;qish uchun tayyorlov</li>
                        <li>• Ish uchun biznes xitoy tili</li>
                      </ul>
                    </div>
                    <div className="mb-[12px]">
                      <div className="flex items-center gap-[6px] mb-[4px]">
                        <span className="w-[18px] h-[18px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                        <h4 className="text-primary font-bold text-[13px]">To&apos;liq monitoring</h4>
                      </div>
                      <ul className="text-primary text-[11px] leading-[1.7] pl-[26px] space-y-[1px]">
                        <li>• Har hafta progress hisobot</li>
                        <li>• Shaxsiy lug&apos;at monitoring</li>
                        <li>• Individual speaking practice</li>
                        <li>• Individual yozma ish tekshiruvi</li>
                      </ul>
                    </div>
                    <div className="mb-[16px]">
                      <div className="flex items-center gap-[6px] mb-[4px]">
                        <span className="w-[18px] h-[18px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                        <h4 className="text-primary font-bold text-[13px]">Premium bonus</h4>
                      </div>
                      <ul className="text-primary text-[11px] leading-[1.7] pl-[26px] space-y-[1px]">
                        <li>• 24/7 savol berish imkoniyati</li>
                        <li>• Qo&apos;shimcha materiallar</li>
                        <li>• Intensiv gapirish mashg&apos;ulotlari</li>
                      </ul>
                    </div>
                    <div className="mt-auto pt-[12px] flex justify-center">
                      <a href="https://t.me/chinesewave_2026" target="_blank" rel="noopener noreferrer" className="bg-primary text-white font-semibold text-[12px] px-[20px] py-[9px] rounded-full hover:bg-primary-light transition-colors cursor-pointer inline-block text-center">
                        Kursga yozilish
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-[8px] mt-[14px]">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
                    setActiveCard(i);
                    autoPlayRef.current = setInterval(() => { nextCard(); }, 4000);
                  }}
                  className={`w-[8px] h-[8px] rounded-full transition-colors cursor-pointer ${
                    activeCard === i ? "bg-gold" : "bg-white/30"
                  }`}
                  aria-label={`Go to card ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop layout (unchanged) */}
          <div className="hidden md:flex flex-col lg:flex-row gap-[20px] lg:gap-[24px] justify-center lg:items-start items-center">

            {/* MINIMAL Card */}
            <div className="bg-white rounded-[20px] px-[24px] py-[28px] w-full lg:flex-1 flex flex-col">
              <h3 className="font-[family-name:var(--font-castoro-titling)] text-primary text-[18px] md:text-[22px] lg:text-[24px] leading-[1.2] text-center uppercase mb-[10px] md:mb-[14px]">
                Saytdan foydalanish
              </h3>
              <div className="flex justify-center mb-[14px] md:mb-[18px]">
                <span className="bg-primary text-white text-[10px] md:text-[12px] font-bold tracking-[0.15em] uppercase px-[16px] py-[4px] md:px-[18px] md:py-[5px] rounded-full">
                  MINIMAL
                </span>
              </div>
              <p className="text-primary font-bold text-[32px] md:text-[40px] lg:text-[44px] leading-[1.1] text-center mb-[20px] md:mb-[26px]">
                200.000
              </p>

              {/* Dars kontenti */}
              <div className="mb-[12px]">
                <div className="flex items-center gap-[6px] mb-[4px]">
                  <span className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  <h4 className="text-primary font-bold text-[13px] md:text-[15px] lg:text-[16px]">Dars kontenti</h4>
                </div>
                <ul className="text-primary text-[11px] md:text-[12px] lg:text-[13px] leading-[1.7] pl-[26px] space-y-[1px]">
                  <li>• Grammatik tushuntirishlar</li>
                  <li>• So&apos;zlar ro&apos;yxati + tarjima</li>
                  <li>• So&apos;zlar amaliyoti</li>
                  <li>• Iyeroglif yozish tartibi (stroke order)</li>
                  <li>• Audio fayllar (tinglab tushunish uchun)</li>
                  <li>• Dialoglar va ularning tasnifi</li>
                  <li>• Har bir dars uchun mashqlar</li>
                </ul>
              </div>

              {/* Amaliyot */}
              <div className="mb-[12px]">
                <div className="flex items-center gap-[6px] mb-[4px]">
                  <span className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  <h4 className="text-primary font-bold text-[13px] md:text-[15px] lg:text-[16px]">Amaliyot</h4>
                </div>
                <ul className="text-primary text-[11px] md:text-[12px] lg:text-[13px] leading-[1.7] pl-[26px] space-y-[1px]">
                  <li>• Vazifalar (har mavzudan keyin)</li>
                  <li>• Modul yakuniy imtihon</li>
                  <li>• Daraja aniqlash testi</li>
                  <li>• So&apos;z yodlash mini-trenajyor</li>
                </ul>
              </div>

              {/* Imkoniyatlar */}
              <div className="mb-[16px]">
                <div className="flex items-center gap-[6px] mb-[4px]">
                  <span className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  <h4 className="text-primary font-bold text-[13px] md:text-[15px] lg:text-[16px]">Imkoniyatlar</h4>
                </div>
                <ul className="text-primary text-[11px] md:text-[12px] lg:text-[13px] leading-[1.7] pl-[26px] space-y-[1px]">
                  <li>• 24/7 kirish</li>
                  <li>• Telefon + kompyuterdan foydalanish</li>
                  <li>• Shaxsiy kabinet</li>
                  <li>• O&apos;qish progressini ko&apos;rish</li>
                </ul>
              </div>

              <div className="mt-auto pt-[12px] md:pt-[16px] flex justify-center">
                <a href="https://t.me/chinesewave_2026" target="_blank" rel="noopener noreferrer" className="bg-primary text-white font-semibold text-[12px] md:text-[14px] px-[20px] md:px-[24px] py-[9px] md:py-[11px] rounded-full hover:bg-primary-light transition-colors cursor-pointer inline-block text-center">
                  Kursga yozilish
                </a>
              </div>
            </div>

            {/* OMMABOP Card (Center - highlighted, taller) */}
            <div className="bg-white rounded-[14px] md:rounded-[20px] px-[14px] md:px-[28px] py-[18px] md:py-[32px] w-full lg:flex-1 flex flex-col border-[3px] border-gold shadow-xl lg:-mt-[20px] lg:mb-[-20px]">
              <h3 className="font-[family-name:var(--font-castoro-titling)] text-primary text-[20px] md:text-[26px] lg:text-[28px] leading-[1.2] text-center mb-[10px] md:mb-[14px]">
                Guruh darslar
              </h3>
              <div className="flex justify-center mb-[14px] md:mb-[18px]">
                <span className="bg-gold text-primary text-[10px] md:text-[13px] font-bold tracking-[0.15em] uppercase px-[16px] py-[4px] md:px-[20px] md:py-[6px] rounded-full">
                  OMMABOP
                </span>
              </div>
              <p className="text-primary font-bold text-[36px] md:text-[46px] lg:text-[52px] leading-[1.1] text-center mb-[20px] md:mb-[28px]">
                700.000
              </p>

              {/* Jonli darslar */}
              <div className="mb-[12px]">
                <div className="flex items-center gap-[6px] mb-[4px]">
                  <span className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  <h4 className="text-primary font-bold text-[13px] md:text-[15px] lg:text-[17px]">Jonli darslar</h4>
                </div>
                <ul className="text-primary text-[11px] md:text-[12px] lg:text-[14px] leading-[1.7] pl-[26px] space-y-[1px]">
                  <li>• Haftasiga 3 marta Zoom dars</li>
                  <li>• Jonli dialog mashqlari</li>
                  <li>• Savol-javob sessiyalari</li>
                  <li>• Talaffuz ustida ishlash</li>
                </ul>
              </div>

              {/* Nazorat */}
              <div className="mb-[12px]">
                <div className="flex items-center gap-[6px] mb-[4px]">
                  <span className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  <h4 className="text-primary font-bold text-[13px] md:text-[15px] lg:text-[17px]">Nazorat</h4>
                </div>
                <ul className="text-primary text-[11px] md:text-[12px] lg:text-[14px] leading-[1.7] pl-[26px] space-y-[1px]">
                  <li>• Uy vazifa tekshiruvi</li>
                  <li>• Oylik mini test</li>
                  <li>• O&apos;qituvchi feedback</li>
                  <li>• O&apos;quvchi reyting tizimi</li>
                </ul>
              </div>

              {/* Amaliy muhit */}
              <div className="mb-[12px]">
                <div className="flex items-center gap-[6px] mb-[4px]">
                  <span className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  <h4 className="text-primary font-bold text-[13px] md:text-[15px] lg:text-[17px]">Amaliy muhit</h4>
                </div>
                <ul className="text-primary text-[11px] md:text-[12px] lg:text-[14px] leading-[1.7] pl-[26px] space-y-[1px]">
                  <li>• Guruhda speaking practice</li>
                  <li>• Telegram chat guruh</li>
                  <li>• Darsni qayta ko&apos;rish imkoniyati</li>
                  <li>• Qo&apos;shimcha materiallar</li>
                </ul>
              </div>

              {/* Qo'shimcha */}
              <div className="mb-[16px]">
                <div className="flex items-center gap-[6px] mb-[4px]">
                  <span className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  <h4 className="text-primary font-bold text-[13px] md:text-[15px] lg:text-[17px]">Qo&apos;shimcha</h4>
                </div>
                <ul className="text-primary text-[11px] md:text-[12px] lg:text-[14px] leading-[1.7] pl-[26px] space-y-[1px]">
                  <li>• HSK imtihoniga yo&apos;naltirish</li>
                  <li>• Motivatsion nazorat</li>
                </ul>
              </div>

              <div className="mt-auto pt-[12px] md:pt-[16px] flex justify-center">
                <a href="https://t.me/chinesewave_2026" target="_blank" rel="noopener noreferrer" className="bg-primary text-white font-semibold text-[13px] md:text-[16px] px-[24px] md:px-[32px] py-[10px] md:py-[13px] rounded-full hover:bg-primary-light transition-colors cursor-pointer inline-block text-center">
                  Kursga yozilish
                </a>
              </div>
            </div>

            {/* PREMIUM Card */}
            <div className="bg-white rounded-[14px] md:rounded-[20px] px-[14px] md:px-[24px] py-[18px] md:py-[28px] w-full lg:flex-1 flex flex-col">
              <h3 className="font-[family-name:var(--font-castoro-titling)] text-primary text-[18px] md:text-[22px] lg:text-[24px] leading-[1.2] text-center uppercase mb-[10px] md:mb-[14px]">
                Individual
              </h3>
              <div className="flex justify-center mb-[14px] md:mb-[18px]">
                <span className="bg-primary text-white text-[10px] md:text-[12px] font-bold tracking-[0.15em] uppercase px-[16px] py-[4px] md:px-[18px] md:py-[5px] rounded-full">
                  PREMIUM
                </span>
              </div>
              <p className="text-primary font-bold text-[32px] md:text-[40px] lg:text-[44px] leading-[1.1] text-center mb-[20px] md:mb-[26px]">
                1.300.000
              </p>

              {/* 1:1 ustoz bilan */}
              <div className="mb-[12px]">
                <div className="flex items-center gap-[6px] mb-[4px]">
                  <span className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  <h4 className="text-primary font-bold text-[13px] md:text-[15px] lg:text-[16px]">1:1 ustoz bilan</h4>
                </div>
                <ul className="text-primary text-[11px] md:text-[12px] lg:text-[13px] leading-[1.7] pl-[26px] space-y-[1px]">
                  <li>• Shaxsiy o&apos;quv reja</li>
                  <li>• Moslashuvchan jadval</li>
                  <li>• Tezlashtirilgan o&apos;quv tizimi</li>
                  <li>• Zaif joylar ustida ishlash</li>
                </ul>
              </div>

              {/* Maxsus tayyorlov */}
              <div className="mb-[12px]">
                <div className="flex items-center gap-[6px] mb-[4px]">
                  <span className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  <h4 className="text-primary font-bold text-[13px] md:text-[15px] lg:text-[16px]">Maxsus tayyorlov</h4>
                </div>
                <ul className="text-primary text-[11px] md:text-[12px] lg:text-[13px] leading-[1.7] pl-[26px] space-y-[1px]">
                  <li>• HSK 3.0 imtihon tayyorlov</li>
                  <li>• Xitoyda o&apos;qish uchun tayyorlov</li>
                  <li>• Ish uchun biznes xitoy tili</li>
                </ul>
              </div>

              {/* To'liq monitoring */}
              <div className="mb-[12px]">
                <div className="flex items-center gap-[6px] mb-[4px]">
                  <span className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  <h4 className="text-primary font-bold text-[13px] md:text-[15px] lg:text-[16px]">To&apos;liq monitoring</h4>
                </div>
                <ul className="text-primary text-[11px] md:text-[12px] lg:text-[13px] leading-[1.7] pl-[26px] space-y-[1px]">
                  <li>• Har hafta progress hisobot</li>
                  <li>• Shaxsiy lug&apos;at monitoring</li>
                  <li>• Individual speaking practice</li>
                  <li>• Individual yozma ish tekshiruvi</li>
                </ul>
              </div>

              {/* Premium bonus */}
              <div className="mb-[16px]">
                <div className="flex items-center gap-[6px] mb-[4px]">
                  <span className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] rounded-full bg-green flex items-center justify-center flex-shrink-0"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  <h4 className="text-primary font-bold text-[13px] md:text-[15px] lg:text-[16px]">Premium bonus</h4>
                </div>
                <ul className="text-primary text-[11px] md:text-[12px] lg:text-[13px] leading-[1.7] pl-[26px] space-y-[1px]">
                  <li>• 24/7 savol berish imkoniyati</li>
                  <li>• Qo&apos;shimcha materiallar</li>
                  <li>• Intensiv gapirish mashg&apos;ulotlari</li>
                </ul>
              </div>

              <div className="mt-auto pt-[12px] md:pt-[16px] flex justify-center">
                <a href="https://t.me/chinesewave_2026" target="_blank" rel="noopener noreferrer" className="bg-primary text-white font-semibold text-[12px] md:text-[14px] px-[20px] md:px-[24px] py-[9px] md:py-[11px] rounded-full hover:bg-primary-light transition-colors cursor-pointer inline-block text-center">
                  Kursga yozilish
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
