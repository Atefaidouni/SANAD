"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import type { Level } from "@/lib/types";

type ShowcaseItem = {
  title: string;
  titleAr: string;
  subject: string;
  subjectAr: string;
  level: Level;
  image: string;
};

/** Marketing eye-candy — illustrative course photos for the landing page. */
const ITEMS: ShowcaseItem[] = [
  {
    title: "Mathematics — BAC",
    titleAr: "الرياضيات — بكالوريا",
    subject: "Sciences",
    subjectAr: "علوم",
    level: "exam",
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=70",
  },
  {
    title: "Physics & Chemistry",
    titleAr: "الفيزياء والكيمياء",
    subject: "Sciences",
    subjectAr: "علوم",
    level: "high",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=70",
  },
  {
    title: "Languages — Français",
    titleAr: "اللغات — الفرنسية",
    subject: "Languages",
    subjectAr: "لغات",
    level: "high",
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=70",
  },
  {
    title: "BEM Revision",
    titleAr: "مراجعة شهادة التعليم المتوسط",
    subject: "All subjects",
    subjectAr: "كل المواد",
    level: "middle",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=70",
  },
];

export function CoursesShowcase() {
  const { t, locale } = useI18n();

  return (
    <section className="container scroll-mt-20">
      <SectionHeading
        badge={t("marketing.showcase.badge")}
        title={t("marketing.showcase.title")}
        subtitle={t("marketing.showcase.subtitle")}
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item, i) => {
          const title = locale === "ar" ? item.titleAr : item.title;
          const subject = locale === "ar" ? item.subjectAr : item.subject;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-brand"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={item.image}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
                <Badge variant="brand" className="absolute start-3 top-3">
                  {t(`levels.${item.level}` as const)}
                </Badge>
                <div className="absolute inset-x-4 bottom-3">
                  <p className="text-xs font-medium text-white/80">{subject}</p>
                  <h3 className="text-base font-semibold text-white">{title}</h3>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Button asChild variant="brand" size="lg" className="gap-2">
          <Link href="/signup">
            {t("marketing.showcase.cta")}
            <ArrowRight className="size-4 rtl-flip" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
