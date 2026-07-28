/**
 * Server-side auth: password hashing (bcrypt) + a signed httpOnly session
 * cookie (JWT via jose). Replaces the mock `mock$password` scheme.
 */
import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { mapUser } from "./map";
import type { User } from "@/lib/types";

export const SESSION_COOKIE = "mafaz_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Computed lazily (not at module load) so `next build` — which imports every
// route module to collect page data, even under NODE_ENV=production — never
// trips this. It only actually runs when a request needs to sign/verify a
// token, i.e. once the app is really serving traffic.
let cachedSecret: Uint8Array | null = null;
function getSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    // A guessable/default secret would let anyone forge a valid session cookie
    // for any user id — fail loudly rather than silently running insecure.
    throw new Error(
      "SESSION_SECRET is not set. Refusing to run in production with an insecure default — " +
        "generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  cachedSecret = new TextEncoder().encode(process.env.SESSION_SECRET || "dev-insecure-secret-change-me");
  return cachedSecret;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};

export function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}

export function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

async function readToken(token?: string): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return (payload.uid as string) ?? null;
  } catch {
    return null;
  }
}

/** Current user's id from the session cookie (or null). */
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore: any = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return readToken(token);
}

/** Full current user (or null) — used for authorization checks in API routes. */
export async function getSessionUser(): Promise<User | null> {
  const id = await getSessionUserId();
  if (!id) return null;
  try {
    const rows = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return rows[0] ? mapUser(rows[0]) : null;
  } catch (err) {
    // DB driver (pglite) may abort in some local environments. Don't crash
    // the whole request — log and return null so routes can fall back.
    // eslint-disable-next-line no-console
    console.error("DB read failed in getSessionUser:", err);
    return null;
  }
}
