import Image from "next/image";

export default function HeroSection() {
  return (
    <section id="hero" className="bg-primary">
      {/* First screen: Content = exactly 100vh */}
      <div className="min-h-screen flex flex-col max-w-[1920px] mx-auto pt-[44px] md:pt-[80px] lg:pt-[100px]">

        {/* Content fills the remaining space */}
        <div className="flex-1 flex flex-col items-center justify-center px-[20px] md:px-8 lg:px-[76px] gap-[10px] md:gap-[10px] lg:gap-[14px] py-[20px] md:py-[30px] lg:py-[40px]">
          {/* Logo */}
          <Image
            src="/assets/logo.png"
            alt="Chinese Wave"
            width={600}
            height={520}
            priority
            className="w-[200px] h-[166px] md:w-[260px] md:h-[223px] lg:w-[340px] lg:h-[291px] object-contain"
          />

          {/* Title */}
          <h1 className="font-[family-name:var(--font-castoro-titling)] text-gold text-[22px] md:text-[40px] lg:text-[56px] leading-[1.15] text-center max-w-[320px] md:max-w-[700px] lg:max-w-[1050px] uppercase tracking-[0.03em]">
            Xitoy tili &ndash; Karyera va Ta&apos;lim uchun eng to&apos;g&apos;ri tanlov!
          </h1>

          {/* Subtitle */}
          <p className="text-gold-warm text-[13px] md:text-[15px] lg:text-[19px] font-light leading-[1.7] text-center max-w-[320px] md:max-w-[640px] lg:max-w-[920px] px-[4px] md:px-0 tracking-[0.02em]">
            Zamonaviy metodika va amaliy mashg&apos;ulotlar orqali xitoy tilini oson, tez va samarali o&apos;rganing. Birinchi darsdanoq natijani his qiling!
          </p>

          {/* CTA Button */}
          <a
            href="#contact"
            className="mt-[6px] md:mt-[8px] lg:mt-[10px] inline-flex items-center justify-center border-[1.5px] border-gold rounded-full px-[28px] py-[10px] md:px-[42px] md:py-[12px] lg:px-[50px] lg:py-[14px] text-gold font-light text-[13px] md:text-[16px] lg:text-[20px] leading-[1.5] hover:bg-gold hover:text-primary transition-colors tracking-[0.04em]"
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
