"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Copy,
  GraduationCap,
  KeyRound,
  PlayCircle,
  Video,
} from "lucide-react";
import { ForumSection } from "./forum-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";
import { cn } from "@/lib/utils";
import type { CourseWithMeta, Enrollment } from "@/lib/types";

export function CourseRecord({
  course,
  enrollment,
}: {
  course: CourseWithMeta;
  enrollment: Enrollment;
}) {
  const { t, locale } = useI18n();
  const store = useStore();
  const session = useSession();
  const userId = session?.user.id ?? "";

  const title = locale === "ar" && course.titleAr ? course.titleAr : course.title;

  const boundCode = enrollment.courseCodeId
    ? store.getCodes(course.id).find((c) => c.id === enrollment.courseCodeId)
    : null;
  const completed = new Set(enrollment.completedLessonIds);

  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    if (!boundCode) return;
    navigator.clipboard?.writeText(boundCode.code);
    setCopied(true);
    toast.success(t("admin.codes.copied"));
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1.5">
        <Link href="/my-courses">
          <ArrowLeft className="size-4 rtl-flip" />
          {t("nav.myCourses")}
        </Link>
      </Button>

      {/* Live session header */}
      <Card className="overflow-hidden border-0 bg-brand-gradient text-white shadow-brand">
        <CardContent className="relative space-y-3 p-6 sm:p-8">
          <div className="grid-pattern absolute inset-0 opacity-20" />
          <div className="relative space-y-3">
            <Badge className="border-0 bg-white/20 text-white backdrop-blur">
              {t("record.title")}
            </Badge>
            <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
            <p className="inline-flex items-center gap-2 text-white/85">
              <GraduationCap className="size-4" /> {course.teacherName}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild className="gap-2 bg-white text-primary hover:bg-white/90">
                <a href={course.zoomUrl || "#"} target="_blank" rel="noopener noreferrer">
                  <Video className="size-4" /> {t("record.joinLive")}
                </a>
              </Button>
              {boundCode && (
                <button
                  onClick={copyCode}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/20"
                >
                  <KeyRound className="size-4" />
                  <span className="font-mono" dir="ltr">{boundCode.code}</span>
                  {copied ? <Check className="size-4" /> : <Copy className="size-3.5 opacity-70" />}
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Recordings + Q&A */}
      <Tabs defaultValue="records" className="space-y-5">
        <TabsList className="flex-wrap">
          <TabsTrigger value="records">{t("record.records")}</TabsTrigger>
          <TabsTrigger value="forum">{t("record.qa")}</TabsTrigger>
        </TabsList>

        {/* Recordings */}
        <TabsContent value="records">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold">{t("record.records")}</h2>
                <span className="text-sm text-muted-foreground">
                  {course.totalLessons}
                </span>
              </div>
              <ul className="space-y-2">
                {course.lessons.map((lesson) => {
                  const done = completed.has(lesson.id);
                  const lTitle =
                    locale === "ar" && lesson.titleAr ? lesson.titleAr : lesson.title;
                  return (
                    <li
                      key={lesson.id}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-3 transition-colors",
                        done ? "border-secondary/30 bg-secondary/5" : "border-border"
                      )}
                    >
                      <PlayCircle className="size-5 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-sm font-medium", done && "text-muted-foreground")}>
                          {lTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lesson.durationMin}
                          {t("common.minutes")}
                        </p>
                      </div>
                      {lesson.videoUrl && (
                        <Button
                          asChild
                          size="sm"
                          variant="brand"
                          className="shrink-0 gap-1.5"
                        >
                          <a
                            href={lesson.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => store.completeLesson(userId, course.id, lesson.id)}
                          >
                            <PlayCircle className="size-4" />
                            {t("record.watch")}
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={done ? "secondary" : "outline"}
                        className="shrink-0 gap-1.5"
                        onClick={() => store.completeLesson(userId, course.id, lesson.id)}
                      >
                        <Check className="size-4" />
                        {done ? t("record.completed") : t("record.markComplete")}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Q&A — ask the teacher */}
        <TabsContent value="forum">
          <ForumSection courseId={course.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
