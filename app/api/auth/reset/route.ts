import { NextResponse } from "next/server";
import { resetUserPassword } from "@/lib/server/dal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Password reset by email.
 *
 * ⚠️ SECURITY NOTE: this mirrors the original mock flow and does NOT verify
 * ownership of the email (there is no email/OTP service wired yet). Before a
 * real public launch, gate this behind an emailed reset token. See README.
 */
export async function POST(req: Request) {
  const { email, newPassword } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || typeof newPassword !== "string" || newPassword.length < 6) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  const res = await resetUserPassword(email, newPassword);
  return NextResponse.json(res, { status: res.ok ? 200 : 404 });
}
