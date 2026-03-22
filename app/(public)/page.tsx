import Image from "next/image";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import GamesSection from "@/components/GamesSection";
import Leaderboard from "@/components/Leaderboard";
import PrizesSection from "@/components/PrizesSection";
import Timeline from "@/components/Timeline";
import RulesSection from "@/components/RulesSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <GamesSection />
      <Leaderboard />
      <PrizesSection />
      <Timeline />
      <RulesSection />
      <FAQSection />
      <CTASection />
      <ScrollToTopButton />
    </>
  );
}
