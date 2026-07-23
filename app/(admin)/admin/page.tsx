"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, KeyRound, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatTile } from "@/components/dashboard/stat-tile";
import { AdminCourseCard } from "@/components/admin/admin-course-card";
import { AddCourseButton } from "@/components/admin/add-course-button";
import { StudentsTable } from "@/components/admin/students-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/motion";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";
import { formatPrice } from "@/lib/utils";

export default function AdminOverviewPage() {
  const { t, locale } = useI18n();
  const store = useStore();

  const stats = store.getAdminStats();
  const courses = store
    .getCourses()
    .slice(0, 3)
    .map((c) => store.getCourseWithMeta(c.id)!)
    .filter(Boolean);
  const recentStudents = store.getStudentRows().slice(0, 5);

  return (
    <DashboardShell
      role="admin"
      title={t("admin.title")}
      subtitle={t("admin.subtitle")}
      actions={<AddCourseButton />}
    >
      <div className="space-y-8">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatTile index={0} icon={BookOpen} label={t("admin.totalCourses")} value={stats.totalCourses} accent />
          <StatTile index={1} icon={Users} label={t("admin.totalStudents")} value={stats.totalStudents} />
          <StatTile index={2} icon={KeyRound} label={t("admin.totalCodes")} value={stats.totalCodes} />
          <StatTile index={3} icon={CheckCircle2} label={t("admin.usedCodes")} value={stats.usedCodes} />
          <StatTile
            index={4}
            icon={TrendingUp}
            label={t("admin.revenue")}
            value={formatPrice(stats.revenue, locale)}
          />
        </section>

        {/* Courses preview */}
        <Reveal>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">{t("admin.courses")}</h2>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <Link href="/admin/courses">
                {t("admin.manageCourses")}
                <ArrowRight className="size-4 rtl-flip" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <AdminCourseCard key={c.id} course={c} />
            ))}
          </div>
        </Reveal>

        {/* Recent students */}
        <Reveal>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>{t("admin.recentStudents")}</CardTitle>
              <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                <Link href="/admin/students">
                  {t("common.viewAll")}
                  <ArrowRight className="size-4 rtl-flip" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <StudentsTable rows={recentStudents} searchable={false} />
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </DashboardShell>
  );
}
