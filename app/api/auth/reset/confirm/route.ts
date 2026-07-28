import { NextResponse } from "next/server";
import { confirmPasswordReset } from "@/lib/server/dal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Step 2 of password reset: redeem the emailed token for a new password. */
export async function POST(req: Request) {
  const { token, newPassword } = await req.json().catch(() => ({}));
  if (typeof token !== "string" || !token || typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  const res = await confirmPasswordReset(token, newPassword);
  return NextResponse.json(res, { status: res.ok ? 200 : 400 });
}
