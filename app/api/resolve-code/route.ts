import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSessionUser } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Resolve a secret code → its course id (auth required; never lists the pool). */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { code } = await req.json().catch(() => ({}));
  if (typeof code !== "string" || !code.trim()) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const rows = await db
    .select({ courseId: schema.courseCodes.courseId })
    .from(schema.courseCodes)
    .where(eq(schema.courseCodes.code, code.trim().toUpperCase()))
    .limit(1);

  if (!rows.length) return NextResponse.json({ ok: false, error: "not_found" });
  return NextResponse.json({ ok: true, courseId: rows[0].courseId });
}
