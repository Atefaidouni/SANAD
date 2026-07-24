import { db, schema, ensureSchema } from '../lib/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function main() {
  await ensureSchema();
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, 'admin@sanad.dz')).limit(1);
  const row = rows[0];
  if (!row) { console.log('admin not found'); process.exit(0); }
  const ok = await bcrypt.compare('Sanad@2025', row.passwordHash);
  console.log('password ok?', ok);
}

main().catch(e=>{ console.error(e); process.exit(1); });
