"use client";

import { MarketingNav } from "@/components/marketing/marketing-nav";
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
      <MarketingNav />
      <main className="space-y-20 pb-20 sm:space-y-28">
        <Hero />
        <Stats />
        <About />
        <Services />
        <CoursesShowcase />
        <Feedback />
        <Contact />
        <CtaBanner />
      </main>
      <MarketingFooter />
    </div>
  );
}
