"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BarChart3, Copy, FileQuestion, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { Modal } from "@/components/shared/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";

export function TeacherQuizList({ courseId }: { courseId: string }) {
  const { t, locale } = useI18n();
  const store = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const quizzes = store.getQuizzes(courseId);

  const onCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    const res = await store.createQuiz(courseId, title.trim());
    setCreating(false);
    if (!res.ok || !res.data) {
      toast.error(t("quiz.errors.generic"));
      return;
    }
    setOpen(false);
    setTitle("");
    router.push(`/teacher/courses/${courseId}/quizzes/${res.data.quizId}`);
  };

  const onDuplicate = async (id: string) => {
    const res = await store.duplicateQuiz(id);
    toast[res.ok ? "success" : "error"](res.ok ? t("quiz.list.duplicated") : t("quiz.errors.generic"));
  };

  const onTogglePublish = (id: string, status: "draft" | "published") => {
    store.updateQuiz(id, { status: status === "published" ? "draft" : "published" });
    toast.success(status === "published" ? t("quiz.list.unpublished") : t("quiz.list.published"));
  };

  const onDelete = async (id: string) => {
    const res = await store.deleteQuiz(id);
    if (!res.ok) toast.error(t("quiz.errors.generic"));
    setConfirmDeleteId(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="size-5 text-primary" /> {t("quiz.list.title")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{t("quiz.list.subtitle")}</p>
          </div>
          <Button size="sm" variant="brand" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> {t("quiz.list.newQuiz")}
          </Button>
        </CardHeader>
        <CardContent>
          {quizzes.length === 0 ? (
            <EmptyState icon={FileQuestion} title={t("quiz.list.empty")} />
          ) : (
            <ul className="space-y-2">
              {quizzes.map((q) => {
                const qTitle = locale === "ar" && q.titleAr ? q.titleAr : q.title;
                return (
                  <li
                    key={q.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{qTitle}</p>
                        <Badge variant={q.status === "published" ? "success" : "muted"}>
                          {t(`quiz.status.${q.status}`)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("quiz.list.questionCount", { count: q.questionCount })} ·{" "}
                        {t("quiz.list.attemptCount", { count: store.getQuizAttempts(q.id).length })}
                      </p>
                    </div>

                    {confirmDeleteId === q.id ? (
                      <div className="flex items-center gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>
                          {t("common.cancel")}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(q.id)}>
                          {t("common.delete")}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/teacher/courses/${courseId}/quizzes/${q.id}`}>{t("common.edit")}</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                          <Link href={`/teacher/courses/${courseId}/quizzes/${q.id}/results`}>
                            <BarChart3 className="size-3.5" /> {t("quiz.list.results")}
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onDuplicate(q.id)}>
                          <Copy className="size-3.5" /> {t("quiz.list.duplicate")}
                        </Button>
                        <Button
                          variant={q.status === "published" ? "outline" : "brand"}
                          size="sm"
                          onClick={() => onTogglePublish(q.id, q.status)}
                        >
                          {q.status === "published" ? t("quiz.list.unpublish") : t("quiz.list.publish")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setConfirmDeleteId(q.id)}
                          aria-label={t("common.delete")}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Modal open={open} onOpenChange={setOpen} title={t("quiz.list.newQuiz")}>
        <FormField label={t("quiz.builder.title")}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </FormField>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button variant="brand" onClick={onCreate} disabled={creating || !title.trim()}>
            {t("common.create")}
          </Button>
        </div>
      </Modal>
    </>
  );
}
