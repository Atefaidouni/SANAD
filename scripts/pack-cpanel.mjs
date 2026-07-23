/**
 * Assemble the self-contained server for cPanel / Node hosting.
 * Run `npm run deploy:cpanel` — it builds, then copies the static assets and
 * public/ into .next/standalone so that folder is ready to upload as-is.
 */
import { cpSync, existsSync } from "fs";
import { join } from "path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");

if (!existsSync(join(standalone, "server.js"))) {
  console.error("Missing .next/standalone — run `next build` first (output: 'standalone').");
  process.exit(1);
}

cpSync(join(root, ".next", "static"), join(standalone, ".next", "static"), { recursive: true });
if (existsSync(join(root, "public"))) {
  cpSync(join(root, "public"), join(standalone, "public"), { recursive: true });
}

console.log("✓ Packed. Upload the contents of .next/standalone to your cPanel app root.");
console.log("  Startup file: server.js   |   Set env vars: DATABASE_URL, SESSION_SECRET");
