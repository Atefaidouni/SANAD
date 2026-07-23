/**
 * Drizzle database client (server-only) — dual driver.
 *
 * - If DATABASE_URL is set  → Neon serverless Postgres (for public / Vercel).
 * - If it is NOT set        → an embedded Postgres (PGlite) persisted to
 *                             ./.pgdata, so the app runs locally with ZERO setup
 *                             and no cloud account.
 *
 * Both speak the same Postgres schema in `schema.ts`, so switching is just a
 * matter of providing DATABASE_URL — no code change. Initialized lazily via a
 * Proxy so merely importing this module never throws.
 *
 * (No `server-only` import here so the seed/migration CLI can import it too;
 * it's only ever imported by server modules anyway.)
 */
import { join } from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DB = NeonHttpDatabase<typeof schema>;

let _db: DB | null = null;
let _usingPglite = false;

function getDb(): DB {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (url) {
    // Production path (Neon) — statically imported so it bundles cleanly.
    _db = drizzleNeon(neon(url), { schema });
  } else {
    // Local dev fallback only — embedded Postgres, no cloud account needed.
    // (@electric-sql/pglite is a devDependency; not needed in production.)
    const { PGlite } = require("@electric-sql/pglite");
    const { drizzle: drizzlePglite } = require("drizzle-orm/pglite");
    const client = new PGlite(join(process.cwd(), ".pgdata"));
    _db = drizzlePglite(client, { schema }) as unknown as DB;
    _usingPglite = true;
  }
  return _db!;
}

export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

/**
 * Ensure the schema exists. For PGlite (local) this applies the generated
 * migrations. For Neon, use `npm run db:push` instead (no-op here).
 */
export async function ensureSchema(): Promise<void> {
  const real = getDb();
  if (!_usingPglite) return;
  const { migrate } = require("drizzle-orm/pglite/migrator");
  await migrate(real as never, { migrationsFolder: join(process.cwd(), "lib/db/migrations") });
}

export { schema };
