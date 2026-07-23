"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StudentsTable } from "@/components/admin/students-table";
import { ExportRosterButton } from "@/components/admin/export-roster-button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";

export default function AdminStudentsPage() {
  const { t } = useI18n();
  const store = useStore();
  const rows = store.getStudentRows();

  return (
    <DashboardShell
      role="admin"
      title={t("admin.studentsTable")}
      subtitle={t("admin.subtitle")}
      actions={
        <ExportRosterButton rows={rows} title={t("admin.studentsTable")} showCourse />
      }
    >
      <Card>
        <CardContent className="p-4 sm:p-6">
          <StudentsTable rows={rows} showCourse searchable />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
