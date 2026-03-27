import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import LessonsSection from "@/components/LessonsSection";
import WhyUsSection from "@/components/WhyUsSection";
import CoursesSection from "@/components/CoursesSection";
import PricingSection from "@/components/PricingSection";
import OutcomesSection from "@/components/OutcomesSection";
import ResultSection from "@/components/ResultSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-primary">
      <HeroSection />
      <AboutSection />
      <LessonsSection />
      <WhyUsSection />
      <CoursesSection />
      <PricingSection />
      <OutcomesSection />
      <ResultSection />
      <Footer />
    </main>
  );
}
