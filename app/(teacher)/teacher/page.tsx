"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatTile } from "@/components/dashboard/stat-tile";
import { TeacherCourseCard } from "@/components/teacher/teacher-course-card";
import { TeacherAddCourseButton } from "@/components/teacher/teacher-add-course-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";

export default function TeacherOverviewPage() {
  const { t } = useI18n();
  const store = useStore();
  const session = useSession();
  const email = session?.user.email ?? "";

  const myCourses = store.getCoursesByTeacherEmail(email);

  return (
    <DashboardShell
      role="teacher"
      title={t("teacher.title")}
      subtitle={t("teacher.subtitle")}
      actions={<TeacherAddCourseButton />}
    >
      <div className="space-y-8">
        <section className="max-w-xs">
          <StatTile index={0} icon={BookOpen} label={t("teacher.myCourses")} value={myCourses.length} accent />
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight">{t("teacher.myCourses")}</h2>
              <p className="text-sm text-muted-foreground">{t("teacher.myCoursesSub")}</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <Link href="/teacher/courses">
                {t("teacher.allCourses")}
                <ArrowRight className="size-4 rtl-flip" />
              </Link>
            </Button>
          </div>

          {myCourses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={t("teacher.noCourses")}
              description={t("teacher.noCoursesAction")}
              action={<TeacherAddCourseButton />}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {myCourses.map((c) => (
                <TeacherCourseCard key={c.id} course={c} assigned />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
