import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import type { User } from "./db.js";

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  );
}

interface TokenPayload {
  sub: string;
  email: string;
  name: string;
}

export function signToken(user: User): string {
  return jwt.sign({ email: user.email, name: user.name } as TokenPayload, config.jwtSecret, {
    subject: user.id,
    expiresIn: config.jwtExpiresIn,
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    if (!payload.sub) return null;
    return payload;
  } catch {
    return null;
  }
}
