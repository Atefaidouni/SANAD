"use client";

import Image from "next/image";
import Link from "next/link";
import { KeyRound, Pencil, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { formatPrice } from "@/lib/utils";
import type { CourseWithMeta } from "@/lib/types";

export function AdminCourseCard({ course }: { course: CourseWithMeta }) {
  const { t, locale } = useI18n();
  const title = locale === "ar" && course.titleAr ? course.titleAr : course.title;
  const href = `/admin/courses/${course.id}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:shadow-brand">
      <Link href={href} className="relative block aspect-[16/9] overflow-hidden">
        <Image
          src={course.thumbnail || ""}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
        <Badge variant="muted" className="absolute bottom-2 start-2 bg-white/90 text-slate-700">
          {t(`levels.${course.level}`)}
        </Badge>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium text-primary">{course.subject}</span>
          <span className="font-bold text-foreground">{formatPrice(course.price, locale)}</span>
        </div>
        <Link href={href}>
          <h3 className="line-clamp-2 font-semibold leading-snug transition-colors group-hover:text-primary">
            {title}
          </h3>
        </Link>

        {/* Code + student stats */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-lg bg-secondary/10 px-2 py-1 font-medium text-secondary">
            <KeyRound className="size-3.5" />
            {course.usedCodes}/{course.totalCodes} {t("admin.codes.used")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 font-medium text-muted-foreground">
            <Users className="size-3.5" />
            {course.studentsCount}
          </span>
        </div>

        <Button asChild variant="outline" size="sm" className="mt-auto w-full gap-1.5">
          <Link href={href}>
            <Pencil className="size-4" />
            {t("common.edit")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
