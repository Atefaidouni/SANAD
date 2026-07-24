"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Lock, Video } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RecordsManager } from "@/components/course/records-manager";
import { ForumSection } from "@/components/course/forum-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";

export default function TeacherCoursePage() {
  const { t, locale } = useI18n();
  const store = useStore();
  const session = useSession();
  const params = useParams();
  const id = params?.id as string | undefined;
  if (!id) return notFound();

  const course = store.getCourseWithMeta(id);
  if (!course) return notFound();

  // Assigned teacher (or admin) — may view content and reply to students.
  const canReply = store.canManageCourse(session?.user.id, id);
  const title = locale === "ar" && course.titleAr ? course.titleAr : course.title;

  return (
    <DashboardShell role="teacher" title={title} subtitle={t(`levels.${course.level}`)}>
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link href="/teacher/courses">
            <ArrowLeft className="size-4 rtl-flip" />
            {t("teacher.allCourses")}
          </Link>
        </Button>

        {!canReply ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <Lock className="size-7" />
              </span>
              <p className="font-semibold">{t("teacher.notAssigned")}</p>
              <p className="max-w-md text-sm text-muted-foreground">{course.teacherName}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Live link — read-only (the admin sets it) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="size-5 text-primary" /> {t("record.liveSession")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.zoomUrl ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="truncate text-sm text-muted-foreground" dir="ltr">
                      {course.zoomUrl}
                    </span>
                    <Button asChild variant="brand" className="gap-1.5">
                      <a href={course.zoomUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4 rtl-flip" />
                        {t("teacher.joinLive")}
                      </a>
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("teacher.noLiveYet")}</p>
                )}
              </CardContent>
            </Card>

            {/* Records — read-only */}
            <Card>
              <CardHeader>
                <CardTitle>{t("teacher.records")}</CardTitle>
                <p className="text-sm text-muted-foreground">{t("teacher.recordsView")}</p>
              </CardHeader>
              <CardContent>
                <RecordsManager courseId={id} readOnly />
              </CardContent>
            </Card>

            {/* Forum — teacher replies to student questions */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <p className="mb-4 text-sm text-muted-foreground">{t("teacher.replyAccess")}</p>
                <ForumSection courseId={id} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
