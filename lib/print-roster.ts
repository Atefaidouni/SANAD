import type { Locale, StudentRow } from "./types";
import { formatDate } from "./utils";

export interface RosterLabels {
  docTitle: string;
  brand: string;
  rosterTitle: string;
  generatedOn: string;
  index: string;
  student: string;
  email: string;
  code: string;
  course: string;
  progress: string;
  joined: string;
  empty: string;
}

interface PrintRosterOptions {
  /** Heading shown at the top of the document (e.g. the course title). */
  title: string;
  /** Optional secondary heading (e.g. the level). */
  subtitle?: string;
  rows: StudentRow[];
  locale: Locale;
  /** Include a "course" column (used for the all-students roster). */
  showCourse?: boolean;
  labels: RosterLabels;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Builds a clean, branded roster document and opens the browser print dialog so
 * the admin can "Save as PDF". Uses a hidden iframe (no popup blocker, no extra
 * dependencies). The document <title> becomes the default PDF filename.
 */
export function printStudentRoster({
  title,
  subtitle,
  rows,
  locale,
  showCourse = false,
  labels,
}: PrintRosterOptions): void {
  if (typeof window === "undefined") return;

  const dir = locale === "ar" ? "rtl" : "ltr";
  const now = formatDate(new Date(), locale);

  const head = [
    `<th class="num">${esc(labels.index)}</th>`,
    `<th>${esc(labels.student)}</th>`,
    `<th>${esc(labels.email)}</th>`,
    `<th>${esc(labels.code)}</th>`,
    showCourse ? `<th>${esc(labels.course)}</th>` : "",
    `<th class="num">${esc(labels.progress)}</th>`,
    `<th>${esc(labels.joined)}</th>`,
  ].join("");

  const body = rows
    .map((r, i) => {
      const name = `${r.user.firstName} ${r.user.lastName}`.trim();
      const courseTitle =
        locale === "ar" && r.course.titleAr ? r.course.titleAr : r.course.title;
      return `<tr>
        <td class="num">${i + 1}</td>
        <td>${esc(name)}</td>
        <td dir="ltr">${esc(r.user.email)}</td>
        <td class="mono" dir="ltr">${r.code ? esc(r.code.code) : "—"}</td>
        ${showCourse ? `<td>${esc(courseTitle)}</td>` : ""}
        <td class="num">${r.enrollment.progressPercent}%</td>
        <td>${esc(formatDate(r.enrollment.createdAt, locale))}</td>
      </tr>`;
    })
    .join("");

  const tableOrEmpty = rows.length
    ? `<table>
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>`
    : `<p class="empty">${esc(labels.empty)}</p>`;

  const html = `<!doctype html>
<html lang="${locale}" dir="${dir}">
<head>
<meta charset="utf-8" />
<title>${esc(labels.docTitle)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "Segoe UI", Tahoma, Arial, sans-serif;
    color: #0f172a; margin: 0; padding: 32px;
  }
  .head {
    display: flex; align-items: flex-start; justify-content: space-between;
    border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px;
    gap: 16px;
  }
  .brand { font-size: 20px; font-weight: 800; letter-spacing: -0.02em;
    background: linear-gradient(90deg,#2563eb,#0ea5a5);
    -webkit-background-clip: text; background-clip: text; color: transparent; }
  .meta { text-align: ${dir === "rtl" ? "left" : "right"}; font-size: 12px; color: #64748b; }
  h1 { font-size: 18px; margin: 0 0 2px; }
  .sub { font-size: 13px; color: #64748b; margin: 0; }
  .count { display: inline-block; margin: 0 0 14px;
    background: #eff6ff; color: #2563eb; font-weight: 600; font-size: 12px;
    padding: 4px 10px; border-radius: 999px; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  th, td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; text-align: ${dir === "rtl" ? "right" : "left"}; }
  th { background: #f8fafc; font-size: 11px; text-transform: uppercase;
    letter-spacing: 0.04em; color: #475569; }
  td.num, th.num { text-align: center; }
  .mono { font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace; }
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
      <div>${esc(labels.rosterTitle)}</div>
      <div>${esc(labels.generatedOn)} ${esc(now)}</div>
    </div>
  </div>
  <div class="count">${esc(labels.rosterTitle)}: ${rows.length}</div>
  ${tableOrEmpty}
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) return;
    win.focus();
    win.print();
    // Give the print dialog time to grab the document before removing it.
    setTimeout(() => iframe.remove(), 1500);
  };
  document.body.appendChild(iframe);
  iframe.srcdoc = html;
}
