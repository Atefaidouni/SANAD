"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminCourseCard } from "@/components/admin/admin-course-card";
import { AddCourseButton } from "@/components/admin/add-course-button";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { BookOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";

export default function AdminCoursesPage() {
  const { t, locale } = useI18n();
  const store = useStore();
  const [query, setQuery] = useState("");

  const courses = store
    .getCourses()
    .map((c) => store.getCourseWithMeta(c.id)!)
    .filter((c) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      const title = (locale === "ar" && c.titleAr ? c.titleAr : c.title).toLowerCase();
      return title.includes(q) || c.subject.toLowerCase().includes(q) || c.teacherName.toLowerCase().includes(q);
    });

  return (
    <DashboardShell
      role="admin"
      title={t("admin.manageCourses")}
      subtitle={t("admin.subtitle")}
      actions={<AddCourseButton />}
    >
      <div className="space-y-6">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t("common.searchPlaceholder")}
          className="sm:max-w-sm"
        />
        {courses.length === 0 ? (
          <EmptyState icon={BookOpen} title={t("common.noResults")} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((c) => (
              <AdminCourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
