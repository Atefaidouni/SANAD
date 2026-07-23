"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, School, Trophy } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

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
      icon: Trophy,
      title: t("marketing.services.examTitle"),
      desc: t("marketing.services.examDesc"),
      popular: true,
    },
    {
      icon: GraduationCap,
      title: t("marketing.services.highTitle"),
      desc: t("marketing.services.highDesc"),
      popular: false,
    },
  ];

  return (
    <section id="services" className="container scroll-mt-20">
      <SectionHeading
        badge={t("marketing.services.badge")}
        title={t("marketing.services.title")}
        subtitle={t("marketing.services.subtitle")}
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
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
                y: -8,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              className={cn(
                "group relative flex flex-col gap-4 rounded-3xl border p-7 transition-shadow",
                track.popular
                  ? "border-transparent bg-brand-gradient text-white shadow-brand md:-mt-4 md:mb-4"
                  : "border-border bg-card shadow-soft hover:shadow-brand"
              )}
            >
              {track.popular && (
                <Badge className="absolute end-6 top-6 border-0 bg-white/20 text-white backdrop-blur">
                  {t("marketing.services.popular")}
                </Badge>
              )}
              <span
                className={cn(
                  "grid size-14 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6",
                  track.popular
                    ? "bg-white/20 text-white"
                    : "bg-brand-gradient-soft text-primary"
                )}
              >
                <Icon className="size-7" />
              </span>
              <h3 className="text-xl font-semibold">{track.title}</h3>
              <p
                className={cn(
                  "flex-1 text-sm",
                  track.popular ? "text-white/85" : "text-muted-foreground"
                )}
              >
                {track.desc}
              </p>
              <Button
                asChild
                variant={track.popular ? "default" : "outline"}
                className={cn(
                  "mt-2 w-full gap-2",
                  track.popular && "bg-white text-primary hover:bg-white/90"
                )}
              >
                <Link href="/signup">
                  {t("marketing.services.cta")}
                  <ArrowRight className="size-4 rtl-flip" />
                </Link>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
