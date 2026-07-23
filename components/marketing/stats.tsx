"use client";

import { motion } from "framer-motion";
import { BookOpen, GraduationCap, TrendingUp, Users } from "lucide-react";
import { CountUp } from "./count-up";
import { useI18n } from "@/lib/i18n/provider";

export function Stats() {
  const { t } = useI18n();

  const items = [
    { icon: Users, value: 2000, suffix: "+", label: t("marketing.stats.students") },
    { icon: GraduationCap, value: 20, suffix: "+", label: t("marketing.stats.teachers") },
    { icon: BookOpen, value: 500, suffix: "+", label: t("marketing.stats.courses") },
    { icon: TrendingUp, value: 90, suffix: "%", label: t("marketing.stats.success") },
  ];

  return (
    <section className="container">
      <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8 lg:grid-cols-4">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <motion.span
                whileHover={{ rotate: -8, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300, damping: 12 }}
                className="grid size-12 place-items-center rounded-2xl bg-brand-gradient-soft text-primary"
              >
                <Icon className="size-6" />
              </motion.span>
              <CountUp
                value={item.value}
                suffix={item.suffix}
                className="text-3xl font-bold tracking-tight text-gradient"
              />
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
