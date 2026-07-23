"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";

export function GoldPackCard() {
  const { t } = useI18n();
  const store = useStore();
  const goldCourse = store.getCourses().find((c) => c.isGoldPack);
  const href = goldCourse ? `/courses/${goldCourse.id}` : "/my-courses";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-brand-gold/30 bg-gradient-to-br from-amber-50 to-amber-100/40 p-6 dark:from-amber-950/30 dark:to-amber-900/10 sm:p-7"
    >
      <Crown className="pointer-events-none absolute -end-4 -top-4 size-32 rotate-12 text-brand-gold/15" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Badge variant="gold" className="bg-brand-gold/20">
            <Crown className="size-3.5" /> {t("dashboard.goldPack.badge")}
          </Badge>
          <h3 className="text-xl font-bold tracking-tight">
            {t("dashboard.goldPack.title")}
          </h3>
          <p className="max-w-lg text-sm text-muted-foreground">
            {t("dashboard.goldPack.subtitle")}
          </p>
        </div>
        <Button asChild variant="gold" size="lg" className="shrink-0 gap-2">
          <Link href={href}>
            {t("dashboard.goldPack.cta")}
            <ArrowRight className="size-4 rtl-flip" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
