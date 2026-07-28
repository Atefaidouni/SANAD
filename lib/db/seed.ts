/**
 * Database seed — run with `npm run db:seed`.
 *
 * Inserts the admin team (real bcrypt-hashed, randomly generated passwords)
 * and the marketing testimonials. Safe to re-run: users are upserted by
 * email, but an existing account's password is never overwritten by a later
 * run — only set the first time an account is created — so re-running this
 * to pick up a schema/testimonial change can't silently rotate anyone's
 * password out from under them. Reviews are only seeded when the table is
 * empty.
 *
 * On first run for a set of admin emails, the generated passwords are
 * printed ONCE to the console — save them immediately (a password manager,
 * not a note file); they are bcrypt-hashed in the database and cannot be
 * recovered afterward. Use the in-app "change password" flow to rotate them.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { reviews as seedReviews } from "../mock/seed";

const ADMIN_EMAILS = [
  { firstName: "Sanad", lastName: "Admin", email: "admin@sanad.dz" },
  { firstName: "Manager", lastName: "One", email: "manager1@sanad.dz" },
  { firstName: "Manager", lastName: "Two", email: "manager2@sanad.dz" },
];

/** Strong, unambiguous random password (base64url alphabet minus look-alikes isn't
 *  worth the complexity here — this is meant for a password manager, not typing). */
function generatePassword(): string {
  return randomBytes(18).toString("base64url");
}

async function main() {
  // Imported dynamically so dotenv runs before lib/db/index reads DATABASE_URL.
  const { db, schema, ensureSchema } = await import("./index");
  const { eq } = await import("drizzle-orm");

  // For local PGlite this creates the tables; for Neon it's a no-op (use db:push).
  console.log("Ensuring schema…");
  await ensureSchema();

  console.log("Seeding admin team…");
  const printedCredentials: { email: string; password: string }[] = [];

  for (const a of ADMIN_EMAILS) {
    const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, a.email)).limit(1);

    if (existing.length) {
      // Already exists — leave the password alone, just make sure the role/
      // approval flags are correct.
      await db.update(schema.users).set({ role: "admin", approved: true }).where(eq(schema.users.id, existing[0].id));
      console.log(`  = ${a.email} (already exists — password unchanged)`);
      continue;
    }

    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(schema.users).values({
      firstName: a.firstName,
      lastName: a.lastName,
      email: a.email,
      passwordHash,
      role: "admin",
      isVerified: true,
      approved: true,
      locale: "ar",
      theme: "dark",
    });
    printedCredentials.push({ email: a.email, password });
    console.log(`  ✓ ${a.email} (created)`);
  }

  if (printedCredentials.length) {
    console.log("\n================ SAVE THESE NOW — shown once ================");
    for (const c of printedCredentials) {
      console.log(`  ${c.email}  →  ${c.password}`);
    }
    console.log("================================================================\n");
  }

  const existingReviews = await db.select({ id: schema.reviews.id }).from(schema.reviews).limit(1);
  if (existingReviews.length === 0) {
    console.log("Seeding testimonials…");
    await db.insert(schema.reviews).values(
      seedReviews.map((r) => ({
        authorName: r.authorName,
        authorRole: r.authorRole,
        rating: r.rating,
        body: r.body,
        bodyAr: r.bodyAr,
        createdAt: new Date(r.createdAt),
      }))
    );
    console.log(`  ✓ ${seedReviews.length} reviews`);
  } else {
    console.log("Testimonials already present — skipping.");
  }

  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
