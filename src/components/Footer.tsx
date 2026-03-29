import Image from "next/image";

const contacts = [
  {
    icon: "/assets/phone-icon.svg",
    label: "+998 90 012 33 80",
    href: "tel:+998900123380",
  },
  {
    icon: "/assets/telegram-icon.svg",
    label: "Telegram orqali bog\u2018lanish",
    href: "https://t.me/Bobur_676",
  },
  {
    icon: "/assets/telegram-icon.svg",
    label: "Telegram kanal",
    href: "https://t.me/chinesewave2026",
  },
  {
    icon: "/assets/instagram-icon.svg",
    label: "Instagram sahifa",
    href: "https://www.instagram.com/chinesewave2026/",
  },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-primary pt-[30px] md:pt-[70px] lg:pt-[100px] pb-[20px] md:pb-[50px] lg:pb-[60px]">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[60px] lg:px-[156px]">
        <div className="flex flex-row items-end justify-between gap-[16px] md:gap-0">
          {/* Contact Info */}
          <div>
            <h3 className="text-gold font-bold text-[18px] md:text-[36px] lg:text-[44px] leading-[1.2] mb-[12px] md:mb-[24px] lg:mb-[30px] text-left">
              Bog&apos;lanish:
            </h3>
            <ul className="space-y-[8px] md:space-y-[16px] lg:space-y-[18px]">
              {contacts.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-[8px] md:gap-[14px] text-gold text-[11px] md:text-[20px] lg:text-[24px] font-normal leading-[1.5] hover:text-gold-light transition-colors"
                  >
                    <Image
                      src={c.icon}
                      alt=""
                      width={32}
                      height={32}
                      className="w-[16px] h-[16px] md:w-[26px] md:h-[26px] lg:w-[30px] lg:h-[30px]"
                    />
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/assets/logo.png"
              alt="Chinese Wave"
              width={400}
              height={320}
              className="w-[90px] md:w-[280px] lg:w-[350px] h-auto object-contain"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="mt-[24px] md:mt-[30px] lg:mt-[36px] border-t border-gold/40"></div>
      </div>
    </footer>
  );
}
