/**
 * Drizzle database client (server-only) — dual driver.
 *
 * - If DATABASE_URL is set  → a standard Postgres server over TCP (node-postgres),
 *                             so it works with any Postgres host: a shared-hosting
 *                             control panel's own Postgres, Neon, Supabase, RDS, etc.
 * - If it is NOT set        → an embedded Postgres (PGlite) persisted to
 *                             ./.pgdata, so the app runs locally with ZERO setup
 *                             and no external database at all.
 *
 * Both speak the same Postgres schema in `schema.ts`, so switching is just a
 * matter of providing DATABASE_URL — no code change. Initialized lazily via a
 * Proxy so merely importing this module never throws.
 *
 * (No `server-only` import here so the seed/migration CLI can import it too;
 * it's only ever imported by server modules anyway.)
 */
import { join } from "path";
import { Pool } from "pg";
import { drizzle as drizzleNodePostgres, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

type DB = NodePgDatabase<typeof schema>;

/**
 * Cached on `globalThis` (not just a module-level variable) so that Next.js
 * dev-mode recompiles/HMR of this module can't spin up a second PGlite client
 * against the same `.pgdata` directory — two WASM instances writing to the
 * same on-disk files concurrently is what corrupts it (surfaces later as a
 * `RuntimeError: Aborted()` on every query, which looks like "data vanished"
 * since the client silently falls back to an empty snapshot on a failed read).
 */
const globalForDb = globalThis as unknown as {
  __sanadDb?: DB;
  __sanadUsingPglite?: boolean;
};

function getDb(): DB {
  if (globalForDb.__sanadDb) return globalForDb.__sanadDb;
  const url = process.env.DATABASE_URL;
  let db: DB;
  if (url) {
    // Production path — plain Postgres over TCP. SSL is opted into only when
    // the connection string asks for it (`sslmode=require`, e.g. Neon) —
    // a same-server shared-hosting Postgres over localhost typically has no
    // SSL configured at all, and forcing it there would just fail to connect.
    const pool = new Pool({
      connectionString: url,
      ssl: /sslmode=require/i.test(url) ? { rejectUnauthorized: false } : undefined,
    });
    db = drizzleNodePostgres(pool, { schema });
  } else {
    // Local dev fallback only — embedded Postgres, no external database needed.
    // (@electric-sql/pglite is a devDependency; not needed in production.)
    const { PGlite } = require("@electric-sql/pglite");
    const { drizzle: drizzlePglite } = require("drizzle-orm/pglite");
    const client = new PGlite(join(process.cwd(), ".pgdata"));
    db = drizzlePglite(client, { schema }) as unknown as DB;
    globalForDb.__sanadUsingPglite = true;
  }
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
 * Ensure the schema exists. For PGlite (local) this applies the generated
 * migrations. For a real Postgres server, use `npm run db:push` instead
 * (no-op here).
 */
export async function ensureSchema(): Promise<void> {
  const real = getDb();
  if (!globalForDb.__sanadUsingPglite) return;
  const { migrate } = require("drizzle-orm/pglite/migrator");
  await migrate(real as never, { migrationsFolder: join(process.cwd(), "lib/db/migrations") });
}

export { schema };
