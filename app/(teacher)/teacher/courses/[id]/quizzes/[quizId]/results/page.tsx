"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Award, ArrowLeft, CheckCircle2, ClipboardList, Lock, Printer, TrendingUp, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatTile } from "@/components/dashboard/stat-tile";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";
import { printQuizResults } from "@/lib/print-quiz-results";
import { formatDate, initials } from "@/lib/utils";

export default function QuizResultsPage() {
  const { t, locale } = useI18n();
  const store = useStore();
  const session = useSession();
  const params = useParams();
  const courseId = params?.id as string | undefined;
  const quizId = params?.quizId as string | undefined;
  const [query, setQuery] = useState("");
  if (!courseId || !quizId) return notFound();

  const canManage = store.canManageCourse(session?.user.id, courseId);
  const quiz = store.getQuiz(quizId);
  const analytics = store.getQuizAnalytics(quizId);
  const attempts = store
    .getQuizAttempts(quizId)
    .map((attempt) => ({ attempt, user: store.getUser(attempt.userId) }))
    .filter((r): r is { attempt: typeof r.attempt; user: NonNullable<typeof r.user> } => !!r.user)
    .sort((a, b) => new Date(b.attempt.startedAt).getTime() - new Date(a.attempt.startedAt).getTime());

  const filtered = attempts.filter((r) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      `${r.user.firstName} ${r.user.lastName}`.toLowerCase().includes(q) ||
      r.user.email.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardShell role="teacher" title={quiz?.title ?? t("quiz.list.results")} subtitle={t("quiz.results.subtitle")}>
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link href={`/teacher/courses/${courseId}/quizzes/${quizId}`}>
            <ArrowLeft className="size-4 rtl-flip" />
            {t("quiz.builder.title")}
          </Link>
        </Button>

        {!canManage || !quiz ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <Lock className="size-7" />
              </span>
              <p className="font-semibold">{t("teacher.notAssigned")}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <StatTile icon={ClipboardList} label={t("quiz.results.attempts")} value={analytics.attemptsCount} />
              <StatTile icon={TrendingUp} label={t("quiz.results.avgScore")} value={`${analytics.avgScore}%`} />
              <StatTile icon={Award} label={t("quiz.results.highScore")} value={`${analytics.highScore}%`} />
              <StatTile icon={Award} label={t("quiz.results.lowScore")} value={`${analytics.lowScore}%`} />
              <StatTile icon={CheckCircle2} label={t("quiz.results.passRate")} value={`${analytics.passRate}%`} accent />
            </div>

            <Card>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <SearchInput
                    value={query}
                    onChange={setQuery}
                    placeholder={t("common.searchPlaceholder")}
                    className="sm:max-w-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={attempts.length === 0}
                    onClick={() =>
                      printQuizResults({
                        title: quiz.title,
                        rows: attempts,
                        locale,
                        labels: {
                          docTitle: `${t("common.appNameFull")} — ${quiz.title}`,
                          brand: t("common.appNameFull"),
                          resultsTitle: t("quiz.list.results"),
                          generatedOn: t("admin.generatedOn"),
                          index: "#",
                          student: t("quiz.results.student"),
                          email: t("admin.studentsTableCols.email"),
                          score: t("quiz.results.score"),
                          percentage: "%",
                          attemptNumber: t("quiz.results.attemptNumber"),
                          timeSpent: t("quiz.results.timeSpent"),
                          submittedOn: t("quiz.results.submittedOn"),
                          status: t("quiz.results.status"),
                          passed: t("quiz.results.passed"),
                          failed: t("quiz.results.failed"),
                          inProgress: t("quiz.status.inProgress"),
                          empty: t("common.noResults"),
                        },
                      })
                    }
                  >
                    <Printer className="size-4" />
                    {t("admin.exportPdf")}
                  </Button>
                </div>

                {filtered.length === 0 ? (
                  <EmptyState icon={Users} title={t("common.noResults")} />
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-border">
                    <div className="overflow-x-auto scroll-thin">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                            <th className="px-4 py-3 text-start font-semibold">{t("quiz.results.student")}</th>
                            <th className="px-4 py-3 text-start font-semibold">{t("quiz.results.score")}</th>
                            <th className="px-4 py-3 text-start font-semibold">{t("quiz.results.attemptNumber")}</th>
                            <th className="hidden px-4 py-3 text-start font-semibold sm:table-cell">
                              {t("quiz.results.timeSpent")}
                            </th>
                            <th className="hidden px-4 py-3 text-start font-semibold md:table-cell">
                              {t("quiz.results.submittedOn")}
                            </th>
                            <th className="px-4 py-3 text-start font-semibold">{t("quiz.results.status")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filtered.map((r) => (
                            <tr key={r.attempt.id} className="bg-card transition-colors hover:bg-accent/40">
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
                                    <p className="truncate text-xs text-muted-foreground" dir="ltr">
                                      {r.user.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-medium">
                                {r.attempt.score ?? "—"}/{r.attempt.maxScore} · {r.attempt.percentage ?? "—"}%
                              </td>
                              <td className="px-4 py-3">{r.attempt.attemptNumber}</td>
                              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                                {r.attempt.timeSpentSec != null
                                  ? `${Math.floor(r.attempt.timeSpentSec / 60)}m ${r.attempt.timeSpentSec % 60}s`
                                  : "—"}
                              </td>
                              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                {r.attempt.submittedAt ? formatDate(r.attempt.submittedAt, locale) : "—"}
                              </td>
                              <td className="px-4 py-3">
                                {!r.attempt.submittedAt ? (
                                  <Badge variant="muted">{t("quiz.status.inProgress")}</Badge>
                                ) : r.attempt.passed ? (
                                  <Badge variant="success">{t("quiz.results.passed")}</Badge>
                                ) : (
                                  <Badge variant="danger">{t("quiz.results.failed")}</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
