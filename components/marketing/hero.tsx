"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Play,
  Sparkles,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
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
            {/* Interactive Live Preview Card (Left side in RTL) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative mx-auto w-full max-w-lg"
            >
              <div className="relative rounded-3xl border border-white/40 bg-white/70 p-6 shadow-2xl backdrop-blur-xl">
                {/* Badges */}
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-emerald-100/90 px-3 py-1 text-xs font-semibold text-emerald-800">
                    حصة مباشرة 🔴
                  </span>
                  <span className="rounded-full bg-slate-100/90 px-3 py-1 text-xs font-semibold text-slate-700">
                    20+ أستاذ
                  </span>
                </div>

                {/* Video / Session Box */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/80 to-blue-100/80 p-6 flex flex-col items-center justify-center text-center shadow-inner">
                  <div className="grid size-14 place-items-center rounded-full bg-teal-400 text-white shadow-lg transition-transform hover:scale-110">
                    <Play className="size-6 fill-current ms-0.5" />
                  </div>
                  <h4 className="mt-4 text-base font-bold text-slate-900">
                    Physic revision session
                  </h4>
                </div>

                {/* Floating Bottom Progress Card */}
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/60 bg-white/90 p-4 shadow-sm">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900">تتبع التقدم</h5>
                    <p className="text-xs text-slate-500">تدريب عملي وتقارير تحسن أسبوعية</p>
                  </div>
                  <div className="grid size-9 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    <TrendingUp className="size-5" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Copy (Right side in RTL) */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-6 text-white"
            >
              <motion.h1
                variants={item}
                className="text-balance text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl text-white drop-shadow-sm"
              >
                مرحباً بك في تجربة التعليم الرقمي
              </motion.h1>

              <motion.p
                variants={item}
                className="max-w-xl text-base text-white/90 sm:text-lg font-medium leading-relaxed"
              >
                دروس تفاعلية، أساتذة خبراء، ومسار تعلّم شخصي مصمم لنجاحك.
              </motion.p>

              <motion.div variants={item} className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-white px-8 text-base font-bold text-emerald-800 shadow-md hover:bg-slate-50"
                >
                  <Link href="/signup">
                    ابدأ الآن
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/60 bg-white/20 px-8 text-base font-medium text-white backdrop-blur hover:bg-white/30 hover:text-white"
                >
                  <Link href="/login">تصفح الدورات</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
