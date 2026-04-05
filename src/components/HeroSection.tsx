import Image from "next/image";

export default function HeroSection() {
  return (
    <section id="hero" className="bg-primary">
      {/* Mobile: natural flow | Desktop: exactly one viewport */}
      <div className="flex flex-col max-w-[1920px] mx-auto pt-[44px] md:pt-[72px] lg:h-screen lg:pt-[90px]">

        {/* Mobile: normal padding | Desktop: flex-1 centered */}
        <div className="flex flex-col items-center justify-center px-[20px] md:px-8 lg:px-[76px] gap-[8px] md:gap-[10px] lg:gap-[14px] pt-[20px] md:pt-[40px] lg:pt-0 pb-[40px] md:pb-[60px] lg:pb-[120px] lg:flex-1">
          {/* Logo */}
          <Image
            src="/assets/logo.png"
            alt="Chinese Wave"
            width={600}
            height={520}
            priority
            className="w-[280px] h-[233px] md:w-[340px] md:h-[291px] lg:w-[400px] lg:h-[343px] object-contain"
          />

          {/* Title */}
          <h1 className="font-[family-name:var(--font-castoro-titling)] text-gold text-[22px] md:text-[40px] lg:text-[56px] leading-[1.15] text-center max-w-[320px] md:max-w-[700px] lg:max-w-[1050px] uppercase tracking-[0.03em]">
            Xitoy tili &ndash; Karyera va Ta&apos;lim uchun eng to&apos;g&apos;ri tanlov!
          </h1>

          {/* Subtitle */}
          <p className="mb-[16px] md:mb-[20px] lg:mb-[24px] text-gold-warm text-[13px] md:text-[15px] lg:text-[19px] font-light leading-[1.5] text-center max-w-[320px] md:max-w-[640px] lg:max-w-[920px] px-[4px] md:px-0 tracking-[0.02em]">
            Zamonaviy metodika va amaliy mashg&apos;ulotlar orqali xitoy tilini oson, tez va samarali o&apos;rganing. Birinchi darsdanoq natijani his qiling!
          </p>

          {/* CTA Button */}
          <a
            href="#contact"
            className="mt-[24px] md:mt-[32px] lg:mt-[40px] inline-flex items-center justify-center border-[2.5px] border-gold rounded-full px-[28px] py-[10px] md:px-[42px] md:py-[12px] lg:px-[50px] lg:py-[14px] text-gold font-light text-[13px] md:text-[16px] lg:text-[20px] leading-[1.5] hover:bg-gold hover:text-primary transition-colors tracking-[0.04em]"
          >
            Biz bilan bog&apos;laning
          </a>
        </div>
      </div>

      {/* Hero background image — below the fold */}
      <div className="relative max-w-[1920px] mx-auto">
        <div className="w-full h-[180px] md:h-[500px] lg:h-[1002px] overflow-hidden relative">
          <Image
            src="/assets/hero-bg.png"
            alt="Shanghai skyline"
            fill
            priority
            className="object-cover object-center"
          />
          <Image
            src="/assets/hero-overlay.png"
            alt=""
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
