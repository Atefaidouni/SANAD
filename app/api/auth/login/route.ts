import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/auth";
import { authenticate, buildSnapshot, getUserById, sessionFor } from "@/lib/server/dal";
import { isRateLimited } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOGIN_RATE_LIMIT_MAX = 10;
const LOGIN_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 400 });
  }
  if (isRateLimited(`login:${email.trim().toLowerCase()}`, LOGIN_RATE_LIMIT_MAX, LOGIN_RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json({ ok: false, error: "too_many_attempts" }, { status: 429 });
  }
  const res = await authenticate(email, password);
  if (!res.ok) return NextResponse.json(res, { status: 401 });

  const userId = res.data!.userId;
  const cookieStore: any = await cookies();
  cookieStore.set(SESSION_COOKIE, await createSessionToken(userId), sessionCookieOptions);

  const user = await getUserById(userId);
  const snapshot = user ? await buildSnapshot(user) : null;
  return NextResponse.json({ ok: true, session: sessionFor(user), snapshot });
}
