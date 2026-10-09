import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { readFileSync, existsSync } from "node:fs";
import { createApp } from "./app";
import { openDb } from "./db";

const port = Number(process.env.PORT ?? 8787);
const db = openDb(process.env.DB_PATH ?? "data/pillow.db");
const app = createApp({
  db,
  adminPassword: process.env.ADMIN_PASSWORD || undefined,
  upiId: process.env.UPI_ID || undefined,
  price: Number(process.env.PRICE ?? 499),
  trialDays: Number(process.env.TRIAL_DAYS ?? 3),
  secureCookies: process.env.NODE_ENV === "production",
});

// In production, serve the built web app and fall back to index.html for client routes.
if (existsSync("dist/index.html")) {
  const index = readFileSync("dist/index.html", "utf8");
  app.use("/*", serveStatic({ root: "./dist" }));
  app.get("*", (c) => (c.req.path.startsWith("/api/") ? c.notFound() : c.html(index)));
}

if (!process.env.ADMIN_PASSWORD) console.warn("ADMIN_PASSWORD is not set, so /admin is off.");
serve({ fetch: app.fetch, port }, () => console.log(`Pillow API on http://localhost:${port}`));
