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
        <div className="bg-gold rounded-[16px] md:rounded-[30px] lg:rounded-[45px] px-[16px] md:px-[50px] lg:px-[60px] pt-[22px] md:pt-[60px] lg:pt-[70px] pb-[18px] md:pb-[50px] lg:pb-[60px]">
          <h2 className="text-primary font-bold text-[22px] md:text-[38px] lg:text-[48px] leading-[1.2] text-center mb-[16px] md:mb-[40px] lg:mb-[50px]">
            Nima uchun aynan bizning kurs?
          </h2>

          {/* Desktop: 2-col grid */}
          <div className="hidden md:grid grid-cols-2 gap-x-[40px] lg:gap-x-[60px] gap-y-[40px] lg:gap-y-[50px]">
            {reasons.map((reason, index) => (
              <div key={index} className="flex gap-[20px]">
                <Image
                  src={reason.icon}
                  alt=""
                  width={140}
                  height={120}
                  className="w-[120px] h-[100px] lg:w-[155px] lg:h-[130px] object-contain flex-shrink-0"
                />
                <div className="flex flex-col gap-[10px]">
                  <h3 className="text-primary font-bold text-[21px] lg:text-[24px] leading-[1.3]">
                    {reason.title}
                  </h3>
                  <p className="text-primary text-[15px] lg:text-[16px] font-normal leading-[1.55]">
                    {reason.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: vertical list */}
          <div className="md:hidden flex flex-col gap-[20px]">
            {reasons.map((reason, index) => (
              <div key={index} className="flex gap-[12px]">
                <Image
                  src={reason.icon}
                  alt=""
                  width={140}
                  height={120}
                  className="w-[50px] h-[42px] object-contain flex-shrink-0 mt-[2px]"
                />
                <div className="flex flex-col gap-[6px]">
                  <h3 className="text-primary font-bold text-[14px] leading-[1.3]">
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
