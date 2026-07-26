"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Play, Sparkles, Users, Video } from "lucide-react";
import { MarketingNav } from "./marketing-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n/provider";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  const { t } = useI18n();

  return (
    <section id="home" className="relative scroll-mt-20">
      <div className="container pb-8 pt-3 sm:pb-12 sm:pt-4">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-hero-gradient p-4 sm:p-8">
          <motion.div
            animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-24 start-1/3 size-[28rem] rounded-full bg-white/20 blur-3xl pointer-events-none"
          />

          <MarketingNav />

          <div className="grid items-center gap-10 px-4 pb-8 pt-8 sm:px-8 sm:pb-12 lg:grid-cols-2 lg:gap-12 lg:px-12 lg:pb-16 lg:pt-10">
            {/* Copy — first in the DOM so it stays at the reading-start side
               (left in English, right in Arabic) when the grid mirrors for RTL. */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-6 text-white"
            >
              <motion.div
                variants={item}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur"
              >
                <Sparkles className="size-3.5" />
                {t("marketing.hero.badge")}
              </motion.div>

              <motion.h1
                variants={item}
                className="text-balance text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl text-white drop-shadow-sm"
              >
                {t("marketing.hero.title")}
              </motion.h1>

              <motion.p
                variants={item}
                className="max-w-xl text-base text-white/90 sm:text-lg font-medium leading-relaxed"
              >
                {t("marketing.hero.subtitle")}
              </motion.p>

              <motion.div variants={item} className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-white px-8 text-base font-bold text-emerald-800 shadow-md hover:bg-slate-50"
                >
                  <Link href="/signup">
                    {t("marketing.hero.ctaStart")}
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/60 bg-white/20 px-8 text-base font-medium text-white backdrop-blur hover:bg-white/30 hover:text-white"
                >
                  <Link href="/login">{t("marketing.hero.ctaBrowse")}</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Interactive Live Preview Card — second, so it sits at the reading-end side. */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative mx-auto w-full max-w-lg"
            >
              <div className="relative rounded-3xl border border-white/40 bg-white/70 p-4 shadow-2xl backdrop-blur-xl">
                {/* Video / Session Box */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-inner">
                  <Image
                    src="https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=70"
                    alt={t("marketing.hero.liveCardTitle")}
                    fill
                    sizes="(max-width: 768px) 100vw, 32rem"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-emerald-950/10 to-transparent" />

                  {/* Top overlays */}
                  <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      <motion.span
                        animate={{ opacity: [1, 0.35, 1] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                        className="size-1.5 rounded-full bg-white"
                      />
                      {t("marketing.hero.liveCardStatus")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      <Users className="size-3.5" />
                      {t("marketing.hero.liveCount")}
                    </span>
                  </div>

                  {/* Play button */}
                  <div className="absolute inset-0 grid place-items-center">
                    <motion.span
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="grid size-16 place-items-center rounded-full bg-white/90 text-emerald-700 shadow-lg backdrop-blur"
                    >
                      <Play className="size-7 fill-current ms-0.5" />
                    </motion.span>
                  </div>
                </div>

                {/* Session info */}
                <div className="px-2 pb-1 pt-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-600">
                    <Video className="size-3.5" />
                    {t("marketing.hero.liveType")}
                  </div>
                  <h4 className="mt-1 text-base font-bold text-slate-900">
                    {t("marketing.hero.liveCardTitle")}
                  </h4>
                  <p className="text-sm text-slate-500">{t("marketing.hero.liveCardTeacher")}</p>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                      <span>{t("marketing.hero.progressTitle")}</span>
                      <span className="font-bold text-emerald-600">50%</span>
                    </div>
                    <Progress value={50} />
                  </div>
                </div>
              </div>

              {/* Floating "progress saved" toast */}
              <motion.div
                initial={{ opacity: 0, y: 14, x: -8 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-5 -start-5 flex max-w-[15rem] items-center gap-3 rounded-2xl border border-white/60 bg-white/95 p-3 pe-5 shadow-xl backdrop-blur-xl"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{t("marketing.hero.toastTitle")}</p>
                  <p className="truncate text-xs text-slate-500">{t("marketing.hero.toastBody")}</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
