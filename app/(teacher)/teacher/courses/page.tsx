"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TeacherCourseCard } from "@/components/teacher/teacher-course-card";
import { TeacherAddCourseButton } from "@/components/teacher/teacher-add-course-button";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";
import type { Course } from "@/lib/types";

type Tab = "mine" | "all";

export default function TeacherCoursesPage() {
  const { t, locale } = useI18n();
  const store = useStore();
  const session = useSession();
  const email = session?.user.email ?? "";
  const [tab, setTab] = useState<Tab>("mine");
  const [query, setQuery] = useState("");

  const matches = (c: Course) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const title = (locale === "ar" && c.titleAr ? c.titleAr : c.title).toLowerCase();
    return title.includes(q) || c.subject.toLowerCase().includes(q);
  };

  const allCourses = store.getCourses();
  const myCourses = allCourses.filter((c) => c.teacherEmail === email);

  const list = (tab === "mine" ? myCourses : allCourses).filter(matches);

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: "mine", label: t("teacher.myCourses"), count: myCourses.length },
    { value: "all", label: t("teacher.allCourses"), count: allCourses.length },
  ];

  return (
    <DashboardShell
      role="teacher"
      title={t("teacher.allCourses")}
      subtitle={t("teacher.subtitle")}
      actions={<TeacherAddCourseButton />}
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
            placeholder={t("common.searchPlaceholder")}
            className="w-full sm:max-w-sm"
          />
        </div>

        <TabsContent value={tab} className="mt-0">
          {list.length === 0 ? (
            tab === "mine" ? (
              <EmptyState
                icon={BookOpen}
                title={t("teacher.noCourses")}
                description={t("teacher.noCoursesAction")}
                action={<TeacherAddCourseButton />}
              />
            ) : (
              <EmptyState icon={BookOpen} title={t("common.noResults")} />
            )
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((c) => (
                <TeacherCourseCard key={c.id} course={c} assigned={c.teacherEmail === email} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
