/**
 * Drizzle database client (server-only) — MySQL via `mysql2`.
 *
 * DATABASE_URL is required everywhere, including local dev — MySQL has no
 * practical embedded/zero-setup equivalent to Postgres's PGlite, so this app
 * no longer has a "just works with no external database" fallback. Point it
 * at any reachable MySQL server (a local one, or the same one used in
 * production).
 *
 * Initialized lazily via a Proxy so merely importing this module never
 * throws — only the first actual query does, if DATABASE_URL is missing.
 *
 * (No `server-only` import here so the seed/migration CLI can import it too;
 * it's only ever imported by server modules anyway.)
 */
import mysql from "mysql2/promise";
import { drizzle as drizzleMysql, type MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "./schema";

type DB = MySql2Database<typeof schema>;

/**
 * Cached on `globalThis` (not just a module-level variable) so that Next.js
 * dev-mode recompiles/HMR of this module can't spin up a second connection
 * pool on every reload.
 */
const globalForDb = globalThis as unknown as {
  __sanadDb?: DB;
};

function getDb(): DB {
  if (globalForDb.__sanadDb) return globalForDb.__sanadDb;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. This app requires a reachable MySQL database " +
        "(no embedded/zero-setup fallback) — see README for local setup."
    );
  }
  const pool = mysql.createPool(url);
  const db = drizzleMysql(pool, { schema, mode: "default" });
  globalForDb.__sanadDb = db;
  return db;
}

export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

/**
 * Schema creation now always goes through `npm run db:push` (drizzle-kit)
 * against DATABASE_URL — there's no local embedded database to auto-migrate,
 * so this is a no-op kept only because a couple of CLI scripts still call it.
 */
export async function ensureSchema(): Promise<void> {
  // no-op
}

export { schema };
