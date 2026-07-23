# Deploying MAFAZ to cPanel

This is a **Next.js Node.js app** with a real backend, so it runs as a Node
application on cPanel — not as static HTML and not as a PHP site.

## Prerequisite (check this first!)

Your cPanel must have **"Setup Node.js App"** (the CloudLinux Node.js Selector),
with **Node 18.17 or newer** available. Look for a *Setup Node.js App* icon in
cPanel under "Software".

- ✅ If you see it → follow the steps below.
- ❌ If you don't → your hosting plan can't run this app. You'd need a plan with
  Node.js support, a VPS, or a Node host (Vercel/Railway/Render). Ask your host
  to enable Node.js apps.

The database is **Neon (cloud)**, so the cPanel server only needs outbound
internet — there's nothing to install on the host for the DB.

---

## Recommended path: build locally, upload the standalone server

This avoids running a heavy build on shared hosting.

### 1. Build the deploy folder (on your PC)

```bash
npm run deploy:cpanel
```

This produces a ready-to-upload folder at **`.next/standalone`** containing the
server, the traced `node_modules`, and the assets.

### 2. Upload it

Zip the **contents of `.next/standalone`** and upload+extract them into a folder
in your cPanel account (e.g. `~/mafaz`). After extracting, that folder should
contain `server.js`, a `node_modules/` folder, and a `.next/` folder.

### 3. Create the Node.js app in cPanel

In **Setup Node.js App → Create Application**:

| Field                   | Value                                  |
| ----------------------- | -------------------------------------- |
| Node.js version         | 18.x or 20.x                           |
| Application mode        | Production                             |
| Application root        | the folder you uploaded to (e.g. `mafaz`) |
| Application URL         | your domain or subdomain               |
| Application startup file| `server.js`                            |

### 4. Add environment variables

In the same screen, under **Environment variables**, add:

| Name            | Value                                            |
| --------------- | ------------------------------------------------ |
| `DATABASE_URL`  | your Neon connection string                      |
| `SESSION_SECRET`| the long hex secret from `.env.local`            |
| `NODE_ENV`      | `production`                                      |

### 5. Start

Click **Restart** (or **Start**). Visit your domain — the site should load. Log
in at `/login` with `admin@mafaz.dz` / `Mafaz@2025`.

> The Neon database is already created and seeded, so it works immediately.

---

## Alternative: build on the server (needs SSH/Terminal + enough RAM)

If your plan has SSH/Terminal and ≥1 GB build memory:

1. Upload the whole project (without `node_modules` and `.next`).
2. In Setup Node.js App, create the app (startup file `server.js`), then click
   **Run NPM Install**.
3. Open Terminal, `cd` into the app, activate the env (cPanel shows the
   `source ...activate` command), then run `npm run build`.
4. Set the startup file to `server.js` and add a root `server.js`:
   ```js
   const next = require("next");
   const { createServer } = require("http");
   const app = next({ dev: false });
   const handle = app.getRequestHandler();
   app.prepare().then(() => {
     createServer((req, res) => handle(req, res)).listen(process.env.PORT || 3000);
   });
   ```
5. Add the env vars (step 4 above) and Restart.

---

## Updating the site later

Re-run `npm run deploy:cpanel` locally, re-upload the `.next/standalone`
contents (overwrite), and click **Restart** in Setup Node.js App.

## Notes

- Keep `@neondatabase/serverless` on **0.9.x** (matches `drizzle-orm@0.33`).
- `output: "standalone"` in `next.config.mjs` is what makes the lightweight
  deploy folder. Don't remove it.
- Schema/seed changes run from your PC against Neon (`npm run db:push` /
  `npm run db:seed`) — you don't run those on cPanel.
