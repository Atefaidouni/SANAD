"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

export function CtaBanner() {
  const { t } = useI18n();

  return (
    <section className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-cta-radial p-10 text-center text-white shadow-xl sm:p-16"
      >
        <div className="relative mx-auto max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <span>⭐</span>
            <span>{t("marketing.cta.badge")}</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white drop-shadow-xs">
            {t("marketing.cta.title")}
          </h2>

          <p className="text-base text-white/95 sm:text-lg font-medium leading-relaxed">
            {t("marketing.cta.subtitle")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white px-8 text-base font-bold text-emerald-900 shadow-md hover:bg-slate-50 gap-2"
            >
              <a href="#services">
                {t("nav.browseCourses")}
                <ArrowLeft className="size-4 rtl-flip" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/60 bg-white/15 px-8 text-base font-semibold text-white backdrop-blur hover:bg-white/25 hover:text-white"
            >
              <a href="#contact">{t("marketing.cta.secondaryButton")}</a>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
