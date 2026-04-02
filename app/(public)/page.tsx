"use client";

import { useState, useEffect } from "react";
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
  const [showBox, setShowBox] = useState(false);

  useEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (nav?.type === "reload") {
      sessionStorage.removeItem("mysteryBoxShown");
      setShowBox(true);
      return;
    }
    if (sessionStorage.getItem("mysteryBoxShown") === "true") {
      setBoxOpened(true);
    } else {
      setShowBox(true);
    }
  }, []);

  return (
    <>
      {/* Mystery Box - only rendered after we confirm it should show */}
      {showBox && !boxOpened && (
        <MysteryBoxOverlay onComplete={() => { sessionStorage.setItem("mysteryBoxShown", "true"); setBoxOpened(true); }} />
      )}

      {/* Your existing page - fades in after box opens */}
      <div
        style={{
          opacity: boxOpened ? 1 : 0,
          transition: showBox ? "opacity 0.8s ease" : "none",
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