import { NextResponse } from "next/server";
import { createSeedData } from "@/lib/mock/seed";
import { getSessionUser } from "@/lib/server/auth";
import { sessionFor, buildSnapshot } from "@/lib/server/dal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Initial load: returns the current session + a role-scoped DB snapshot. */
export async function GET() {
  const user = await getSessionUser();
  const snapshot = user ? await buildSnapshot(user) : createSeedData();
  return NextResponse.json(
    { session: sessionFor(user), snapshot },
    {
      headers: {
        "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
