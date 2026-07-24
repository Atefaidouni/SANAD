import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSeedData } from "@/lib/mock/seed";
import { SESSION_COOKIE } from "@/lib/server/auth";
import { sessionFor } from "@/lib/server/dal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore: any = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  // Return the public (logged-out) snapshot so the client can reset its cache.
  const snapshot = createSeedData();
  return NextResponse.json({ ok: true, session: sessionFor(null), snapshot });
}
