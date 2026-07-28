import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/server/dal";
import { sendPasswordResetEmail } from "@/lib/server/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Step 1 of password reset: request an emailed link.
 * Always responds the same way regardless of whether the account exists,
 * was rate-limited, or the email failed to send — this endpoint must never
 * let a caller distinguish those cases (account enumeration).
 */
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  try {
    const result = await requestPasswordReset(email);
    if (result?.token) {
      const appUrl = (process.env.APP_URL || "").replace(/\/$/, "");
      const resetUrl = `${appUrl}/reset/new?token=${encodeURIComponent(result.token)}`;
      await sendPasswordResetEmail(email.trim().toLowerCase(), resetUrl);
    }
  } catch (err) {
    // Never surface this to the client (would leak account existence / infra
    // details) — but it must be visible in server logs so a broken email
    // provider gets noticed instead of silently locking users out.
    console.error("Password reset request failed:", err);
  }

  return NextResponse.json({ ok: true });
}
