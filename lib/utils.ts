import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Stable id generator for mock data + new records. */
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Format a number compactly (2,000 -> 2,000). */
export function formatNumber(n: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale).format(n);
}

/** Format price in DZD (Algerian Dinar). */
export function formatPrice(amount: number, locale: "en" | "ar" = "en"): string {
  if (amount === 0) return locale === "ar" ? "مجاني" : "Free";
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "en-US").format(amount);
  return locale === "ar" ? `${formatted} دج` : `${formatted} DZD`;
}

export function formatDate(date: Date | string, locale: "en" | "ar" = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function initials(firstName: string, lastName?: string): string {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

/** Generate a human-friendly secret access code, e.g. SND-7K2D-9QX4. */
export function generateAccessCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  const block = (len: number) =>
    Array.from({ length: len }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `SND-${block(4)}-${block(4)}`;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Relative time, e.g. "3d ago" / "منذ ٣ أيام". */
export function timeAgo(date: Date | string, locale: "en" | "ar" = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar" : "en", {
    numeric: "auto",
  });
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 60) return rtf.format(-mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(-days, "day");
  const months = Math.round(days / 30);
  return rtf.format(-months, "month");
}
