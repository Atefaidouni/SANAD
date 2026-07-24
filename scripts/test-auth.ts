import { authenticate } from '../lib/server/dal';

async function main() {
  const res = await authenticate('admin@sanad.dz','Sanad@2025');
  console.log('authenticate result:', res);
}

main().catch(e=>{console.error(e); process.exit(1)});
