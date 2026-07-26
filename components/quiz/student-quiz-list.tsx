"use client";

import Link from "next/link";
import { Clock, FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";

export function StudentQuizList({ courseId }: { courseId: string }) {
  const { t, locale } = useI18n();
  const store = useStore();
  const quizzes = store.getQuizzes(courseId);

  if (quizzes.length === 0) {
    return <EmptyState icon={FileQuestion} title={t("quiz.student.empty")} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {quizzes.map((q) => {
        const title = locale === "ar" && q.titleAr ? q.titleAr : q.title;
        const desc = locale === "ar" && q.descriptionAr ? q.descriptionAr : q.description;
        const submitted = q.myAttempts.filter((a) => a.submittedAt);
        const inProgress = q.myAttempts.find((a) => !a.submittedAt);
        const best = submitted.reduce<(typeof submitted)[number] | undefined>(
          (acc, a) => (!acc || (a.percentage ?? 0) > (acc.percentage ?? 0) ? a : acc),
          undefined
        );
        // Once an attempt is submitted, retaking is not allowed — only an
        // unsubmitted (in-progress) attempt can be resumed.
        const exhausted = submitted.length > 0 && !inProgress;

        const statusBadge = inProgress ? (
          <Badge variant="secondary">{t("quiz.status.inProgress")}</Badge>
        ) : best ? (
          best.passed ? (
            <Badge variant="success">{t("quiz.results.passed")}</Badge>
          ) : (
            <Badge variant="danger">{t("quiz.results.failed")}</Badge>
          )
        ) : (
          <Badge variant="muted">{t("quiz.status.notStarted")}</Badge>
        );

        return (
          <Card key={q.id}>
            <CardContent className="flex h-full flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug">{title}</h3>
                {statusBadge}
              </div>
              {desc && <p className="line-clamp-2 text-sm text-muted-foreground">{desc}</p>}

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{t("quiz.student.questionCount", { count: q.questionCount })}</span>
                {q.timeLimitMin ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {q.timeLimitMin}
                    {t("common.minutes")}
                  </span>
                ) : (
                  <span>{t("quiz.builder.untimed")}</span>
                )}
              </div>

              {best && (
                <p className="text-sm font-medium">
                  {t("quiz.results.score")}: {best.percentage}%
                </p>
              )}

              <div className="mt-auto pt-1">
                {exhausted ? (
                  <Button variant="outline" className="w-full" disabled>
                    {t("quiz.student.noAttemptsLeft")}
                  </Button>
                ) : (
                  <Button asChild variant="brand" className="w-full">
                    <Link href={`/courses/${courseId}/quizzes/${q.id}`}>
                      {inProgress ? t("quiz.student.continue") : best ? t("quiz.student.retake") : t("quiz.student.start")}
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
