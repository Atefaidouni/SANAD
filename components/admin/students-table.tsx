"use client";

import { useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { useI18n } from "@/lib/i18n/provider";
import { formatDate, initials } from "@/lib/utils";
import type { StudentRow } from "@/lib/types";

export function StudentsTable({
  rows,
  showCourse = true,
  searchable = true,
}: {
  rows: StudentRow[];
  showCourse?: boolean;
  searchable?: boolean;
}) {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");

  const filtered = rows.filter((r) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      `${r.user.firstName} ${r.user.lastName}`.toLowerCase().includes(q) ||
      r.user.email.toLowerCase().includes(q) ||
      (r.code?.code.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="space-y-4">
      {searchable && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t("admin.searchStudents")}
          className="sm:max-w-sm"
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title={t("common.noResults")} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-start text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-start font-semibold">{t("admin.studentsTableCols.student")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("admin.studentsTableCols.code")}</th>
                  <th className="hidden px-4 py-3 text-start font-semibold sm:table-cell">
                    {t("admin.studentsTableCols.email")}
                  </th>
                  {showCourse && (
                    <th className="hidden px-4 py-3 text-start font-semibold lg:table-cell">
                      {t("admin.studentsTableCols.course")}
                    </th>
                  )}
                  <th className="px-4 py-3 text-start font-semibold">{t("admin.studentsTableCols.progress")}</th>
                  <th className="hidden px-4 py-3 text-start font-semibold md:table-cell">
                    {t("admin.studentsTableCols.joined")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.enrollment.id} className="bg-card transition-colors hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarImage src={r.user.avatar ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {initials(r.user.firstName, r.user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {r.user.firstName} {r.user.lastName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground sm:hidden" dir="ltr">
                            {r.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {r.code ? (
                        <Badge variant="secondary" className="font-mono">
                          <span dir="ltr">{r.code.code}</span>
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell" dir="ltr">
                      {r.user.email}
                    </td>
                    {showCourse && (
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <Link
                          href={`/admin/courses/${r.course.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {r.course.title}
                        </Link>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={r.enrollment.progressPercent} className="h-1.5 w-16" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {r.enrollment.progressPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {formatDate(r.enrollment.createdAt, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
