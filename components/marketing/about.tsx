"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Target, RefreshCw, BookOpen, Award } from "lucide-react";
import { AmbientBackground } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/provider";

export function About() {
  const { t } = useI18n();

  const features = [
    { icon: RefreshCw, title: t("marketing.about.point1"), tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" },
    { icon: Target, title: t("marketing.about.point2"), tone: "text-blue-600 dark:text-blue-400 bg-blue-500/10" },
    { icon: BookOpen, title: t("marketing.about.point3"), tone: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10" },
    { icon: ShieldCheck, title: t("marketing.about.point4"), tone: "text-teal-600 dark:text-teal-400 bg-teal-500/10" },
  ];

  const journey = [
    { icon: BookOpen, title: t("marketing.about.journeyStep1"), tone: "text-blue-600 dark:text-blue-400 bg-blue-500/10" },
    { icon: CheckCircle2, title: t("marketing.about.journeyStep2"), tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" },
    { icon: Award, title: t("marketing.about.journeyStep3"), tone: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10" },
  ];

  return (
    <section id="about" className="container relative scroll-mt-20 py-8">
      <AmbientBackground />
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Copy & Features Grid — first in the DOM so it stays at the reading-start
           side (left in English, right in Arabic) when the grid mirrors for RTL. */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="space-y-3">
            <Badge variant="secondary" className="px-3 py-1">
              {t("marketing.about.badge")}
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {t("marketing.about.title")}
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("marketing.about.subtitle")}
          </p>

          {/* Feature Pills Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  whileHover={{ y: -3, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xs"
                >
                  <motion.div
                    whileHover={{ scale: 1.12, rotate: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={`grid size-8 shrink-0 place-items-center rounded-xl ${feat.tone}`}
                  >
                    <Icon className="size-4" />
                  </motion.div>
                  <span className="text-sm font-semibold text-foreground">{feat.title}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Student Journey Widget — second, so it sits at the reading-end side. */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto w-full max-w-md"
        >
          {/* Continuous gentle float, offset from the hero card's timing for variety. */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-3xl border border-border bg-muted/40 p-6 shadow-sm"
          >
            <h3 className="mb-5 text-center text-lg font-bold text-foreground">
              {t("marketing.about.journeyTitle")}
            </h3>
            <div className="space-y-3">
              {journey.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    whileHover={{ x: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
                  >
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                      className={`grid size-9 shrink-0 place-items-center rounded-xl ${step.tone}`}
                    >
                      <Icon className="size-5" />
                    </motion.div>
                    <span className="text-sm font-semibold text-foreground">{step.title}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
