"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { QuizAttemptFlow } from "@/components/quiz/quiz-attempt-flow";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useSession } from "@/lib/mock/use-store";

export default function StudentQuizPage() {
  const { t } = useI18n();
  const session = useSession();
  const params = useParams();
  const courseId = params?.id as string | undefined;
  const quizId = params?.quizId as string | undefined;
  if (!courseId || !quizId) return notFound();

  return (
    <DashboardShell role={session?.user.role ?? "student"} title={t("quiz.student.tab")}>
      <div className="mx-auto max-w-2xl space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link href={`/courses/${courseId}`}>
            <ArrowLeft className="size-4 rtl-flip" />
            {t("quiz.attempt.backToCourse")}
          </Link>
        </Button>
        <QuizAttemptFlow courseId={courseId} quizId={quizId} />
      </div>
    </DashboardShell>
  );
}
