import type { Locale, QuizAttempt, User } from "./types";
import { formatDate } from "./utils";

export interface QuizAttemptRow {
  attempt: QuizAttempt;
  user: User;
}

export interface QuizResultsLabels {
  docTitle: string;
  brand: string;
  resultsTitle: string;
  generatedOn: string;
  index: string;
  student: string;
  email: string;
  score: string;
  percentage: string;
  attemptNumber: string;
  timeSpent: string;
  submittedOn: string;
  status: string;
  passed: string;
  failed: string;
  inProgress: string;
  empty: string;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDuration(sec?: number | null): string {
  if (!sec && sec !== 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

/**
 * Builds a branded quiz-results document and opens the browser print dialog
 * ("Save as PDF") — same hidden-iframe approach as `printStudentRoster`, no
 * extra PDF/CSV dependency.
 */
export function printQuizResults({
  title,
  subtitle,
  rows,
  locale,
  labels,
}: {
  title: string;
  subtitle?: string;
  rows: QuizAttemptRow[];
  locale: Locale;
  labels: QuizResultsLabels;
}): void {
  if (typeof window === "undefined") return;

  const dir = locale === "ar" ? "rtl" : "ltr";
  const now = formatDate(new Date(), locale);

  const head = [
    `<th class="num">${esc(labels.index)}</th>`,
    `<th>${esc(labels.student)}</th>`,
    `<th>${esc(labels.email)}</th>`,
    `<th class="num">${esc(labels.score)}</th>`,
    `<th class="num">${esc(labels.percentage)}</th>`,
    `<th class="num">${esc(labels.attemptNumber)}</th>`,
    `<th>${esc(labels.timeSpent)}</th>`,
    `<th>${esc(labels.submittedOn)}</th>`,
    `<th>${esc(labels.status)}</th>`,
  ].join("");

  const body = rows
    .map((r, i) => {
      const name = `${r.user.firstName} ${r.user.lastName}`.trim();
      const status = !r.attempt.submittedAt
        ? labels.inProgress
        : r.attempt.passed
          ? labels.passed
          : labels.failed;
      return `<tr>
        <td class="num">${i + 1}</td>
        <td>${esc(name)}</td>
        <td dir="ltr">${esc(r.user.email)}</td>
        <td class="num">${r.attempt.score ?? "—"}/${r.attempt.maxScore}</td>
        <td class="num">${r.attempt.percentage ?? "—"}%</td>
        <td class="num">${r.attempt.attemptNumber}</td>
        <td>${esc(formatDuration(r.attempt.timeSpentSec))}</td>
        <td>${r.attempt.submittedAt ? esc(formatDate(r.attempt.submittedAt, locale)) : "—"}</td>
        <td>${esc(status)}</td>
      </tr>`;
    })
    .join("");

  const tableOrEmpty = rows.length
    ? `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
    : `<p class="empty">${esc(labels.empty)}</p>`;

  const html = `<!doctype html>
<html lang="${locale}" dir="${dir}">
<head>
<meta charset="utf-8" />
<title>${esc(labels.docTitle)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Tahoma, Arial, sans-serif; color: #0f172a; margin: 0; padding: 32px; }
  .head { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; gap: 16px; }
  .brand { font-size: 20px; font-weight: 800; letter-spacing: -0.02em;
    background: linear-gradient(90deg,#2563eb,#0ea5a5); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .meta { text-align: ${dir === "rtl" ? "left" : "right"}; font-size: 12px; color: #64748b; }
  h1 { font-size: 18px; margin: 0 0 2px; }
  .sub { font-size: 13px; color: #64748b; margin: 0; }
  .count { display: inline-block; margin: 0 0 14px; background: #eff6ff; color: #2563eb; font-weight: 600; font-size: 12px; padding: 4px 10px; border-radius: 999px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { padding: 8px 9px; border-bottom: 1px solid #e2e8f0; text-align: ${dir === "rtl" ? "right" : "left"}; }
  th { background: #f8fafc; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.04em; color: #475569; }
  td.num, th.num { text-align: center; }
  tbody tr:nth-child(even) { background: #fbfcfe; }
  .empty { color: #64748b; text-align: center; padding: 40px 0; }
  @page { margin: 14mm; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <div class="head">
    <div>
      <div class="brand">${esc(labels.brand)}</div>
      <h1>${esc(title)}</h1>
      ${subtitle ? `<p class="sub">${esc(subtitle)}</p>` : ""}
    </div>
    <div class="meta">
      <div>${esc(labels.resultsTitle)}</div>
      <div>${esc(labels.generatedOn)} ${esc(now)}</div>
    </div>
  </div>
  <div class="count">${esc(labels.resultsTitle)}: ${rows.length}</div>
  ${tableOrEmpty}
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) return;
    win.focus();
    win.print();
    setTimeout(() => iframe.remove(), 1500);
  };
  document.body.appendChild(iframe);
  iframe.srcdoc = html;
}
