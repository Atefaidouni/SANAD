"use client";

import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, Plus, RefreshCw } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CourseForm } from "@/components/admin/course-form";
import { RecordsManager } from "@/components/course/records-manager";
import { SecretCodeList } from "@/components/shared/secret-code-list";
import { StudentsTable } from "@/components/admin/students-table";
import { ExportRosterButton } from "@/components/admin/export-roster-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";

export default function CourseEditorPage({ params }: { params: { id: string } }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const store = useStore();

  const course = store.getCourseWithMeta(params.id);
  if (!course) return notFound();

  const title = locale === "ar" && course.titleAr ? course.titleAr : course.title;
  const codes = store.getCodes(params.id);
  const rows = store.getStudentRows(params.id);

  return (
    <DashboardShell role="admin" title={title} subtitle={t("admin.manageCourses")}>
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link href="/admin/courses">
            <ArrowLeft className="size-4 rtl-flip" />
            {t("admin.manageCourses")}
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          {/* Edit form */}
          <Card>
            <CardHeader>
              <CardTitle>{t("common.edit")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CourseForm
                mode="edit"
                course={course}
                onDone={() => router.push("/admin/courses")}
              />
            </CardContent>
          </Card>

          {/* Secret codes panel */}
          <Card className="lg:sticky lg:top-20 lg:self-start">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="size-5 text-primary" />
                  <span className="font-arabic">{t("admin.codes.title")}</span>
                </CardTitle>
                <Badge variant="secondary">
                  {t("admin.codes.summary", {
                    used: course.usedCodes,
                    available: course.availableCodes,
                    total: course.totalCodes,
                  })}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{t("admin.codes.subtitle")}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    store.addCodes(params.id, 5);
                    toast.success(t("admin.codes.addMore"));
                  }}
                >
                  <Plus className="size-4" />
                  {t("admin.codes.addMore")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    store.regenerateCodes(params.id);
                    toast.success(t("admin.codes.regenerate"));
                  }}
                >
                  <RefreshCw className="size-4" />
                  {t("admin.codes.regenerate")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[28rem] overflow-y-auto scroll-thin pe-1">
                <SecretCodeList
                  codes={codes}
                  resolveUser={(id) => store.getUser(id)}
                  onRevoke={(codeId) => store.revokeCode(codeId)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course records / lessons */}
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.records.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("admin.records.subtitle")}</p>
          </CardHeader>
          <CardContent>
            <RecordsManager courseId={params.id} />
          </CardContent>
        </Card>

        {/* Enrolled students */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <span className="font-arabic">{t("admin.studentsTable")}</span>
                <Badge variant="muted">{rows.length}</Badge>
              </CardTitle>
              <ExportRosterButton
                rows={rows}
                title={title}
                subtitle={t(`levels.${course.level}`)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <StudentsTable rows={rows} showCourse={false} searchable={rows.length > 4} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
