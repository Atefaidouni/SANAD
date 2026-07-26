"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";
import { cn, formatDate } from "@/lib/utils";
import type { QuizAttemptReview, QuizAttemptSet } from "@/lib/types";

type Phase = "instructions" | "in-progress" | "submitted";

export function QuizAttemptFlow({ courseId, quizId }: { courseId: string; quizId: string }) {
  const { t, locale } = useI18n();
  const store = useStore();
  const quiz = store.getQuiz(quizId);

  const [phase, setPhase] = useState<Phase>("instructions");
  const [attemptSet, setAttemptSet] = useState<QuizAttemptSet | null>(null);
  const [review, setReview] = useState<QuizAttemptReview | null>(null);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [index, setIndex] = useState(0);
  const [reviewingStep, setReviewingStep] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const submittedAttempts = (quiz?.myAttempts ?? [])
    .filter((a) => a.submittedAt)
    .sort((a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime());
  const inProgressAttempt = quiz?.myAttempts.find((a) => !a.submittedAt);
  // Once an attempt is submitted, retaking is not allowed — only an unsubmitted
  // (in-progress) attempt can be resumed.
  const attemptsLeft = submittedAttempts.length > 0 ? 0 : 1;
  const canStart = !!inProgressAttempt || submittedAttempts.length === 0;

  const onStart = async () => {
    setStarting(true);
    const res = await store.startQuizAttempt(quizId);
    setStarting(false);
    if (!res.ok || !res.data) {
      toast.error(t(`quiz.errors.${res.error ?? "generic"}`));
      return;
    }
    setAttemptSet(res.data);
    setAnswers({});
    setIndex(0);
    setReviewingStep(false);
    setReview(null);
    setPhase("in-progress");
  };

  const onViewLast = async () => {
    const last = submittedAttempts[0];
    if (!last) return;
    const res = await store.getQuizAttemptReview(last.id);
    if (!res.ok || !res.data) {
      toast.error(t("quiz.errors.generic"));
      return;
    }
    setReview(res.data);
    setPhase("submitted");
  };

  const onSubmit = async () => {
    if (!attemptSet) return;
    setSubmitting(true);
    const payload = attemptSet.questions.map((q) => ({ questionId: q.id, selectedChoiceIds: answers[q.id] ?? [] }));
    const res = await store.submitQuizAttempt(attemptSet.attempt.id, payload);
    setSubmitting(false);
    if (!res.ok || !res.data) {
      toast.error(t("quiz.errors.generic"));
      return;
    }
    setReview(res.data);
    setPhase("submitted");
  };

  const toggleChoice = (questionId: string, choiceId: string, multi: boolean) => {
    setAnswers((prev) => {
      const existing = prev[questionId] ?? [];
      if (multi) {
        const next = existing.includes(choiceId) ? existing.filter((c) => c !== choiceId) : [...existing, choiceId];
        return { ...prev, [questionId]: next };
      }
      return { ...prev, [questionId]: [choiceId] };
    });
  };

  // Countdown timer for timed quizzes.
  useEffect(() => {
    if (phase !== "in-progress" || !attemptSet || !quiz?.timeLimitMin) {
      setSecondsLeft(null);
      return;
    }
    const deadline = new Date(attemptSet.attempt.startedAt).getTime() + quiz.timeLimitMin * 60000;
    const tick = () => setSecondsLeft(Math.max(0, Math.round((deadline - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, attemptSet, quiz?.timeLimitMin]);

  // Auto-submit when the timer runs out.
  useEffect(() => {
    if (phase === "in-progress" && secondsLeft === 0) onSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  if (!quiz) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <AlertCircle className="size-8 text-muted-foreground" />
          <p className="font-semibold">{t("common.noResults")}</p>
        </CardContent>
      </Card>
    );
  }

  /* --------------------------- in progress --------------------------- */
  if (phase === "in-progress" && attemptSet) {
    const questions = attemptSet.questions;
    const current = questions[index];
    const total = questions.length;
    const answeredCount = Object.values(answers).filter((v) => v.length).length;

    if (reviewingStep) {
      return (
        <Card>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <h2 className="text-lg font-bold">{t("quiz.attempt.reviewBeforeSubmit")}</h2>
            <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {questions.map((q, i) => (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setIndex(i);
                      setReviewingStep(false);
                    }}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-sm font-medium",
                      answers[q.id]?.length ? "border-primary/40 bg-primary/5 text-primary" : "border-border text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">
              {t("quiz.attempt.answeredCount", { answered: answeredCount, total })}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setReviewingStep(false)}>
                {t("common.back")}
              </Button>
              <Button variant="brand" onClick={onSubmit} disabled={submitting}>
                {t("quiz.attempt.submitQuiz")}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted-foreground">
              {t("quiz.attempt.questionOf", { index: index + 1, total })}
            </p>
            {secondsLeft != null && (
              <Badge variant={secondsLeft < 60 ? "danger" : "secondary"} className="gap-1">
                <Clock className="size-3.5" />
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
              </Badge>
            )}
          </div>
          <Progress value={((index + 1) / total) * 100} />

          <div className="space-y-3">
            {current.imageId && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/uploads/${current.imageId}`}
                alt=""
                className="max-h-64 w-full rounded-xl border border-border object-contain"
              />
            )}
            <p className="text-lg font-semibold">{locale === "ar" && current.textAr ? current.textAr : current.text}</p>
            <div className="space-y-2">
              {current.choices.map((c) => {
                const selected = (answers[current.id] ?? []).includes(c.id);
                const multi = current.type === "multiple";
                return (
                  <label
                    key={c.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                      selected ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40"
                    )}
                  >
                    <input
                      type={multi ? "checkbox" : "radio"}
                      name={`q-${current.id}`}
                      checked={selected}
                      onChange={() => toggleChoice(current.id, c.id, multi)}
                      className="size-4 shrink-0 accent-primary"
                    />
                    <span className="text-sm font-medium">{locale === "ar" && c.textAr ? c.textAr : c.text}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <Button variant="outline" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
              {t("common.back")}
            </Button>
            {index === total - 1 ? (
              <Button variant="brand" onClick={() => setReviewingStep(true)}>
                {t("quiz.attempt.reviewAndSubmit")}
              </Button>
            ) : (
              <Button variant="brand" onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}>
                {t("common.next")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ------------------------------ submitted ---------------------------- */
  if (phase === "submitted" && review) {
    const { attempt, answers: gradedAnswers, questions } = review;
    const answerByQuestion = new Map(gradedAnswers.map((a) => [a.questionId, a]));

    return (
      <div className="space-y-4">
        <Card
          className={cn(
            "overflow-hidden border-0 text-white shadow-brand",
            attempt.passed ? "bg-brand-gradient" : "bg-gradient-to-br from-rose-500 to-orange-500"
          )}
        >
          <CardContent className="space-y-2 p-6 text-center sm:p-8">
            {attempt.passed ? <CheckCircle2 className="mx-auto size-10" /> : <XCircle className="mx-auto size-10" />}
            <p className="text-3xl font-bold">{attempt.percentage}%</p>
            <p className="text-white/90">
              {attempt.score}/{attempt.maxScore} {t("quiz.results.score")}
            </p>
            <Badge className="border-0 bg-white/20 text-white backdrop-blur">
              {attempt.passed ? t("quiz.results.passed") : t("quiz.results.failed")}
            </Badge>
            <p className="pt-1 text-xs text-white/80">
              {attempt.timeSpentSec != null &&
                `${Math.floor(attempt.timeSpentSec / 60)}m ${attempt.timeSpentSec % 60}s · `}
              {attempt.submittedAt && formatDate(attempt.submittedAt, locale)}
            </p>
          </CardContent>
        </Card>

        {quiz.showAnswersAfterSubmit && (
          <Card>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <h2 className="font-bold">{t("quiz.attempt.reviewAnswers")}</h2>
              <ul className="space-y-4">
                {questions.map((q, i) => {
                  const a = answerByQuestion.get(q.id);
                  const selectedIds = new Set(a?.selectedChoiceIds ?? []);
                  return (
                    <li key={q.id} className="space-y-2 border-t border-border pt-4 first:border-0 first:pt-0">
                      <p className="text-sm font-semibold">
                        {i + 1}. {locale === "ar" && q.textAr ? q.textAr : q.text}
                      </p>
                      <ul className="space-y-1.5">
                        {q.choices.map((c) => {
                          const isSelected = selectedIds.has(c.id);
                          const isCorrectChoice = !!c.isCorrect;
                          return (
                            <li
                              key={c.id}
                              className={cn(
                                "rounded-lg border px-3 py-2 text-sm",
                                isCorrectChoice
                                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                  : isSelected
                                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                                    : "border-border"
                              )}
                            >
                              {locale === "ar" && c.textAr ? c.textAr : c.text}
                              {isSelected && !isCorrectChoice && ` · ${t("quiz.attempt.yourAnswer")}`}
                            </li>
                          );
                        })}
                      </ul>
                      {quiz.showExplanationsAfterSubmit && q.explanation && (
                        <p className="rounded-lg bg-muted p-2.5 text-xs text-muted-foreground">
                          {locale === "ar" && q.explanationAr ? q.explanationAr : q.explanation}
                        </p>
                      )}
                      <p className="text-xs font-medium text-muted-foreground">
                        {a?.pointsEarned ?? 0}/{q.points} {t("quiz.builder.pointsLabel")}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/courses/${courseId}`}>{t("quiz.attempt.backToCourse")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  /* ----------------------------- instructions --------------------------- */
  const title = locale === "ar" && quiz.titleAr ? quiz.titleAr : quiz.title;
  const desc = locale === "ar" && quiz.descriptionAr ? quiz.descriptionAr : quiz.description;

  return (
    <Card>
      <CardContent className="space-y-5 p-6 sm:p-8">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {desc && <p className="mt-1 text-muted-foreground">{desc}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border p-3 text-center">
            <p className="text-lg font-bold">{quiz.questionCount}</p>
            <p className="text-xs text-muted-foreground">{t("quiz.student.questions")}</p>
          </div>
          <div className="rounded-xl border border-border p-3 text-center">
            <p className="text-lg font-bold">{quiz.timeLimitMin ? `${quiz.timeLimitMin}${t("common.minutes")}` : "∞"}</p>
            <p className="text-xs text-muted-foreground">{t("quiz.builder.timeLimit")}</p>
          </div>
          <div className="rounded-xl border border-border p-3 text-center">
            <p className="text-lg font-bold">{quiz.passingScore}%</p>
            <p className="text-xs text-muted-foreground">{t("quiz.builder.passingScore")}</p>
          </div>
          <div className="rounded-xl border border-border p-3 text-center">
            <p className="text-lg font-bold">{attemptsLeft ?? "∞"}</p>
            <p className="text-xs text-muted-foreground">{t("quiz.student.attemptsLeftLabel")}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {submittedAttempts.length > 0 && (
            <Button variant="outline" onClick={onViewLast}>
              {t("quiz.attempt.viewLastResult")}
            </Button>
          )}
          {canStart ? (
            <Button variant="brand" onClick={onStart} disabled={starting}>
              {inProgressAttempt ? t("quiz.student.continue") : t("quiz.attempt.startQuiz")}
            </Button>
          ) : (
            <p className="self-center text-sm text-muted-foreground">{t("quiz.student.noAttemptsLeft")}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
