"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, BarChart3, Lock } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { QuizSettingsForm } from "@/components/quiz/quiz-settings-form";
import { QuizQuestionEditor } from "@/components/quiz/quiz-question-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";

export default function QuizBuilderPage() {
  const { t } = useI18n();
  const store = useStore();
  const session = useSession();
  const params = useParams();
  const courseId = params?.id as string | undefined;
  const quizId = params?.quizId as string | undefined;
  if (!courseId || !quizId) return notFound();

  const canManage = store.canManageCourse(session?.user.id, courseId);
  const quiz = store.getQuiz(quizId);

  return (
    <DashboardShell role="teacher" title={quiz?.title ?? t("quiz.builder.title")} subtitle={t("quiz.list.subtitle")}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link href={`/teacher/courses/${courseId}`}>
              <ArrowLeft className="size-4 rtl-flip" />
              {t("teacher.allCourses")}
            </Link>
          </Button>
          {quiz && (
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href={`/teacher/courses/${courseId}/quizzes/${quizId}/results`}>
                <BarChart3 className="size-4" />
                {t("quiz.list.results")}
              </Link>
            </Button>
          )}
        </div>

        {!canManage || !quiz ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <Lock className="size-7" />
              </span>
              <p className="font-semibold">{t(!canManage ? "teacher.notAssigned" : "common.noResults")}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{t("quiz.builder.settings")}</CardTitle>
              </CardHeader>
              <CardContent>
                <QuizSettingsForm quiz={quiz} />
              </CardContent>
            </Card>

            <QuizQuestionEditor quizId={quizId} />
          </>
        )}
      </div>
    </DashboardShell>
  );
}
