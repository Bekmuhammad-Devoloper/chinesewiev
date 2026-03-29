import Image from "next/image";

const outcomes = [
  {
    title: "Iyerogliflarni o\u2018qiy va yoza olasiz",
    icon: "/assets/outcome-icon-1.svg",
    hasCircle: true,
  },
  {
    title: "HSK imtihonlariga ishonch bilan tayyor bo\u2018lasiz",
    icon: "/assets/outcome-icon-2.svg",
    hasCircle: true,
  },
  {
    title: "O\u2018zingiz fikr bildira olasiz",
    icon: "/assets/outcome-emoji.svg",
    hasCircle: false,
  },
  {
    title: "Oddiy suhbatlarni bemalol tushunasiz",
    icon: "/assets/outcome-icon-4.svg",
    hasCircle: true,
  },
];

export default function OutcomesSection() {
  return (
    <section className="bg-primary pt-[30px] md:pt-[80px] lg:pt-[100px]" id="outcomes">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[60px] lg:px-[156px]">
        <h2 className="font-[family-name:var(--font-castoro-titling)] text-gold italic text-[22px] md:text-[42px] lg:text-[56px] leading-[1.2] mb-[16px] md:mb-[32px] lg:mb-[40px]">
          Bu kursdan keyin siz:
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] md:gap-[20px] lg:gap-[30px]">
          {outcomes.map((item) => (
            <div
              key={item.title}
              className="bg-accent rounded-[16px] md:rounded-[20px] lg:rounded-[24px] border-[2px] border-accent p-[14px] md:p-[18px] lg:p-[22px] flex flex-col items-center h-[165px] md:h-[240px] lg:h-[268px]"
            >
              {/* Text */}
              <p className="text-gold text-[13px] md:text-[17px] lg:text-[20px] font-medium leading-[1.35] w-full">
                {item.title}
              </p>

              {/* Icon circle — bottom center */}
              <div className="flex justify-center mt-auto">
                {item.hasCircle ? (
                  /* Icons that already have a circle in their SVG */
                  <div className="w-[60px] h-[60px] md:w-[110px] md:h-[110px] lg:w-[130px] lg:h-[130px]">
                    <Image src={item.icon} alt="" width={130} height={130} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  /* Chat icon (no circle in SVG) — wrap in gold circle */
                  <div className="w-[60px] h-[60px] md:w-[110px] md:h-[110px] lg:w-[130px] lg:h-[130px] rounded-full bg-gold border-[2px] md:border-[3px] border-[#F1F1F3] flex items-center justify-center">
                    <Image src={item.icon} alt="" width={80} height={80} className="w-[55%] h-[55%] object-contain" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
