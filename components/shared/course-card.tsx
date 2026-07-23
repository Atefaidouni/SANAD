"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Clock,
  Crown,
  GraduationCap,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StarRating } from "./star-rating";
import { useI18n } from "@/lib/i18n/provider";
import { cn, formatPrice } from "@/lib/utils";
import type { Course } from "@/lib/types";

interface CourseCardProps {
  course: Course;
  status?: "catalog" | "active" | "saved";
  progress?: number;
  saved?: boolean;
  href?: string;
  onJoin?: () => void;
  onSaveToggle?: () => void;
  className?: string;
  index?: number;
}

export function CourseCard({
  course,
  status = "catalog",
  progress,
  saved,
  href,
  onJoin,
  onSaveToggle,
  className,
  index = 0,
}: CourseCardProps) {
  const { t, locale } = useI18n();
  const [loaded, setLoaded] = useState(false);
  const title = locale === "ar" && course.titleAr ? course.titleAr : course.title;
  const subject =
    locale === "ar" && course.subjectAr ? course.subjectAr : course.subject;
  const detailHref = href ?? `/courses/${course.id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-brand",
        className
      )}
    >
      {/* Thumbnail */}
      <Link href={detailHref} className="relative block aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={course.thumbnail || ""}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          onLoad={() => setLoaded(true)}
          className={cn(
            "object-cover transition-all duration-700 ease-out group-hover:scale-105",
            loaded ? "scale-100 blur-0 opacity-100" : "scale-105 blur-md opacity-0"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {course.isGoldPack && (
              <Badge variant="gold" className="bg-brand-gold text-slate-900">
                <Crown className="size-3" /> {t("courses.goldPack")}
              </Badge>
            )}
            {course.isPopular && (
              <Badge variant="brand">{t("courses.popular")}</Badge>
            )}
          </div>
          {onSaveToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onSaveToggle();
              }}
              aria-label={t("courses.saveCourse")}
              className="grid size-8 place-items-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
            >
              <Bookmark
                className={cn("size-4", saved && "fill-primary text-primary")}
              />
            </button>
          )}
        </div>
        <div className="absolute bottom-3 start-3">
          <Badge variant="muted" className="bg-white/90 text-slate-700">
            {t(`levels.${course.level}`)}
          </Badge>
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-medium text-primary">
            <BookOpen className="size-3.5" /> {subject}
          </span>
          <StarRating rating={course.rating} showValue />
        </div>

        <Link href={detailHref}>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
            {title}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <GraduationCap className="size-3.5" /> {course.teacherName}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {course.durationHours}
            {t("common.hours")}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" /> {course.studentsCount}
          </span>
        </div>

        {status === "active" && typeof progress === "number" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">{t("record.progress")}</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-base font-bold text-foreground">
            {formatPrice(course.price, locale)}
          </span>

          {status === "active" ? (
            <Button asChild size="sm" variant="default" className="gap-1.5">
              <Link href={detailHref}>
                {t("courses.continue")}
                <ArrowRight className="size-4 rtl-flip" />
              </Link>
            </Button>
          ) : status === "saved" ? (
            <Button
              size="sm"
              variant="brand"
              className="gap-1.5"
              onClick={onJoin}
            >
              {t("courses.join")}
            </Button>
          ) : onJoin ? (
            <Button size="sm" variant="brand" onClick={onJoin}>
              {t("courses.join")}
            </Button>
          ) : (
            <Button asChild size="sm" variant="brand">
              <Link href={detailHref}>{t("courses.viewDetails")}</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
