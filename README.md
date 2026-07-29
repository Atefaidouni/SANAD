# Sanad Academy

A bilingual (Arabic/English, RTL-aware) course platform. Admins create courses and
assign teachers, generate single-use enrollment codes for the printed books; students
redeem a code to unlock recordings, quizzes, and a per-course Q&A forum; teachers
manage their assigned courses and grade quizzes.

## Stack

- **Next.js 16** (App Router, TypeScript), Tailwind CSS, Framer Motion
- **Drizzle ORM** over **MySQL** (via `mysql2`) — works with any standard MySQL
  server: your hosting provider's own MySQL, a local install, PlanetScale, RDS, etc.
- Auth: bcrypt password hashes + a signed httpOnly JWT session cookie (`jose`)
- Email: [Resend](https://resend.com) (password-reset links)

## Requirements

- Node.js 20+
- A MySQL database, reachable both for local development and production — there is
  no embedded/zero-setup local database (MySQL has no practical equivalent to an
  embedded, in-process engine the way Postgres has PGlite). A local MySQL install,
  Docker (`docker run -e MYSQL_ROOT_PASSWORD=x -p 3306:3306 mysql:8`), or a small
  free-tier hosted MySQL all work fine for local dev.
- A [Resend](https://resend.com) account with a verified sending domain (password-reset emails)

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | **Yes, always** (local dev too) | `mysql://user:password@host:3306/dbname`. |
| `SESSION_SECRET` | **Yes, in production** | Signs the session cookie. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. The app refuses to start in production without this set. |
| `APP_URL` | **Yes, in production** | Public base URL (no trailing slash), used to build password-reset links. Deliberately not inferred from the request's Host header. |
| `RESEND_API_KEY` | **Yes, in production** | From your Resend account. |
| `RESEND_FROM_EMAIL` | **Yes, in production** | Must be an address on a domain verified in Resend. |

## Running locally

```bash
npm install
npm run db:push     # creates the schema on your MySQL database
npm run db:seed     # seeds admin/manager accounts + marketing testimonials
npm run dev
```

`DATABASE_URL` must point at a real, reachable MySQL server even for local dev (see
Requirements above). Password-reset emails will fail to send locally unless you also
set the Resend variables; the request endpoint still responds successfully either way
(it never reveals whether sending worked, to avoid leaking account existence) — check
the server console for the logged error if you need to debug it.

## Database

Schema lives in `lib/db/schema.ts`. Ids are `varchar(36)` (UUID strings) generated in
application code (`crypto.randomUUID()`) rather than a database default — MySQL has
no native UUID column type.

After changing the schema:

```bash
npm run db:generate   # writes a new migration file under lib/db/migrations
npm run db:push        # applies it to DATABASE_URL directly (no migration runner)
```

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
| `npm run db:seed` | Seed admin/manager accounts + marketing testimonials |
| `npm run db:studio` | Drizzle Studio (DB browser) |
