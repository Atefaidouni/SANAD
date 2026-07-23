"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Play,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
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
    <section id="home" className="relative overflow-hidden scroll-mt-20">
      {/* Ambient brand glow — gently breathes */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          aria-hidden
          animate={{ opacity: [0.12, 0.22, 0.12], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 start-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-brand-gradient blur-3xl"
        />
        <div className="grid-pattern absolute inset-0 opacity-40" />
      </div>

      <div className="container grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        {/* Copy */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div variants={item}>
            <Badge variant="secondary" className="px-3 py-1">
              <Sparkles className="size-3.5" /> {t("marketing.hero.badge")}
            </Badge>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {t("marketing.hero.title")}
          </motion.h1>

          <motion.p
            variants={item}
            className="max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
          >
            {t("marketing.hero.subtitle")}
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="brand">
              <Link href="/signup">
                {t("marketing.hero.ctaStart")}
                <ArrowRight className="size-4 rtl-flip" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">{t("marketing.hero.ctaBrowse")}</Link>
            </Button>
          </motion.div>

          <motion.div variants={item} className="flex items-center gap-6 pt-2">
            <motion.div
              className="flex -space-x-3 rtl:space-x-reverse"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
              }}
            >
              {[68, 45, 33, 12].map((n) => (
                <motion.img
                  key={n}
                  variants={{
                    hidden: { opacity: 0, scale: 0.4 },
                    show: { opacity: 1, scale: 1 },
                  }}
                  whileHover={{ y: -4, scale: 1.12, zIndex: 10 }}
                  src={`https://i.pravatar.cc/80?img=${n}`}
                  alt=""
                  className="size-9 rounded-full border-2 border-background object-cover"
                />
              ))}
            </motion.div>
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">2,000+</span>{" "}
              {t("marketing.stats.students")}
            </p>
          </motion.div>
        </motion.div>

        {/* Floating live-session preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto w-full max-w-md"
        >
          <motion.div
            className="animate-float"
            whileHover={{ scale: 1.02, rotate: -0.5 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
          >
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-brand">
              {/* Live header */}
              <div className="relative aspect-video overflow-hidden bg-brand-gradient">
                <Image
                  src="https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=70"
                  alt={t("marketing.hero.liveCardTitle")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 28rem"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/70 to-secondary/55" />
                <div className="grid-pattern absolute inset-0 opacity-25" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="grid size-16 place-items-center rounded-full bg-white/20 backdrop-blur"
                  >
                    <Play className="size-7 fill-white text-white" />
                  </motion.span>
                </div>
                <div className="absolute start-4 top-4">
                  <Badge className="border-0 bg-red-500 text-white">
                    <span className="me-1 inline-block size-1.5 animate-pulse rounded-full bg-white" />
                    {t("marketing.hero.liveCardStatus")}
                  </Badge>
                </div>
                <div className="absolute end-4 top-4">
                  <Badge className="border-0 bg-black/30 text-white backdrop-blur">
                    <Users className="size-3" /> 248
                  </Badge>
                </div>
              </div>

              {/* Card body */}
              <div className="space-y-3 p-5">
                <div className="flex items-center gap-2 text-primary">
                  <Video className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Zoom
                  </span>
                </div>
                <h3 className="text-lg font-semibold">
                  {t("marketing.hero.liveCardTitle")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("marketing.hero.liveCardTeacher")}
                </p>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">
                      {t("record.progress")}
                    </span>
                    <span className="text-primary">50%</span>
                  </div>
                  <Progress value={50} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Progress toast */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="absolute -bottom-5 -start-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-3 pe-5 shadow-soft sm:-start-8"
          >
            <span className="grid size-10 place-items-center rounded-full bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                {t("marketing.hero.toastTitle")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("marketing.hero.toastBody")}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
