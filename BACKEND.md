# MAFAZ Academy — Backend

The app now has a **real backend**: a Neon Postgres database, a server data layer
(Drizzle ORM), API routes, and real auth (bcrypt passwords + a signed httpOnly
session cookie). The client UI still reads from a fast in-memory cache, but that
cache is now **hydrated from the server** and every write goes to the database.

## Architecture

```
Browser (React)                         Server (Next.js route handlers)
─────────────────                       ──────────────────────────────────
lib/mock/store.ts   ──fetch──►  /api/bootstrap   → role-scoped DB snapshot
  (client cache,                /api/auth/*      → login/signup/logout/reset (cookie)
   reads sync)                  /api/rpc         → all mutations (server-authorized)
                                /api/resolve-code→ code → courseId lookup
                                       │
                                       ▼
                                lib/server/dal.ts  (Drizzle queries + authz)
                                lib/server/auth.ts (bcrypt + jose session cookie)
                                lib/db/*           (Drizzle client + schema)
                                       │
                                       ▼
                                   Neon Postgres
```

- **Source of truth:** the database. The client cache is a role-scoped mirror —
  it never receives password hashes, other users' PII, or codes the user
  shouldn't see.
- **Authorization** is always enforced on the server from the **session cookie**,
  never from client-supplied ids.

## Two ways to run (same code, same schema)

The DB client ([lib/db/index.ts](lib/db/index.ts)) picks a driver automatically:

- **`DATABASE_URL` set → Neon Postgres** (cloud, for the public site). ✅ already
  configured in this project.
- **`DATABASE_URL` empty → local embedded Postgres (PGlite)** persisted to
  `./.pgdata`. Zero accounts, works offline — handy for development.

> ⚠️ Keep `@neondatabase/serverless` pinned to **0.9.x** — it must match
> `drizzle-orm@0.33`. The 1.x line changed its API and breaks queries.

## Environment (`.env.local`)

```
DATABASE_URL="postgresql://...neon.tech/...?sslmode=require"   # Neon pooled string
SESSION_SECRET="<64 hex chars>"                                # already generated
```

`.env.local` is gitignored. See `.env.example` for the template.

## First-time database setup

Already done for this project's Neon DB. To re-run (or set up a new DB):

```bash
npm run db:push     # create all tables from lib/db/schema.ts (Neon)
npm run db:seed     # insert the admin accounts + marketing testimonials
```

(For the local PGlite DB, `npm run db:seed` also creates the tables itself.)

Then run the app:

```bash
npm run dev
```

Default admin logins (change them in `lib/db/seed.ts` before launch, then re-seed):

| Email              | Password     | Role  |
| ------------------ | ------------ | ----- |
| admin@mafaz.dz     | Mafaz@2025   | admin |
| manager1@mafaz.dz  | Mafaz@2025   | admin |
| manager2@mafaz.dz  | Mafaz@2025   | admin |

Students and teachers self-register at `/signup` (teachers need admin approval).

## Useful scripts

| Script             | What it does                                   |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Run the app locally                            |
| `npm run build`    | Production build                               |
| `npm run db:push`  | Sync the schema to the database                |
| `npm run db:seed`  | Seed admin accounts + testimonials             |
| `npm run db:studio`| Open Drizzle Studio to browse data             |

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. In **Project → Settings → Environment Variables**, add `DATABASE_URL` and
   `SESSION_SECRET` (same values as `.env.local`).
3. Deploy. (Run `npm run db:push` / `npm run db:seed` once against the same Neon
   database — locally is fine — so the tables and admin accounts exist.)

The API routes use the Node.js runtime (`bcryptjs`/`jose`), and the Neon driver
is HTTP-based, so everything runs on Vercel's serverless functions.

## Known limitations / before a real public launch

- **Password reset is not yet verified by email.** `/api/auth/reset` changes a
  password for any email without proving ownership (this mirrors the original
  mock flow). Wire an emailed reset token/OTP before launch, or disable the
  public reset page. There is a dormant OTP table in the schema ready for this.
- **No email service** is connected (signup is instant, no verification).
- Each mutation re-fetches the full role-scoped snapshot — simple and always
  consistent, fine for this scale; can be optimized later if data grows large.
