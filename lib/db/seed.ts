/**
 * Database seed — run with `npm run db:seed`.
 *
 * Inserts the admin team (real bcrypt-hashed passwords) and the marketing
 * testimonials. Safe to re-run: users are upserted by email and reviews are
 * only seeded when the reviews table is empty.
 *
 * Edit the ADMINS array below to change the production logins before deploying.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { reviews as seedReviews } from "../mock/seed";

const ADMINS = [
  { firstName: "Sanad", lastName: "Admin", email: "admin@sanad.dz", password: "Sanad@2025" },
  { firstName: "Manager", lastName: "One", email: "manager1@sanad.dz", password: "Sanad@2025" },
  { firstName: "Manager", lastName: "Two", email: "manager2@sanad.dz", password: "Sanad@2025" },
];

/** Demo, pre-approved accounts so the other roles can be tried without signing up. */
const DEMO_TEACHER = {
  firstName: "Amine",
  lastName: "Belkacem",
  email: "teacher@sanad.dz",
  password: "Sanad@2025",
};
const DEMO_STUDENT = {
  firstName: "Yacine",
  lastName: "Haddad",
  email: "student@sanad.dz",
  password: "Sanad@2025",
};

async function main() {
  // Imported dynamically so dotenv runs before lib/db/index reads DATABASE_URL.
  const { db, schema, ensureSchema } = await import("./index");

  // For local PGlite this creates the tables; for Neon it's a no-op (use db:push).
  console.log("Ensuring schema…");
  await ensureSchema();

  console.log("Seeding admin team…");
  for (const a of ADMINS) {
    const passwordHash = await bcrypt.hash(a.password, 10);
    await db
      .insert(schema.users)
      .values({
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        passwordHash,
        role: "admin",
        isVerified: true,
        approved: true,
        locale: "ar",
        theme: "dark",
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: { passwordHash, role: "admin", approved: true },
      });
    console.log(`  ✓ ${a.email}`);
  }

  console.log("Seeding demo teacher & student…");
  const demoTeacherHash = await bcrypt.hash(DEMO_TEACHER.password, 10);
  await db
    .insert(schema.users)
    .values({
      firstName: DEMO_TEACHER.firstName,
      lastName: DEMO_TEACHER.lastName,
      email: DEMO_TEACHER.email,
      passwordHash: demoTeacherHash,
      role: "teacher",
      isVerified: true,
      approved: true,
      locale: "ar",
      theme: "dark",
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { passwordHash: demoTeacherHash, role: "teacher", isVerified: true, approved: true },
    });
  console.log(`  ✓ ${DEMO_TEACHER.email}`);

  const demoStudentHash = await bcrypt.hash(DEMO_STUDENT.password, 10);
  await db
    .insert(schema.users)
    .values({
      firstName: DEMO_STUDENT.firstName,
      lastName: DEMO_STUDENT.lastName,
      email: DEMO_STUDENT.email,
      passwordHash: demoStudentHash,
      role: "student",
      isVerified: true,
      approved: true,
      locale: "ar",
      theme: "dark",
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { passwordHash: demoStudentHash, role: "student", isVerified: true, approved: true },
    });
  console.log(`  ✓ ${DEMO_STUDENT.email}`);

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
