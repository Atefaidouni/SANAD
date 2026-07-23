"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Eye, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import type { Course } from "@/lib/types";

export function TeacherCourseCard({
  course,
  assigned,
}: {
  course: Course;
  assigned: boolean;
}) {
  const { t, locale } = useI18n();
  const title = locale === "ar" && course.titleAr ? course.titleAr : course.title;
  const href = `/teacher/courses/${course.id}`;

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
        {assigned && (
          <Badge variant="brand" className="absolute end-2 top-2 gap-1">
            <BadgeCheck className="size-3" /> {t("teacher.myCourses")}
          </Badge>
        )}
        <Badge variant="muted" className="absolute bottom-2 start-2 bg-white/90 text-slate-700">
          {t(`levels.${course.level}`)}
        </Badge>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium text-primary">{course.subject}</p>
        <Link href={href}>
          <h3 className="line-clamp-2 font-semibold leading-snug transition-colors group-hover:text-primary">
            {title}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground">{course.teacherName}</p>
        <Button
          asChild
          variant={assigned ? "brand" : "outline"}
          size="sm"
          className="mt-auto w-full gap-1.5"
        >
          <Link href={href}>
            {assigned ? <Pencil className="size-4" /> : <Eye className="size-4" />}
            {assigned ? t("teacher.manage") : t("teacher.view")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
