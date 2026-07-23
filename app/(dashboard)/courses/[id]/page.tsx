"use client";

import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CourseDetail } from "@/components/course/course-detail";
import { CourseRecord } from "@/components/course/course-record";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";

export default function CoursePage({ params }: { params: { id: string } }) {
  const { locale } = useI18n();
  const store = useStore();
  const session = useSession();

  const course = store.getCourseWithMeta(params.id);
  if (!course) return notFound();

  const userId = session?.user.id ?? "";
  const enrollment = store.getEnrollment(userId, params.id);
  const isActive = enrollment?.status === "active";

  const title = locale === "ar" && course.titleAr ? course.titleAr : course.title;

  return (
    <DashboardShell role={session?.user.role ?? "student"} title={title}>
      {isActive && enrollment ? (
        <CourseRecord course={course} enrollment={enrollment} />
      ) : (
        <CourseDetail course={course} />
      )}
    </DashboardShell>
  );
}
