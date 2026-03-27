const lessons = [
  {
    number: "01",
    title: "Dialoglar orqali o\u2018rganish",
    description:
      "Har bir mavzu real hayotiy dialoglar asosida tushuntiriladi. Siz shunchaki so\u2018z yodlamaysiz \u2014 ularni qanday va qayerda ishlatishni o\u2018rganasiz.",
    // Chat bubble icon
    circleIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] md:w-[28px] lg:w-[36px] h-auto text-primary">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    titleIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] md:w-[18px] lg:w-[22px] h-auto inline-block mr-[4px] text-gold">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    number: "02",
    title: "Grammatikani oddiy va tushunarli tarzda",
    description:
      "Murakkab qoidalar sodda misollar bilan tushuntiriladi. Har bir grammatika real gaplar va mashqlar bilan mustahkamlanadi.",
    // Book icon
    circleIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] md:w-[28px] lg:w-[36px] h-auto text-primary">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    titleIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] md:w-[18px] lg:w-[22px] h-auto inline-block mr-[4px] text-gold">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    number: "03",
    title: "So\u2018zlarni tez yodlash metodikasi",
    description:
      "Maxsus amaliy mashqlar orqali yangi so\u2018zlar aktiv lug\u2018atingizga aylanadi. Siz o\u2018rgangan so\u2018zlarni darhol gapirishda ishlatasiz.",
    // Lightbulb icon
    circleIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] md:w-[28px] lg:w-[36px] h-auto text-primary">
        <path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>
      </svg>
    ),
    titleIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] md:w-[18px] lg:w-[22px] h-auto inline-block mr-[4px] text-gold">
        <path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>
      </svg>
    ),
  },
  {
    number: "04",
    title: "Iyerogliflarni to\u2018g\u2018ri yozish",
    description:
      "Har bir iyeroglif yozilish tartibi (stroke order) bilan o\u2018rgatiladi. Siz nafaqat o\u2018qiysiz, balki to\u2018g\u2018ri yozishni ham bilasiz.",
    // Pen/edit icon
    circleIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] md:w-[28px] lg:w-[36px] h-auto text-primary">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    titleIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] md:w-[18px] lg:w-[22px] h-auto inline-block mr-[4px] text-gold">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
];

export default function LessonsSection() {
  return (
    <section className="bg-primary pt-[30px] md:pt-[90px] lg:pt-[100px]" id="lessons">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[60px] lg:px-[156px]">
        {/* Heading */}
        <div className="text-center mb-[18px] md:mb-[50px] lg:mb-[60px] max-w-[1443px] mx-auto">
          <h2 className="text-white font-bold text-[20px] md:text-[48px] lg:text-[56px] leading-[1.2]">
            Darslar qanday o&apos;tiladi?
          </h2>
          <p className="text-white font-normal text-[11px] md:text-[22px] lg:text-[28px] leading-[1.6] mt-[4px] md:mt-[12px]">
            Biz faqat nazariya bermaymiz &mdash; siz darsning o&apos;zidayoq gapira boshlaysiz.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px] md:gap-[18px] lg:gap-[22px]">
          {lessons.map((lesson) => (
            <div
              key={lesson.number}
              className="bg-accent rounded-[12px] md:rounded-[18px] lg:rounded-[20px] p-[14px] md:p-[28px] lg:p-[35px] flex flex-col justify-between min-h-[140px] md:min-h-[260px] lg:min-h-[300px]"
            >
              {/* Top row: icon + number */}
              <div className="flex items-start justify-between">
                {/* Gold circle icon */}
                <div className="w-[40px] h-[40px] md:w-[65px] md:h-[65px] lg:w-[80px] lg:h-[80px] rounded-full bg-gold flex items-center justify-center shrink-0">
                  {lesson.circleIcon}
                </div>
                {/* Number */}
                <p className="text-gold font-bold text-[36px] md:text-[65px] lg:text-[80px] leading-[1]">
                  {lesson.number}
                </p>
              </div>

              {/* Bottom: icon + title + description */}
              <div className="mt-auto pt-[12px] md:pt-[16px]">
                <h3 className="text-gold font-semibold text-[14px] md:text-[20px] lg:text-[24px] leading-[1.35] flex items-center">
                  {lesson.titleIcon}
                  {lesson.title}
                </h3>
                <p className="text-gold text-[11px] md:text-[14px] lg:text-[16px] font-normal leading-[1.55] opacity-90 mt-[4px] md:mt-[8px]">
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
