"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  code: number;
  city: string;
}

export default function LessonsClient() {
  const [uzbTime, setUzbTime] = useState("");
  const [chinaTime, setChinaTime] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Internetdan aniq vaqt olish va har sekundda yangilash
  useEffect(() => {
    // Offset: kompyuter soati va haqiqiy vaqt orasidagi farq (ms)
    let offsetMs = 0;
    let synced = false;

    // Bir nechta API dan vaqt olishga harakat qilamiz
    async function syncTime() {
      try {
        // 1-urinish: WorldTimeAPI — Toshkent
        const before = Date.now();
        const res = await fetch("https://worldtimeapi.org/api/timezone/Asia/Tashkent");
        const after = Date.now();
        const data = await res.json();
        // API javob vaqtining yarmini hisobga olamiz (network latency)
        const networkDelay = (after - before) / 2;
        // datetime: "2026-03-26T22:03:15.123456+05:00"
        const serverTime = new Date(data.datetime).getTime() + networkDelay;
        offsetMs = serverTime - Date.now();
        synced = true;
      } catch {
        try {
          // 2-urinish: TimeAPI.io
          const before2 = Date.now();
          const res2 = await fetch("https://timeapi.io/api/time/current/zone?timeZone=Asia/Tashkent");
          const after2 = Date.now();
          const data2 = await res2.json();
          const networkDelay2 = (after2 - before2) / 2;
          // {year, month, day, hour, minute, seconds, milliSeconds}
          const isoStr = `${data2.year}-${String(data2.month).padStart(2,"0")}-${String(data2.day).padStart(2,"0")}T${String(data2.hour).padStart(2,"0")}:${String(data2.minute).padStart(2,"0")}:${String(data2.seconds).padStart(2,"0")}+05:00`;
          const serverTime2 = new Date(isoStr).getTime() + networkDelay2;
          offsetMs = serverTime2 - Date.now();
          synced = true;
        } catch {
          // Agar hech qaysi API ishlamasa, offset 0 bo'lib qoladi (lokal vaqt ishlatiladi)
          offsetMs = 0;
          synced = false;
        }
      }
    }

    function formatTime(date: Date, tz: string): string {
      const f = new Intl.DateTimeFormat("en-GB", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      return f.format(date);
    }

    function updateClocks() {
      // Haqiqiy vaqt = kompyuter vaqti + offset (API dan olingan farq)
      const realNow = new Date(Date.now() + offsetMs);
      setUzbTime(formatTime(realNow, "Asia/Tashkent"));
      setChinaTime(formatTime(realNow, "Asia/Shanghai"));
    }

    // Dastlab sinxronlash, keyin har sekundda yangilash
    syncTime().then(() => {
      updateClocks();
    });
    updateClocks(); // API javobini kutmasdan darhol ko'rsatish

    const interval = setInterval(updateClocks, 1000);

    // Har 5 daqiqada qayta sinxronlash
    const resyncInterval = setInterval(() => {
      syncTime();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearInterval(resyncInterval);
    };
  }, []);

  // Get weather based on geolocation
  useEffect(() => {
    async function fetchWeather(lat: number, lon: number) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
        );
        const data = await res.json();
        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;

        let city = "Sizning hududingiz";
        if (lat > 40.5 && lat < 42 && lon > 69 && lon < 70) city = "Toshkent";
        else if (lat > 39 && lat < 40 && lon > 66 && lon < 67.5) city = "Samarqand";
        else if (lat > 40.7 && lat < 41.5 && lon > 71 && lon < 72) city = "Namangan";
        else if (lat > 40.5 && lat < 41 && lon > 70.5 && lon < 71.5) city = "Andijon";

        setWeather({
          temp,
          description: getWeatherDescription(code),
          icon: getWeatherIcon(code),
          code,
          city,
        });
      } catch {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=41.2995&longitude=69.2401&current=temperature_2m,weather_code&timezone=Asia/Tashkent`
          );
          const data = await res.json();
          const wCode = data.current.weather_code;
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            description: getWeatherDescription(wCode),
            icon: getWeatherIcon(wCode),
            code: wCode,
            city: "Toshkent",
          });
        } catch {
          setWeather({ temp: 18, description: "Ma'lumot yo'q", icon: "🌤", code: 0, city: "—" });
        }
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(41.2995, 69.2401)
      );
    } else {
      fetchWeather(41.2995, 69.2401);
    }
  }, []);

  return (
    <div className="w-full bg-[#1a1a2e] border-b border-[#2a2a45] shadow-[0_2px_12px_rgba(0,0,0,0.15)] sticky top-0 z-50">
      <div className="w-full px-[12px] sm:px-[16px] md:px-[24px] lg:px-[32px] py-[8px] md:py-[10px]">
        <div className="flex items-center justify-between">

          {/* ── LEFT: Logo + Name ── */}
          <a href="/" title="Bosh sahifa" className="flex items-center gap-[8px] sm:gap-[10px] flex-shrink-0 group">
            <Image
              src="/assets/logo.png"
              alt="Chinese Wave"
              width={38}
              height={38}
              className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] md:w-[40px] md:h-[40px] rounded-[8px] group-hover:scale-105 transition-transform duration-200"
            />
            <div className="flex flex-col">
              <span className="text-[13px] sm:text-[15px] md:text-[17px] font-bold text-white leading-tight tracking-[-0.01em]">
                Chinese Wave
              </span>
              <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-400 leading-tight font-medium">
                Xitoy tili o&apos;quv platformasi
              </span>
            </div>
          </a>

          {/* ── RIGHT: Clocks + Weather ── */}
          <div className="flex items-center gap-[12px] sm:gap-[16px] md:gap-[24px]">

            {/* UZB Clock */}
            <div className="flex items-center gap-[5px] sm:gap-[8px]">
              <div className="w-[22px] h-[16px] sm:w-[28px] sm:h-[20px] md:w-[32px] md:h-[22px] rounded-[2px] sm:rounded-[3px] overflow-hidden flex-shrink-0 shadow-sm border border-white/20">
                <svg viewBox="0 0 32 22" className="w-full h-full">
                  <rect width="32" height="7.33" fill="#0099B5" />
                  <rect y="7.33" width="32" height="0.8" fill="#CE1126" />
                  <rect y="8.13" width="32" height="7.34" fill="#fff" />
                  <rect y="15.47" width="32" height="0.8" fill="#CE1126" />
                  <rect y="16.27" width="32" height="5.73" fill="#1EB53A" />
                  <circle cx="7" cy="3.67" r="2" fill="#fff" />
                  <circle cx="8" cy="3.67" r="1.6" fill="#0099B5" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] sm:text-[14px] md:text-[17px] font-mono font-bold text-white tabular-nums leading-tight">
                  {uzbTime || "--:--:--"}
                </span>
                <span className="text-[7px] sm:text-[8px] md:text-[9px] text-gray-400 font-medium leading-tight hidden sm:block">Toshkent</span>
              </div>
            </div>

            {/* China Clock */}
            <div className="flex items-center gap-[5px] sm:gap-[8px]">
              <div className="w-[22px] h-[16px] sm:w-[28px] sm:h-[20px] md:w-[32px] md:h-[22px] rounded-[2px] sm:rounded-[3px] overflow-hidden flex-shrink-0 shadow-sm border border-white/20">
                <svg viewBox="0 0 32 22" className="w-full h-full">
                  <rect width="32" height="22" fill="#DE2910" />
                  <polygon points="5,2 5.9,4.7 8.7,4.7 6.4,6.4 7.2,9 5,7.3 2.8,9 3.6,6.4 1.3,4.7 4.1,4.7" fill="#FFDE00" />
                  <polygon points="11,1 11.4,2 12.5,2 11.6,2.6 11.9,3.6 11,3 10.1,3.6 10.4,2.6 9.5,2 10.6,2" fill="#FFDE00" />
                  <polygon points="13,3 13.4,4 14.5,4 13.6,4.6 13.9,5.6 13,5 12.1,5.6 12.4,4.6 11.5,4 12.6,4" fill="#FFDE00" />
                  <polygon points="13,6 13.4,7 14.5,7 13.6,7.6 13.9,8.6 13,8 12.1,8.6 12.4,7.6 11.5,7 12.6,7" fill="#FFDE00" />
                  <polygon points="11,8 11.4,9 12.5,9 11.6,9.6 11.9,10.6 11,10 10.1,10.6 10.4,9.6 9.5,9 10.6,9" fill="#FFDE00" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] sm:text-[14px] md:text-[17px] font-mono font-bold text-red-400 tabular-nums leading-tight">
                  {chinaTime || "--:--:--"}
                </span>
                <span className="text-[7px] sm:text-[8px] md:text-[9px] text-gray-400 font-medium leading-tight hidden sm:block">Pekin</span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-[1px] h-[28px] bg-white/20 hidden sm:block" />

            {/* Weather */}
            <div className="flex items-center gap-[6px] sm:gap-[8px]">
              {weather ? (
                <>
                  <div className="flex flex-col items-end">
                    <span className="text-[13px] sm:text-[15px] md:text-[18px] font-bold text-white leading-tight">
                      {weather.temp}°C
                    </span>
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-400 leading-tight hidden sm:block">
                      {weather.city} · {weather.description}
                    </span>
                  </div>
                  <div className="w-[30px] h-[30px] sm:w-[36px] sm:h-[36px] md:w-[42px] md:h-[42px] flex-shrink-0">
                    <WeatherSVGIcon code={weather.code} />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-[6px] text-[11px] text-gray-400">
                  <div className="w-[14px] h-[14px] border-2 border-gray-600 border-t-orange-400 rounded-full animate-spin" />
                  <span className="hidden sm:inline">Ob-havo...</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function getWeatherDescription(code: number): string {
  if (code === 0) return "Ochiq havo";
  if (code <= 3) return "Qisman bulutli";
  if (code <= 49) return "Tumanli";
  if (code <= 59) return "Mayda yomg'ir";
  if (code <= 69) return "Yomg'ir";
  if (code <= 79) return "Qor";
  if (code <= 84) return "Kuchli yomg'ir";
  if (code <= 94) return "Dovul";
  return "Noma'lum";
}

function getWeatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "⛅";
  if (code === 3) return "☁️";
  if (code <= 49) return "🌫";
  if (code <= 59) return "🌦";
  if (code <= 69) return "🌧";
  if (code <= 79) return "🌨";
  if (code <= 84) return "⛈";
  if (code <= 94) return "🌩";
  return "🌤";
}

/* Modern SVG weather icons */
function WeatherSVGIcon({ code }: { code: number }) {
  if (code === 0) {
    // Clear sky — Sun
    return (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <circle cx="32" cy="32" r="12" fill="#FDB813" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="32"
            y1="10"
            x2="32"
            y2="4"
            stroke="#FDB813"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${deg} 32 32)`}
          />
        ))}
      </svg>
    );
  }
  if (code <= 3) {
    // Partly cloudy — Sun + Cloud
    return (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <circle cx="24" cy="22" r="10" fill="#FDB813" />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <line
            key={deg}
            x1="24"
            y1="6"
            x2="24"
            y2="2"
            stroke="#FDB813"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${deg} 24 22)`}
          />
        ))}
        <path d="M20 44 C20 44 16 44 14 42 C10 40 10 34 14 32 C14 26 20 22 26 24 C28 20 34 18 38 22 C44 22 48 26 48 32 C48 38 44 42 38 42 L20 44 Z" fill="#e0e7ef" stroke="#c9d3de" strokeWidth="1" />
      </svg>
    );
  }
  if (code <= 49) {
    // Fog
    return (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <line x1="12" y1="24" x2="52" y2="24" stroke="#c9d3de" strokeWidth="3" strokeLinecap="round" />
        <line x1="16" y1="32" x2="48" y2="32" stroke="#d4dce6" strokeWidth="3" strokeLinecap="round" />
        <line x1="12" y1="40" x2="52" y2="40" stroke="#c9d3de" strokeWidth="3" strokeLinecap="round" />
        <line x1="18" y1="48" x2="46" y2="48" stroke="#d4dce6" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (code <= 69) {
    // Rain — Cloud + drops
    return (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <path d="M16 36 C16 36 12 36 10 34 C6 32 6 26 10 24 C10 18 16 14 22 16 C24 12 30 10 34 14 C40 14 44 18 44 24 C44 30 40 34 34 34 L16 36 Z" fill="#b8c6d6" stroke="#9cadc0" strokeWidth="1" />
        <line x1="18" y1="42" x2="16" y2="50" stroke="#5b9bd5" strokeWidth="2" strokeLinecap="round" />
        <line x1="26" y1="42" x2="24" y2="52" stroke="#5b9bd5" strokeWidth="2" strokeLinecap="round" />
        <line x1="34" y1="42" x2="32" y2="50" stroke="#5b9bd5" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (code <= 79) {
    // Snow — Cloud + snowflakes
    return (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <path d="M16 34 C16 34 12 34 10 32 C6 30 6 24 10 22 C10 16 16 12 22 14 C24 10 30 8 34 12 C40 12 44 16 44 22 C44 28 40 32 34 32 L16 34 Z" fill="#cdd7e2" stroke="#b0bfcf" strokeWidth="1" />
        <circle cx="18" cy="44" r="2.5" fill="#b8d4f0" />
        <circle cx="28" cy="48" r="2.5" fill="#b8d4f0" />
        <circle cx="36" cy="43" r="2.5" fill="#b8d4f0" />
      </svg>
    );
  }
  // Storm / Heavy rain
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M16 32 C16 32 12 32 10 30 C6 28 6 22 10 20 C10 14 16 10 22 12 C24 8 30 6 34 10 C40 10 44 14 44 20 C44 26 40 30 34 30 L16 32 Z" fill="#8a9bb0" stroke="#6e829a" strokeWidth="1" />
      <polygon points="28,36 22,48 28,48 24,58" fill="#FDB813" stroke="#e6a200" strokeWidth="0.5" />
      <line x1="36" y1="38" x2="34" y2="48" stroke="#5b9bd5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
