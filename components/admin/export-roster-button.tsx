"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { printStudentRoster } from "@/lib/print-roster";
import { cn } from "@/lib/utils";
import type { StudentRow } from "@/lib/types";

/**
 * Admin/teacher control that exports an enrolled-students roster to PDF via the
 * browser print dialog ("Save as PDF").
 */
export function ExportRosterButton({
  rows,
  title,
  subtitle,
  showCourse = false,
  size = "sm",
  variant = "outline",
  className,
}: {
  rows: StudentRow[];
  title: string;
  subtitle?: string;
  showCourse?: boolean;
  size?: "sm" | "default";
  variant?: "outline" | "brand" | "ghost";
  className?: string;
}) {
  const { t, locale } = useI18n();

  return (
    <Button
      size={size}
      variant={variant}
      className={cn("gap-1.5", className)}
      disabled={rows.length === 0}
      onClick={() =>
        printStudentRoster({
          title,
          subtitle,
          rows,
          locale,
          showCourse,
          labels: {
            docTitle: `${t("common.appNameFull")} — ${title}`,
            brand: t("common.appNameFull"),
            rosterTitle: t("admin.studentsTable"),
            generatedOn: t("admin.generatedOn"),
            index: "#",
            student: t("admin.studentsTableCols.student"),
            email: t("admin.studentsTableCols.email"),
            code: t("admin.studentsTableCols.code"),
            course: t("admin.studentsTableCols.course"),
            progress: t("admin.studentsTableCols.progress"),
            joined: t("admin.studentsTableCols.joined"),
            empty: t("common.noResults"),
          },
        })
      }
    >
      <Printer className="size-4" />
      {t("admin.exportPdf")}
    </Button>
  );
}
