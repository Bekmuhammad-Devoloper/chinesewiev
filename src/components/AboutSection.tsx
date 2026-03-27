export default function AboutSection() {
  return (
    <section id="about" className="bg-primary pt-[30px] md:pt-[80px] lg:pt-[100px]">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[60px] lg:px-[156px]">
        {/* Heading — centered */}
        <h2 className="text-center text-gold font-bold text-[22px] md:text-[40px] lg:text-[50px] leading-[1.15] mb-[14px] md:mb-[28px] lg:mb-[35px]">
          Kurs haqida
        </h2>
        <br />

        {/* Description — left aligned, same font style */}
        <div className="text-gold text-[12px] md:text-[18px] lg:text-[22px] font-normal leading-[1.75] max-w-[900px]">
          <p>
            Xitoy tilini tez va to&apos;g&apos;ri o&apos;rganish uchun zamonaviy kurs
          </p>
          <br />
          <p>
            Xitoy tilini o&apos;rganish qiyin degan fikrni unuting. To&apos;g&apos;ri metodika bilan bu tilni o&apos;rganish nafaqat oson, balki juda qiziqarli ham bo&apos;lishi mumkin.
          </p>
          <br />
          <p>
            Bizning kursimiz zamonaviy va xalqaro standart asosida ishlab chiqilgan bo&apos;lib, darslar{" "}
            <strong className="font-bold">HSK 3.0</strong> tizimiga mos ravishda olib boriladi. Bu esa sizni xalqaro darajadagi imtihonlarga va real hayotiy muloqotga tayyorlaydi.
          </p>
        </div>
      </div>
    </section>
  );
}
