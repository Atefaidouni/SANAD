"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  BookMarked,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CourseCard } from "@/components/shared/course-card";
import { GoldPackCard } from "@/components/dashboard/gold-pack-card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";
import type { Course } from "@/lib/types";

function SectionHead({
  title,
  href,
  viewAll,
}: {
  title: string;
  href?: string;
  viewAll?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {href && (
        <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
          <Link href={href}>
            {viewAll}
            <ArrowRight className="size-4 rtl-flip" />
          </Link>
        </Button>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const store = useStore();
  const session = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const userId = session?.user.id ?? "";
  const enrollments = store.getEnrollments(userId);

  const active = enrollments.filter((e) => e.enrollment.status === "active");
  const saved = enrollments.filter((e) => e.enrollment.status === "saved");

  const stats = useMemo(() => {
    const lessonsCompleted = active.reduce(
      (sum, e) => sum + e.enrollment.completedLessonIds.length,
      0
    );
    const hours = active.reduce((sum, e) => sum + e.course.durationHours, 0);
    const avg =
      active.length > 0
        ? Math.round(
            active.reduce((s, e) => s + e.enrollment.progressPercent, 0) / active.length
          )
        : 0;
    return { enrolled: active.length, lessonsCompleted, hours, avg };
  }, [active]);

  const matches = (c: Course) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const title = (locale === "ar" && c.titleAr ? c.titleAr : c.title).toLowerCase();
    return (
      title.includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.teacherName.toLowerCase().includes(q)
    );
  };

  const searchResults = query.trim()
    ? enrollments.filter((e) => matches(e.course))
    : [];

  const topActive = active[0];

  return (
    <DashboardShell role="student" title={t("nav.dashboard")} subtitle={t("dashboard.welcomeSub")}>
      <div className="space-y-8">
        {/* Welcome banner */}
        <Reveal className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-brand sm:p-8">
          <div className="grid-pattern absolute inset-0 opacity-20" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <Badge className="bg-white/20 text-white backdrop-blur">
                <Sparkles className="size-3.5" /> {t("common.appNameFull")}
              </Badge>
              <h1 className="text-2xl font-bold sm:text-3xl">
                {t("dashboard.welcome", { name: session?.user.firstName ?? "" })}
              </h1>
              <p className="max-w-md text-white/85">{t("dashboard.welcomeSub")}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {topActive && (
                  <Button asChild className="gap-2 bg-white text-primary hover:bg-white/90">
                    <Link href={`/courses/${topActive.course.id}`}>
                      {t("dashboard.continueLearning")}
                      <ArrowRight className="size-4 rtl-flip" />
                    </Link>
                  </Button>
                )}
                <Button
                  asChild
                  variant="outline"
                  className="gap-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <Link href="/courses">
                    {t("nav.browseCourses")}
                    <ArrowRight className="size-4 rtl-flip" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="w-full max-w-sm">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder={t("dashboard.search")}
                className="[&_input]:border-white/30 [&_input]:bg-white/15 [&_input]:text-white [&_input]:placeholder:text-white/70"
              />
            </div>
          </div>
        </Reveal>

        {query.trim() ? (
          /* Search results */
          <section>
            <SectionHead title={`${t("common.search")}: “${query}”`} />
            {searchResults.length === 0 ? (
              <EmptyState icon={BookOpen} title={t("common.noResults")} />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((e, i) => (
                  <CourseCard
                    key={e.course.id}
                    course={e.course}
                    index={i}
                    status={e.enrollment.status === "active" ? "active" : "saved"}
                    progress={e.enrollment.progressPercent}
                    saved={e.enrollment.status === "saved"}
                    onJoin={() => router.push(`/courses/${e.course.id}`)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Stats */}
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatTile index={0} icon={GraduationCap} label={t("dashboard.stats.enrolled")} value={stats.enrolled} accent />
              <StatTile index={1} icon={CheckCircle2} label={t("dashboard.stats.completed")} value={stats.lessonsCompleted} />
              <StatTile index={2} icon={Clock} label={t("dashboard.stats.hours")} value={`${stats.hours}${t("common.hours")}`} />
              <StatTile index={3} icon={BarChart3} label={t("dashboard.stats.avgProgress")} value={`${stats.avg}%`} />
            </section>

            {/* Gold pack */}
            <GoldPackCard />

            {/* Active courses */}
            <section>
              <SectionHead
                title={t("dashboard.activeCourses")}
                href="/my-courses"
                viewAll={t("common.viewAll")}
              />
              {active.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title={t("dashboard.noActive")}
                  action={
                    <Button asChild variant="brand">
                      <Link href="/my-courses">{t("dashboard.browseCta")}</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {active.map((e, i) => (
                    <CourseCard
                      key={e.course.id}
                      course={e.course}
                      index={i}
                      status="active"
                      progress={e.enrollment.progressPercent}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Saved courses */}
            <section>
              <SectionHead title={t("dashboard.savedCourses")} />
              {saved.length === 0 ? (
                <EmptyState icon={BookMarked} title={t("dashboard.noSaved")} />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {saved.map((e, i) => (
                    <CourseCard
                      key={e.course.id}
                      course={e.course}
                      index={i}
                      status="saved"
                      saved
                      onSaveToggle={() => store.unsaveCourse(userId, e.course.id)}
                      onJoin={() => router.push(`/courses/${e.course.id}`)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
