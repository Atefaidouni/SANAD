import { ensureSchema } from "../lib/db";

async function main() {
  await ensureSchema();
  console.log("schema ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
