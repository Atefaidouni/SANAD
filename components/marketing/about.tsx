"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CountUp } from "./count-up";
import { useI18n } from "@/lib/i18n/provider";

export function About() {
  const { t } = useI18n();
  const points = [
    t("marketing.about.point1"),
    t("marketing.about.point2"),
    t("marketing.about.point3"),
    t("marketing.about.point4"),
  ];

  return (
    <section id="about" className="container scroll-mt-20">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="relative order-last lg:order-first"
        >
          <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-border shadow-soft">
            <Image
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1000&q=70"
              alt={t("marketing.about.imageAlt")}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform [transition-duration:1200ms] ease-out will-change-transform group-hover:scale-[1.07]"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent" />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 12 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.35 }}
            className="absolute -bottom-5 end-4 rounded-2xl border border-border bg-card p-4 shadow-brand sm:end-8"
          >
            <div className="flex items-center gap-3">
              <CountUp value={90} suffix="%" className="text-3xl font-bold text-gradient" />
              <span className="max-w-[7rem] text-xs text-muted-foreground">
                {t("marketing.stats.success")}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="space-y-5"
        >
          <Badge variant="secondary" className="px-3 py-1">
            {t("marketing.about.badge")}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("marketing.about.title")}
          </h2>
          <p className="text-base text-muted-foreground sm:text-lg">
            {t("marketing.about.subtitle")}
          </p>
          <ul className="space-y-3 pt-2">
            {points.map((point, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-secondary" />
                <span className="text-sm font-medium sm:text-base">{point}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
