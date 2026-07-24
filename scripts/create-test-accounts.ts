import bcrypt from "bcryptjs";
import { db, schema, ensureSchema } from "../lib/db";

const accounts = [
  { firstName: "Teacher", lastName: "One", email: "teacher1@sanad.dz", password: "Teacher@123", role: "teacher" as const },
  { firstName: "Teacher", lastName: "Two", email: "teacher2@sanad.dz", password: "Teacher@123", role: "teacher" as const },
  { firstName: "Student", lastName: "One", email: "student1@sanad.dz", password: "Student@123", role: "student" as const },
];

async function main() {
  await ensureSchema();
  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    await db
      .insert(schema.users)
      .values({
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        passwordHash,
        role: account.role,
        isVerified: true,
        approved: account.role !== "teacher",
        locale: "en",
        theme: "system",
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: { passwordHash, role: account.role, approved: account.role !== "teacher", isVerified: true },
      });
    console.log(`created ${account.email}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
