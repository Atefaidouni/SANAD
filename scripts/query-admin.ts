import { db, schema, ensureSchema } from '../lib/db';
import { eq } from 'drizzle-orm';

async function main(){
  await ensureSchema();
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, 'admin@sanad.dz')).limit(1);
  console.log(rows[0]||'no row');
}

main().catch(e=>{console.error(e); process.exit(1)})
