import dynamic from "next/dynamic";
import HeroSection from "@/components/HeroSection";
import PageViewTracker from "@/components/PageViewTracker";

const AboutSection = dynamic(() => import("@/components/AboutSection"));
const LessonsSection = dynamic(() => import("@/components/LessonsSection"));
const WhyUsSection = dynamic(() => import("@/components/WhyUsSection"));
const CoursesSection = dynamic(() => import("@/components/CoursesSection"));
const PricingSection = dynamic(() => import("@/components/PricingSection"));
const OutcomesSection = dynamic(() => import("@/components/OutcomesSection"));
const ResultSection = dynamic(() => import("@/components/ResultSection"));
const Footer = dynamic(() => import("@/components/Footer"));

export default function Home() {
  return (
    <main className="bg-primary">
      <PageViewTracker page="/" />
      <HeroSection />
      <AboutSection />
      <LessonsSection />
      <div className="hidden lg:block h-[60px] bg-primary" />
      <WhyUsSection />
      <CoursesSection />
      <PricingSection />
      <OutcomesSection />
      <ResultSection />
      <Footer />
    </main>
  );
}
