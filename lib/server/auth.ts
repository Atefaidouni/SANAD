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

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev-insecure-secret-change-me"
);

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
    .sign(secret);
}

async function readToken(token?: string): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload.uid as string) ?? null;
  } catch {
    return null;
  }
}

/** Current user's id from the session cookie (or null). */
export async function getSessionUserId(): Promise<string | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return readToken(token);
}

/** Full current user (or null) — used for authorization checks in API routes. */
export async function getSessionUser(): Promise<User | null> {
  const id = await getSessionUserId();
  if (!id) return null;
  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows[0] ? mapUser(rows[0]) : null;
}
