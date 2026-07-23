"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, Check, GraduationCap, Trash2, X } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";
import { cn, initials } from "@/lib/utils";

export default function AdminTeachersPage() {
  const { t } = useI18n();
  const store = useStore();
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const teachers = store.getTeachers().filter((u) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardShell role="admin" title={t("admin.teachers.title")} subtitle={t("admin.teachers.subtitle")}>
      <div className="space-y-5">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t("admin.teachers.search")}
          className="sm:max-w-sm"
        />

        {teachers.length === 0 ? (
          <EmptyState icon={GraduationCap} title={t("admin.teachers.empty")} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => {
              const courseCount = store.getCoursesByTeacherEmail(teacher.email).length;
              return (
                <Card key={teacher.id}>
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-12">
                        <AvatarImage src={teacher.avatar ?? undefined} />
                        <AvatarFallback>{initials(teacher.firstName, teacher.lastName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">
                          {teacher.firstName} {teacher.lastName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground" dir="ltr">
                          {teacher.email}
                        </p>
                        <Badge
                          variant={teacher.approved ? "success" : "muted"}
                          className={cn("mt-1.5 gap-1")}
                        >
                          {teacher.approved ? <BadgeCheck className="size-3" /> : null}
                          {teacher.approved ? t("admin.teachers.approved") : t("admin.teachers.pending")}
                        </Badge>
                      </div>
                    </div>

                    {teacher.bio && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{teacher.bio}</p>
                    )}

                    {confirmId === teacher.id ? (
                      <div className="flex items-center justify-between gap-2 rounded-lg bg-destructive/10 p-2">
                        <span className="ps-1 text-xs font-medium text-destructive">
                          {t("admin.teachers.deleteConfirm")}
                        </span>
                        <div className="flex gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmId(null)}
                          >
                            {t("common.cancel")}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => {
                              store.deleteTeacher(teacher.id);
                              toast.success(t("admin.teachers.deletedToast"));
                              setConfirmId(null);
                            }}
                          >
                            <Trash2 className="size-4" />
                            {t("admin.teachers.delete")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          {t("admin.teachers.courses", { count: courseCount })}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {teacher.approved ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-destructive hover:text-destructive"
                              onClick={() => {
                                store.setTeacherApproved(teacher.id, false);
                                toast.success(t("admin.teachers.rejectedToast"));
                              }}
                            >
                              <X className="size-4" />
                              {t("admin.teachers.revoke")}
                            </Button>
                          ) : (
                            <Button
                              variant="brand"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => {
                                store.setTeacherApproved(teacher.id, true);
                                toast.success(t("admin.teachers.approvedToast"));
                              }}
                            >
                              <Check className="size-4" />
                              {t("admin.teachers.approve")}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => setConfirmId(teacher.id)}
                            aria-label={t("admin.teachers.delete")}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
