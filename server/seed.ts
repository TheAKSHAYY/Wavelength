import "dotenv/config";
import { randomUUID } from "node:crypto";
import { createUser, findUserByEmail, updateUserPassword } from "./db.js";
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

async function main() {
  const existing = await findUserByEmail(DEV_EMAIL);
  if (existing) {
    await updateUserPassword(existing.id, hashPassword(DEV_PASSWORD));
    console.log(`Dev account updated → ${DEV_EMAIL}`);
  } else {
    await createUser({
      id: randomUUID(),
      email: DEV_EMAIL,
      name: "Wavelength Dev",
      password_hash: hashPassword(DEV_PASSWORD),
    });
    console.log(`Dev account created → ${DEV_EMAIL}`);
  }
  console.log(`Sign in with: email ${DEV_EMAIL} / password ${DEV_PASSWORD}`);
}

main().catch((err) => {
  console.error("Failed to seed dev account:", err);
  process.exit(1);
});

