import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { getSessionUser } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB

/** Stores an uploaded image's bytes directly in Postgres (no external storage
 *  service — works identically on Neon, cPanel Postgres, and local PGlite).
 *  Currently only used for quiz question images. */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, error: "invalid_type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "too_large" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const [row] = await db
    .insert(schema.uploads)
    .values({ mime: file.type, data: buffer, size: buffer.length })
    .returning({ id: schema.uploads.id });

  return NextResponse.json({ ok: true, id: row.id });
}
