import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/server/auth";
import { buildSnapshot, sessionFor } from "@/lib/server/dal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  cookies().delete(SESSION_COOKIE);
  // Return the public (logged-out) snapshot so the client can reset its cache.
  const snapshot = await buildSnapshot(null);
  return NextResponse.json({ ok: true, session: sessionFor(null), snapshot });
}
