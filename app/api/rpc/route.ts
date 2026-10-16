import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { buildSnapshot, runMutation, sessionFor } from "@/lib/server/dal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Single mutation endpoint. Body: { method, args }.
 * Runs the named mutation with session-derived authorization, then returns the
 * fresh role-scoped snapshot so the client cache stays consistent.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const method = body?.method;
  const args = body?.args ?? {};
  if (typeof method !== "string") {
    return NextResponse.json({ result: { ok: false, error: "bad_request" } }, { status: 400 });
  }

  const before = await getSessionUser();
  const result = await runMutation(method, before, args);

  // Re-read the user (role/profile may have changed) before building the snapshot.
  const after = await getSessionUser();
  const snapshot = await buildSnapshot(after);
  return NextResponse.json(
    { result, session: sessionFor(after), snapshot },
    {
      headers: {
        "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
