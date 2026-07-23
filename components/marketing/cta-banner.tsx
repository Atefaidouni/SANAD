"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Sheen } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

export function CtaBanner() {
  const { t } = useI18n();

  return (
    <section className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-brand-gradient p-10 text-center text-white shadow-brand sm:p-16"
      >
        <div className="grid-pattern absolute inset-0 opacity-20" />

        {/* Reusable all-in-one sweeping sheen */}
        <Sheen />

        <div className="relative mx-auto max-w-2xl space-y-5">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("marketing.cta.title")}
          </h2>
          <p className="text-base text-white/85 sm:text-lg">
            {t("marketing.cta.subtitle")}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90"
          >
            <Link href="/signup">
              {t("marketing.cta.button")}
              <ArrowRight className="size-4 rtl-flip" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
