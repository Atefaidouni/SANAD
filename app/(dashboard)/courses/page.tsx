"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CourseCard } from "@/components/shared/course-card";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";
import { cn } from "@/lib/utils";
import type { Course, Level } from "@/lib/types";

type LevelFilter = "all" | Level;
const LEVEL_FILTERS: LevelFilter[] = ["all", "middle", "high", "exam"];

export default function BrowseCoursesPage() {
  const { t, locale } = useI18n();
  const store = useStore();
  const session = useSession();
  const router = useRouter();
  const userId = session?.user.id ?? "";

  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LevelFilter>("all");

  const matches = (c: Course) => {
    if (level !== "all" && c.level !== level) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const title = (locale === "ar" && c.titleAr ? c.titleAr : c.title).toLowerCase();
    const subject = (locale === "ar" && c.subjectAr ? c.subjectAr : c.subject).toLowerCase();
    return (
      title.includes(q) ||
      subject.includes(q) ||
      c.teacherName.toLowerCase().includes(q)
    );
  };

  const courses = store.getCourses().filter(matches);

  return (
    <DashboardShell
      role={session?.user.role ?? "student"}
      title={t("courses.catalog")}
      subtitle={t("courses.catalogSub")}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Level filter */}
          <div className="flex flex-wrap gap-2">
            {LEVEL_FILTERS.map((lf) => (
              <Button
                key={lf}
                size="sm"
                variant={level === lf ? "brand" : "outline"}
                className={cn("rounded-full", level === lf && "shadow-brand")}
                onClick={() => setLevel(lf)}
              >
                {lf === "all" ? t("common.all") : t(`levels.${lf}`)}
              </Button>
            ))}
          </div>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t("dashboard.search")}
            className="w-full sm:w-72"
          />
        </div>

        {courses.length === 0 ? (
          <EmptyState icon={BookOpen} title={t("common.noResults")} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course, i) => {
              const enrollment = store.getEnrollment(userId, course.id);
              const status =
                enrollment?.status === "active"
                  ? "active"
                  : enrollment?.status === "saved"
                    ? "saved"
                    : "catalog";
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={i}
                  status={status}
                  progress={enrollment?.progressPercent}
                  saved={status === "saved"}
                  onSaveToggle={
                    status === "active"
                      ? undefined
                      : () =>
                          status === "saved"
                            ? store.unsaveCourse(userId, course.id)
                            : store.saveCourse(userId, course.id)
                  }
                  onJoin={
                    status === "active"
                      ? undefined
                      : () => router.push(`/courses/${course.id}`)
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
