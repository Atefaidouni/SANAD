"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  CheckCircle2,
  Clock,
  Crown,
  GraduationCap,
  Layers,
  Lock,
  PlayCircle,
  Users,
  Video,
} from "lucide-react";
import { StarRating } from "@/components/shared/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";
import { cn, formatPrice } from "@/lib/utils";
import type { CourseWithMeta } from "@/lib/types";

export function CourseDetail({ course }: { course: CourseWithMeta }) {
  const { t, locale } = useI18n();
  const store = useStore();
  const session = useSession();
  const userId = session?.user.id ?? "";
  const router = useRouter();

  const title = locale === "ar" && course.titleAr ? course.titleAr : course.title;
  const subject = locale === "ar" && course.subjectAr ? course.subjectAr : course.subject;
  const description =
    locale === "ar" && course.descriptionAr ? course.descriptionAr : course.description;
  const saved = store.isSaved(userId, course.id);

  const meta = [
    { icon: GraduationCap, label: t("courses.teacher"), value: course.teacherName },
    { icon: BadgeCheck, label: t("courses.subject"), value: subject },
    { icon: Layers, label: t("courses.level"), value: t(`levels.${course.level}`) },
    { icon: Clock, label: t("courses.duration"), value: `${course.durationHours}${t("common.hours")}` },
    { icon: PlayCircle, label: t("record.lessons"), value: String(course.totalLessons) },
    { icon: Users, label: t("common.students"), value: String(course.studentsCount) },
  ];

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1.5">
        <Link href="/my-courses">
          <ArrowLeft className="size-4 rtl-flip" />
          {t("nav.myCourses")}
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-border shadow-soft"
          >
            <Image
              src={course.thumbnail || ""}
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
            <div className="absolute inset-x-5 bottom-5 space-y-2 text-white">
              <div className="flex flex-wrap gap-2">
                {course.isGoldPack && (
                  <Badge className="border-0 bg-brand-gold text-slate-900">
                    <Crown className="size-3" /> {t("courses.goldPack")}
                  </Badge>
                )}
                {course.isPopular && <Badge variant="brand">{t("courses.popular")}</Badge>}
                <Badge className="border-0 bg-white/20 backdrop-blur">
                  {t(`levels.${course.level}`)}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="size-4" /> {course.teacherName}
                </span>
                <StarRating rating={course.rating} showValue />
              </div>
            </div>
          </motion.div>

          {/* About */}
          {description && (
            <Card>
              <CardContent className="space-y-3 p-6">
                <h2 className="text-lg font-bold">{t("courses.about")}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                {course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {course.tags.map((tag) => (
                      <Badge key={tag} variant="muted">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Curriculum */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-bold">{t("courses.curriculum")}</h2>
              <ul className="space-y-1.5">
                {course.lessons.map((lesson, i) => {
                  const lTitle =
                    locale === "ar" && lesson.titleAr ? lesson.titleAr : lesson.title;
                  return (
                    <li
                      key={lesson.id}
                      className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-accent/40"
                    >
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold",
                          lesson.isPreview
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {lesson.isPreview ? <PlayCircle className="size-4" /> : <Lock className="size-3.5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          <span className="me-1.5 text-muted-foreground">{i + 1}.</span>
                          {lTitle}
                        </p>
                      </div>
                      {lesson.isPreview && (
                        <Badge variant="secondary" className="text-[10px]">
                          {t("courses.preview")}
                        </Badge>
                      )}
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {lesson.durationMin}
                        {t("common.minutes")}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Enroll sidebar */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-20">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{formatPrice(course.price, locale)}</span>
                {course.availableCodes > 0 && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="size-3" /> {course.availableCodes} {t("admin.codes.available")}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Button asChild variant="brand" size="lg" className="w-full">
                  <Link href={`/courses/${course.id}/join`}>{t("courses.join")}</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2"
                  onClick={() =>
                    saved
                      ? store.unsaveCourse(userId, course.id)
                      : store.saveCourse(userId, course.id)
                  }
                >
                  <Bookmark className={cn("size-4", saved && "fill-primary text-primary")} />
                  {saved ? t("courses.saved_") : t("courses.saveCourse")}
                </Button>
              </div>

              <Separator />

              <dl className="space-y-3">
                {meta.map((m) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label} className="flex items-center justify-between gap-3 text-sm">
                      <dt className="inline-flex items-center gap-2 text-muted-foreground">
                        <Icon className="size-4" /> {m.label}
                      </dt>
                      <dd className="truncate font-medium">{m.value}</dd>
                    </div>
                  );
                })}
              </dl>

              <Separator />

              <div className="flex items-center gap-2 rounded-xl bg-brand-gradient-soft p-3 text-sm text-primary">
                <Video className="size-4 shrink-0" />
                <span className="font-medium">{t("record.liveSession")} · Zoom</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
