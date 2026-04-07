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

/**
 * Root client page component that shows a mystery box overlay before revealing the main home sections.
 *
 * The component renders a `MysteryBoxOverlay` until the box is opened, then fades in the page content
 * (HeroSection, PrizesSection, Timeline, RulesSection, FAQSection, CTASection, and ScrollToTopButton).
 *
 * @returns The Home page element containing the overlay (when active) and the main sections that fade in after the box opens.
 */
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