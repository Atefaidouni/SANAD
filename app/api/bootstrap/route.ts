import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { buildSnapshot, sessionFor } from "@/lib/server/dal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Initial load: returns the current session + a role-scoped DB snapshot. */
export async function GET() {
  const user = await getSessionUser();
  const snapshot = await buildSnapshot(user);
  return NextResponse.json({ session: sessionFor(user), snapshot });
}
