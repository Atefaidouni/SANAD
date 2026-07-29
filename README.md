# Sanad Academy

A bilingual (Arabic/English, RTL-aware) course platform. Admins create courses and
assign teachers, generate single-use enrollment codes for the printed books; students
redeem a code to unlock recordings, quizzes, and a per-course Q&A forum; teachers
manage their assigned courses and grade quizzes.

## Stack

- **Next.js 16** (App Router, TypeScript), Tailwind CSS, Framer Motion
- **Drizzle ORM** over Postgres via `node-postgres` — works with **any** standard
  Postgres server in production (your own host's built-in PostgreSQL, Neon, Supabase,
  RDS, ...), embedded **PGlite** for zero-setup local dev (no external database at all)
- Auth: bcrypt password hashes + a signed httpOnly JWT session cookie (`jose`)
- Email: [Resend](https://resend.com) (password-reset links)

## Requirements

- Node.js 20+
- A Postgres database for production (local dev needs nothing) — either your hosting
  provider's own PostgreSQL (e.g. cPanel-style panels often have a "PostgreSQL
  Databases" tool separate from MySQL), or an external provider like
  [Neon](https://neon.tech) if your host doesn't offer Postgres
- A [Resend](https://resend.com) account with a verified sending domain (password-reset emails)

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Production only | `postgresql://user:password@host:5432/dbname` — add `?sslmode=require` only if your database requires SSL (e.g. Neon; a same-server hosting-provider Postgres over `localhost` usually doesn't). Omit locally to use embedded PGlite. |
| `SESSION_SECRET` | **Yes, in production** | Signs the session cookie. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. The app refuses to start in production without this set. |
| `APP_URL` | **Yes, in production** | Public base URL (no trailing slash), used to build password-reset links. Deliberately not inferred from the request's Host header. |
| `RESEND_API_KEY` | **Yes, in production** | From your Resend account. |
| `RESEND_FROM_EMAIL` | **Yes, in production** | Must be an address on a domain verified in Resend. |

## Running locally

```bash
npm install
npm run dev
```

That's it — with no `DATABASE_URL` set, the app uses an embedded Postgres (PGlite)
persisted to `.pgdata/` in the project root, auto-migrated on first use. Password-reset
emails will fail to send locally unless you also set the Resend variables; the request
endpoint still responds successfully either way (it never reveals whether sending
worked, to avoid leaking account existence) — check the server console for the logged
error if you need to debug it.

Seed demo accounts (admin, manager, teacher, student):

```bash
npm run db:seed
```

## Database

Schema lives in `lib/db/schema.ts`. After changing it:

```bash
npm run db:generate   # writes a new migration file under lib/db/migrations
```

- **Local (PGlite):** migrations are applied automatically via `ensureSchema()`
  whenever a CLI script runs (`db:seed`, etc.) — the running dev server does **not**
  re-apply migrations on its own, so if you change the schema, stop the dev server,
  run a script that calls `ensureSchema()` (e.g. `npm run db:seed`), then restart.
- **Production:** run `npm run db:push` against `DATABASE_URL` before deploying
  a build that depends on a schema change.

## Deploying (shared hosting / cPanel)

```bash
npm run deploy:cpanel
```

This runs `next build` (standalone output) and packs `.next/static` + `public/` into
`.next/standalone`, so that folder is ready to upload as-is. On the host:

1. Upload the contents of `.next/standalone` to the app root.
2. Set the environment variables above (`DATABASE_URL`, `SESSION_SECRET`, `APP_URL`,
   `RESEND_API_KEY`, `RESEND_FROM_EMAIL`) in the hosting control panel.
3. Set the Node startup file to `server.js`.
4. Run `npm run db:push` (from your own machine, pointed at the production
   `DATABASE_URL`) before first boot, to create the schema on the fresh database.
5. Start the app.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint |
| `npm run deploy:cpanel` | Build + package for shared/cPanel Node hosting |
| `npm run db:generate` | Generate a migration file from schema changes |
| `npm run db:push` | Push schema to `DATABASE_URL` directly (no migration files) |
| `npm run db:seed` | Apply local migrations + seed demo accounts |
| `npm run db:studio` | Drizzle Studio (DB browser) |
