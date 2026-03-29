import Image from "next/image";

const reasons = [
  {
    icon: "/assets/whyus-icon-1.svg",
    title: "HSK 3.0 asosida tizimli o\u2018quv dasturi",
    description:
      "HSK 3.0 (\u6c49\u8bed\u6c34\u5e73\u8003\u8bd5 3.0) \u2014 xitoy tilini xalqaro standart asosida bosqichma-bosqich o\u2018rganish tizimi. U CEFR ga mos ravishda 9 darajaga bo\u2018lingan va grammatik, leksik hamda kommunikativ ko\u2018nikmalarni tizimli rivojlantirishga qaratilgan.",
  },
  {
    icon: "/assets/whyus-icon-3.png",
    title: "Amaliy mashqlarga boy darslar",
    description:
      "HSK 3.0 asosida amaliy mashqlarga boy darslar fonetika, leksika va grammatikani real muloqotga bog\u2018lab o\u2018rgatishga qaratiladi. Asosiy maqsad \u2014 bilimni yodlash emas, balki uni amaliy vaziyatda erkin qo\u2018llay olishdir.",
  },
  {
    icon: "/assets/whyus-icon-2.png",
    title: "Talaffuz va muloqotga alohida e\u2018tibor",
    description:
      "Darslarda talaffuz (tonlar, pinyin, tovush farqlari) muntazam fonetik drill va tinglab-takrorlash mashqlari orqali mustahkamlanadi. Muloqot esa rol o\u2018ynash, juftlikdagi suhbat va real vaziyat simulyatsiyalari orqali faol ravishda rivojlantiriladi.",
  },
  {
    icon: "/assets/whyus-icon-4.png",
    title: "Natijaga yo\u2018naltirilgan yondashuv",
    description:
      "Har bir dars aniq o\u2018lchanadigan maqsad (masalan, 10 ta yangi so\u2018zni erkin qo\u2018llash yoki ma\u2018lum grammatikani suhbatda ishlatish) bilan belgilanadi.",
  },
];

export default function WhyUsSection() {
  return (
    <section className="bg-primary pt-[30px] md:pt-[90px] lg:pt-[100px]" id="why-us">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[60px] lg:px-[156px]">
        <div className="bg-gold rounded-[16px] md:rounded-[30px] lg:rounded-[45px] px-[16px] md:px-[50px] lg:px-[80px] pt-[22px] md:pt-[60px] lg:pt-[70px] pb-[18px] md:pb-[50px] lg:pb-[60px]">
          <h2 className="text-primary font-bold text-[22px] md:text-[38px] lg:text-[48px] leading-[1.2] text-center mb-[40px] md:mb-[70px] lg:mb-[80px]">
            Nima uchun aynan bizning kurs?
          </h2>

          {/* ── Desktop: 2x2 grid with cross dividers ── */}
          <div className="hidden md:block">
            {/* Top row */}
            <div className="flex">
              {/* Card 1 */}
              <div className="flex-1 flex items-start gap-[18px] lg:gap-[24px] pr-[30px] lg:pr-[40px]">
                <div className="w-[90px] h-[90px] lg:w-[120px] lg:h-[120px] flex-shrink-0 flex items-center justify-center">
                  <Image src={reasons[0].icon} alt="" width={120} height={120} className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col gap-[8px] lg:gap-[10px] pt-[4px]">
                  <h3 className="text-primary font-extrabold text-[17px] lg:text-[21px] leading-[1.3] italic">{reasons[0].title}</h3>
                  <p className="text-primary text-[13px] lg:text-[15px] font-normal leading-[1.6]">{reasons[0].description}</p>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="w-[1.5px] bg-primary/25 self-stretch mx-[10px] lg:mx-[16px]" />

              {/* Card 2 */}
              <div className="flex-1 flex items-start gap-[18px] lg:gap-[24px] pl-[30px] lg:pl-[40px]">
                <div className="w-[90px] h-[90px] lg:w-[120px] lg:h-[120px] flex-shrink-0 flex items-center justify-center">
                  <Image src={reasons[1].icon} alt="" width={120} height={120} className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col gap-[8px] lg:gap-[10px] pt-[4px]">
                  <h3 className="text-primary font-extrabold text-[17px] lg:text-[21px] leading-[1.3] italic">{reasons[1].title}</h3>
                  <p className="text-primary text-[13px] lg:text-[15px] font-normal leading-[1.6]">{reasons[1].description}</p>
                </div>
              </div>
            </div>

            {/* Gap between rows */}
            <div className="h-[40px] lg:h-[50px]" />

            {/* Bottom row */}
            <div className="flex">
              {/* Card 3 */}
              <div className="flex-1 flex items-start gap-[18px] lg:gap-[24px] pr-[30px] lg:pr-[40px]">
                <div className="w-[90px] h-[90px] lg:w-[120px] lg:h-[120px] flex-shrink-0 flex items-center justify-center">
                  <Image src={reasons[2].icon} alt="" width={120} height={120} className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col gap-[8px] lg:gap-[10px] pt-[4px]">
                  <h3 className="text-primary font-extrabold text-[17px] lg:text-[21px] leading-[1.3] italic">{reasons[2].title}</h3>
                  <p className="text-primary text-[13px] lg:text-[15px] font-normal leading-[1.6]">{reasons[2].description}</p>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="w-[1.5px] bg-primary/25 self-stretch mx-[10px] lg:mx-[16px]" />

              {/* Card 4 */}
              <div className="flex-1 flex items-start gap-[18px] lg:gap-[24px] pl-[30px] lg:pl-[40px]">
                <div className="w-[90px] h-[90px] lg:w-[120px] lg:h-[120px] flex-shrink-0 flex items-center justify-center">
                  <Image src={reasons[3].icon} alt="" width={120} height={120} className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col gap-[8px] lg:gap-[10px] pt-[4px]">
                  <h3 className="text-primary font-extrabold text-[17px] lg:text-[21px] leading-[1.3] italic">{reasons[3].title}</h3>
                  <p className="text-primary text-[13px] lg:text-[15px] font-normal leading-[1.6]">{reasons[3].description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Mobile: vertical list ── */}
          <div className="md:hidden flex flex-col gap-[22px]">
            {reasons.map((reason, index) => (
              <div key={index} className="flex items-start gap-[12px]">
                <div className="w-[48px] h-[48px] flex-shrink-0 flex items-center justify-center">
                  <Image
                    src={reason.icon}
                    alt=""
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-[4px]">
                  <h3 className="text-primary font-extrabold text-[13px] leading-[1.3] italic">
                    {reason.title}
                  </h3>
                  <p className="text-primary text-[11px] font-normal leading-[1.6]">
                    {reason.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
