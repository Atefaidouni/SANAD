"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Users } from "lucide-react";
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
  const myStudents = myCourses.reduce(
    (sum, c) => sum + store.getStudentRows(c.id).length,
    0
  );
  const totalCourses = store.getCourses().length;

  return (
    <DashboardShell
      role="teacher"
      title={t("teacher.title")}
      subtitle={t("teacher.subtitle")}
      actions={<TeacherAddCourseButton />}
    >
      <div className="space-y-8">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatTile index={0} icon={BookOpen} label={t("teacher.myCourses")} value={myCourses.length} accent />
          <StatTile index={1} icon={Users} label={t("admin.totalStudents")} value={myStudents} />
          <StatTile index={2} icon={GraduationCap} label={t("teacher.allCourses")} value={totalCourses} />
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
