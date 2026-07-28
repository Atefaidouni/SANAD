import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSeedData } from "@/lib/mock/seed";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/auth";
import { buildSnapshot, getUserById, registerUser, sessionFor } from "@/lib/server/dal";
import type { Role } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { firstName, lastName, email, password, role } = body ?? {};
  if ([firstName, lastName, email, password].some((v) => typeof v !== "string" || !v)) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  // Client already enforces this (zod, min 8) — re-checked here since the
  // client-side rule is trivially bypassed by calling the API directly.
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "password_weak" }, { status: 400 });
  }
  // Only student/teacher may self-register; never admin.
  const safeRole: Role | undefined = role === "teacher" ? "teacher" : "student";

  const res = await registerUser({ firstName, lastName, email, password, role: safeRole });
  if (!res.ok) return NextResponse.json(res, { status: 409 });

  const userId = res.data!.userId;
  const cookieStore: any = await cookies();
  cookieStore.set(SESSION_COOKIE, await createSessionToken(userId), sessionCookieOptions);

  const user = await getUserById(userId);
  const snapshot = user ? await buildSnapshot(user) : createSeedData();
  return NextResponse.json({ ok: true, session: sessionFor(user), snapshot });
}
