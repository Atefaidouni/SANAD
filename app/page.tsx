"use client";

import { Hero } from "@/components/marketing/hero";
import { Stats } from "@/components/marketing/stats";
import { About } from "@/components/marketing/about";
import { Services } from "@/components/marketing/services";
import { CoursesShowcase } from "@/components/marketing/courses-showcase";
import { Feedback } from "@/components/marketing/feedback";
import { Contact } from "@/components/marketing/contact";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen scroll-smooth">
      <main className="pb-20">
        {/* Hero + Stats overlap, so they're isolated from the section rhythm below */}
        <Hero />
        <Stats />

        <div className="space-y-20 pt-20 sm:space-y-28 sm:pt-28">
          <About />
          <Services />
          <CoursesShowcase />
          <Feedback />
          <Contact />
          <CtaBanner />
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
