/* ── Shared icon sizes ── */
const circleIconCls = "w-[22px] h-[22px] md:w-[30px] md:h-[30px] lg:w-[38px] lg:h-[38px]";
const titleIconCls  = "w-[14px] h-[14px] md:w-[16px] md:h-[16px] lg:w-[20px] lg:h-[20px] shrink-0";

const lessons = [
  {
    number: "01",
    title: "Dialoglar orqali o\u2018rganish",
    description:
      "Har bir mavzu real hayotiy dialoglar asosida tushuntiriladi. Siz shunchaki so\u2018z yodlamaysiz \u2014 ularni qanday va qayerda ishlatishni o\u2018rganasiz.",
    // Chat bubble filled
    circleIcon: (
      <svg viewBox="0 0 24 24" className={circleIconCls}>
        <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" className="text-primary"/>
      </svg>
    ),
    titleIcon: (
      <svg viewBox="0 0 24 24" className={titleIconCls}>
        <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" className="text-gold"/>
      </svg>
    ),
  },
  {
    number: "02",
    title: "Grammatikani oddiy va tushunarli tarzda",
    description:
      "Murakkab qoidalar sodda misollar bilan tushuntiriladi. Har bir grammatika real gaplar va mashqlar bilan mustahkamlanadi.",
    // Open book filled
    circleIcon: (
      <svg viewBox="0 0 24 24" className={circleIconCls}>
        <path fill="currentColor" d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" className="text-primary"/>
      </svg>
    ),
    titleIcon: (
      <svg viewBox="0 0 24 24" className={titleIconCls}>
        <path fill="currentColor" d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" className="text-gold"/>
      </svg>
    ),
  },
  {
    number: "03",
    title: "So\u2018zlarni tez yodlash metodikasi",
    description:
      "Maxsus amaliy mashqlar orqali yangi so\u2018zlar aktiv lug\u2018atingizga aylanadi. Siz o\u2018rgangan so\u2018zlarni darhol gapirishda ishlatasiz.",
    // Lightbulb filled
    circleIcon: (
      <svg viewBox="0 0 24 24" className={circleIconCls}>
        <path fill="currentColor" d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z" className="text-primary"/>
      </svg>
    ),
    titleIcon: (
      <svg viewBox="0 0 24 24" className={titleIconCls}>
        <path fill="currentColor" d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z" className="text-gold"/>
      </svg>
    ),
  },
  {
    number: "04",
    title: "Iyerogliflarni to\u2018g\u2018ri yozish",
    description:
      "Har bir iyeroglif yozilish tartibi (stroke order) bilan o\u2018rgatiladi. Siz nafaqat o\u2018qiysiz, balki to\u2018g\u2018ri yozishni ham bilasiz.",
    // Chinese character 文 + A (translate icon)
    circleIcon: (
      <svg viewBox="0 0 24 24" className={circleIconCls}>
        <path fill="currentColor" d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" className="text-primary"/>
      </svg>
    ),
    titleIcon: (
      <svg viewBox="0 0 24 24" className={titleIconCls}>
        <path fill="currentColor" d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" className="text-gold"/>
      </svg>
    ),
  },
];

export default function LessonsSection() {
  return (
    <section className="bg-primary pt-[30px] md:pt-[90px] lg:pt-[100px] lg:pb-[80px]" id="lessons">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[60px] lg:px-[156px]">
        {/* Heading */}
        <div className="text-center mb-[32px] md:mb-[50px] lg:mb-[60px] max-w-[1443px] mx-auto">
          <h2 className="text-white font-bold text-[22px] md:text-[48px] lg:text-[56px] leading-[1.2] mb-[12px] md:mb-[16px]">
            Darslar qanday o&apos;tiladi?
          </h2>
          <p className="text-white font-normal text-[12px] md:text-[22px] lg:text-[28px] leading-[1.5] mb-[20px] md:mb-[30px] lg:mb-[70px]">
            Biz faqat nazariya bermaymiz &mdash; siz darsning o&apos;zidayoq gapira boshlaysiz.
          </p>
          <br className="block md:hidden" />
          <br className="hidden lg:block" />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px] md:gap-[18px] lg:gap-[22px]">
          {lessons.map((lesson) => (
            <div
              key={lesson.number}
              className="bg-accent rounded-[14px] md:rounded-[18px] lg:rounded-[20px] p-[14px] md:p-[28px] lg:p-[35px] flex flex-col"
            >
              {/* Top row: icon circle + number */}
              <div className="flex items-center justify-between">
                <div className="w-[36px] h-[36px] md:w-[65px] md:h-[65px] lg:w-[80px] lg:h-[80px] rounded-full bg-gold flex items-center justify-center shrink-0">
                  {lesson.circleIcon}
                </div>
                <p className="text-gold font-bold text-[38px] md:text-[65px] lg:text-[80px] leading-[1] opacity-80">
                  {lesson.number}
                </p>
              </div>

              {/* Spacer after icon row */}
              <div className="h-[10px] md:h-[16px]" />

              {/* Bottom: title + description */}
              <div>
                <h3 className="text-gold font-semibold text-[14px] md:text-[20px] lg:text-[24px] leading-[1.3] flex items-center gap-[4px] md:gap-[8px]">
                  <span className="text-gold">{lesson.titleIcon}</span>
                  {lesson.title}
                </h3>
                {/* Spacer after title */}
                <div className="h-[6px] md:h-[10px]" />
                <p className="text-gold text-[11px] md:text-[14px] lg:text-[16px] font-normal leading-[1.45] opacity-80">
                  {lesson.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
