import "dotenv/config";
import { randomUUID } from "node:crypto";
import { db } from "./db.js";
import { hashPassword } from "./auth.js";

/**
 * Local-development account seeder.
 *
 * Creates (or refreshes) a known dev account so the dashboard can be signed
 * into immediately from the login screen without going through registration.
 *
 * This is a developer convenience only. It is intentionally idempotent (upsert
 * by email) so it can be re-run safely. Do NOT rely on it in production —
 * instead set a strong JWT_SECRET and let users register real accounts.
 *
 * Usage:  npm run seed:dev
 */

const DEV_EMAIL = "admin@wavelength.local";
const DEV_PASSWORD = "password123";

db.prepare(
  `INSERT INTO users (id, email, name, password_hash)
   VALUES (?, ?, ?, ?)
   ON CONFLICT(email) DO UPDATE SET name = excluded.name, password_hash = excluded.password_hash`
).run(randomUUID().toString(), DEV_EMAIL, "Wavelength Dev", hashPassword(DEV_PASSWORD));

const row = db.prepare("SELECT id, email, name FROM users WHERE email = ?").get(
  DEV_EMAIL
) as { id: string; email: string; name: string } | undefined;

if (!row) {
  console.error("Failed to seed dev account.");
  process.exit(1);
}

console.log(`Dev account ready → ${row.email}`);
console.log(`Sign in with: email ${DEV_EMAIL} / password ${DEV_PASSWORD}`);
