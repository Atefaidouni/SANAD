"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CourseCard } from "@/components/shared/course-card";
import { CourseGridSkeleton } from "@/components/shared/course-card-skeleton";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useHydrated, useSession, useStore } from "@/lib/mock/use-store";
import type { Course } from "@/lib/types";

type Tab = "active" | "saved";

export default function MyCoursesPage() {
  const { t, locale } = useI18n();
  const store = useStore();
  const session = useSession();
  const hydrated = useHydrated();
  const router = useRouter();
  const userId = session?.user.id ?? "";

  const enrollments = store.getEnrollments(userId);
  const activeCount = enrollments.filter((e) => e.enrollment.status === "active").length;
  const savedCount = enrollments.filter((e) => e.enrollment.status === "saved").length;

  const [tab, setTab] = useState<Tab>(activeCount > 0 ? "active" : "saved");
  const [query, setQuery] = useState("");

  const matches = (c: Course) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const title = (locale === "ar" && c.titleAr ? c.titleAr : c.title).toLowerCase();
    return (
      title.includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.teacherName.toLowerCase().includes(q)
    );
  };

  const list = enrollments
    .filter((e) => e.enrollment.status === tab && matches(e.course))
    .map((e) => e);

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: "active", label: t("courses.active"), count: activeCount },
    { value: "saved", label: t("courses.saved"), count: savedCount },
  ];

  return (
    <DashboardShell
      role="student"
      title={t("courses.myJourney")}
      subtitle={t("courses.myJourneySub")}
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <TabsList>
            {tabs.map((tb) => (
              <TabsTrigger key={tb.value} value={tb.value} className="gap-1.5">
                {tb.label}
                {tb.count > 0 && (
                  <Badge variant="muted" className="px-1.5 py-0 text-[10px]">
                    {tb.count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t("dashboard.search")}
            className="w-full sm:w-64"
          />
        </div>

        <TabsContent value={tab} className="mt-0">
          {!hydrated ? (
            <CourseGridSkeleton />
          ) : list.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={tab === "active" ? t("dashboard.noActive") : t("dashboard.noSaved")}
              description={t("courses.onlyActiveSaved")}
              action={
                <Button variant="brand" onClick={() => router.push("/courses")}>
                  {t("nav.browseCourses")}
                </Button>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((e, i) => (
                <CourseCard
                  key={e.course.id}
                  course={e.course}
                  index={i}
                  status={e.enrollment.status === "active" ? "active" : "saved"}
                  progress={e.enrollment.progressPercent}
                  saved={e.enrollment.status === "saved"}
                  onSaveToggle={
                    e.enrollment.status === "active"
                      ? undefined
                      : () => store.unsaveCourse(userId, e.course.id)
                  }
                  onJoin={
                    e.enrollment.status === "active"
                      ? undefined
                      : () => router.push(`/courses/${e.course.id}`)
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
