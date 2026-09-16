"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";

import PortalTour from "@/components/ui/PortalTour";
import UserGuide from "@/components/ui/UserGuide";
import FullscreenButton from "@/components/ui/FullscreenButton";
import DeveloperBubble from "@/components/ui/DeveloperBubble";
import SiteNav from "@/components/landing/SiteNav";
import HeroKV from "@/components/landing/HeroKV";
import WorldSection from "@/components/landing/WorldSection";
import GateCards from "@/components/landing/GateCards";
import CharacterRoster from "@/components/landing/CharacterRoster";
import StorySection from "@/components/landing/StorySection";
import FooterBand from "@/components/landing/FooterBand";

/** shared by every anchor target so the fixed nav never covers a heading */
const SECTION = "scroll-mt-[60px] md:scroll-mt-[72px]";

export default function PortalPage() {
  const [showTour, setShowTour] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  return (
    <main className="min-h-screen" style={{ background: "#0a0712" }}>
      {/* bottom-LEFT: the default `top-4 right-4` collides with SiteNav's ENTER
          button, and DeveloperBubble already owns the bottom-right corner */}
      <FullscreenButton
        borderColor="morandi-lavender"
        className="fixed bottom-5 left-5 z-30 hidden md:flex"
      />

      <SiteNav onOpenGuide={() => setShowGuide(true)} />

      <HeroKV />

      <WorldSection onOpenTour={() => setShowTour(true)} />

      <section id="gates" className={`${SECTION} py-24 md:py-32 px-6 max-w-7xl mx-auto`}>
        <GateCards />
      </section>

      <section id="characters" className={`${SECTION} py-20 md:py-28`}>
        <CharacterRoster />
      </section>

      <section id="story" className={`${SECTION} py-20 md:py-28`}>
        <StorySection />
      </section>

      <FooterBand onOpenGuide={() => setShowGuide(true)} />

      <AnimatePresence>{showGuide && <UserGuide onClose={() => setShowGuide(false)} />}</AnimatePresence>
      <AnimatePresence>{showTour && <PortalTour onClose={() => setShowTour(false)} />}</AnimatePresence>

      <DeveloperBubble hidden={showGuide || showTour} />
    </main>
  );
}
