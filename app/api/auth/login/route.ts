import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/auth";
import { authenticate, buildSnapshot, getUserById, sessionFor } from "@/lib/server/dal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 400 });
  }
  const res = await authenticate(email, password);
  if (!res.ok) return NextResponse.json(res, { status: 401 });

  const userId = res.data!.userId;
  cookies().set(SESSION_COOKIE, await createSessionToken(userId), sessionCookieOptions);

  const user = await getUserById(userId);
  const snapshot = await buildSnapshot(user);
  return NextResponse.json({ ok: true, session: sessionFor(user), snapshot });
}
