import type { Role } from "./types";

/** Landing route for a role after login / verification. */
export function homePathForRole(role: Role): string {
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/teacher";
  return "/dashboard";
}

/** Shared password-strength scoring used by signup + reset. */
export interface PasswordScore {
  score: 0 | 1 | 2 | 3 | 4;
  labelKey: "weak" | "fair" | "good" | "strong";
}

export function scorePassword(pw: string): PasswordScore {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const clamped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  const labelKey =
    clamped <= 1 ? "weak" : clamped === 2 ? "fair" : clamped === 3 ? "good" : "strong";
  return { score: clamped, labelKey };
}
