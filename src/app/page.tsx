import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import LessonsSection from "@/components/LessonsSection";
import WhyUsSection from "@/components/WhyUsSection";
import CoursesSection from "@/components/CoursesSection";
import PricingSection from "@/components/PricingSection";
import OutcomesSection from "@/components/OutcomesSection";
import ResultSection from "@/components/ResultSection";
import Footer from "@/components/Footer";
import PageViewTracker from "@/components/PageViewTracker";

export default function Home() {
  return (
    <main className="bg-primary">
      <PageViewTracker page="/" />
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
