"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, Landmark, School, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

export function Services() {
  const { t } = useI18n();

  const tracks = [
    {
      icon: School,
      title: t("marketing.services.middleTitle"),
      desc: t("marketing.services.middleDesc"),
      popular: false,
    },
    {
      icon: GraduationCap,
      title: t("marketing.services.highTitle"),
      desc: t("marketing.services.highDesc"),
      popular: false,
    },
    {
      icon: Landmark,
      title: t("marketing.services.universityTitle"),
      desc: t("marketing.services.universityDesc"),
      popular: false,
    },
    {
      icon: Sparkles,
      title: t("marketing.services.examTitle"),
      desc: t("marketing.services.examDesc"),
      popular: true,
    },
  ];

  return (
    <section id="services" className="container scroll-mt-20 py-8">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="secondary" className="px-3 py-1">
          {t("marketing.services.badge")}
        </Badge>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {t("marketing.services.title")}
        </h2>
        <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
          {t("marketing.services.subtitle")}
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
        {tracks.map((track, i) => {
          const Icon = track.icon;
          return (
            <motion.div
              key={track.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              whileHover={{
                y: -6,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              className={track.popular
                ? "group relative flex flex-col justify-between rounded-3xl bg-feedback-card p-8 text-white shadow-xl border border-emerald-500/30"
                : "group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-md transition-all"
              }
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span
                    className={track.popular
                      ? "grid size-12 place-items-center rounded-2xl bg-white/20 text-white"
                      : "grid size-12 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    }
                  >
                    <Icon className="size-6" />
                  </span>
                  {track.popular && (
                    <Badge className="border-0 bg-emerald-400/25 px-3 py-1 text-xs text-white backdrop-blur">
                      {t("marketing.services.popular")}
                    </Badge>
                  )}
                </div>

                <h3 className={track.popular ? "text-xl font-bold text-white mb-3" : "text-xl font-bold text-foreground mb-3"}>
                  {track.title}
                </h3>
                <p className={track.popular ? "text-sm text-emerald-50/90 leading-relaxed mb-6" : "text-sm text-muted-foreground leading-relaxed mb-6"}>
                  {track.desc}
                </p>
              </div>

              <Button
                asChild
                className={track.popular
                  ? "w-full rounded-full bg-white text-emerald-900 hover:bg-slate-50 font-semibold gap-2"
                  : "w-full rounded-full border border-border bg-card text-indigo-600 hover:bg-muted font-semibold gap-2 shadow-2xs dark:text-indigo-400"
                }
              >
                <Link href="/signup">
                  {t("marketing.services.cta")}
                  <ArrowLeft className="size-4 rtl-flip" />
                </Link>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
