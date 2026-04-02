"use client";

import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import PrizesSection from "@/components/PrizesSection";
import Timeline from "@/components/Timeline";
import RulesSection from "@/components/RulesSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import MysteryBoxOverlay from "@/components/MysteryBoxOverlay";

export default function Home() {
  const [boxOpened, setBoxOpened] = useState(false);

  return (
    <>
      {/* Mystery Box - disappears after opening */}
      {!boxOpened && (
        <MysteryBoxOverlay onComplete={() => setBoxOpened(true)} />
      )}

      {/* Your existing page - fades in after box opens */}
      <div
        style={{
          opacity: boxOpened ? 1 : 0,
          transition: "opacity 0.8s ease",
        }}
      >
      <HeroSection animate={boxOpened} />
      <PrizesSection />
      <Timeline />
      <RulesSection />
      <FAQSection />
      <CTASection />
      <ScrollToTopButton />
      </div>
    </>
  );
}