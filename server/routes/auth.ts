import { randomUUID } from "node:crypto";
import { Router, type Response } from "express";
import { config } from "../config.js";
import { hashPassword, signToken, verifyPassword, verifyToken } from "../auth.js";
import { createUser, findUserByEmail, findUserById } from "../db.js";
import { authLimiter } from "../middleware.js";

const COOKIE = "wl_token";

function setTokenCookie(res: Response, token: string) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.cookieSecure,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function publicUser(user: { id: string; email: string; name: string }) {
  return { id: user.id, email: user.email, name: user.name };
}

const router = Router();

router.post("/register", authLimiter, (req, res) => {
  const { email, password, name } = (req.body || {}) as {
    email?: unknown;
    password?: unknown;
    name?: unknown;
  };

  const cleanEmail = String(email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: "A valid email is required." });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }
  if (findUserByEmail(cleanEmail)) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const cleanName = String(name ?? "").trim().slice(0, 60) || "creator";
  const user = { id: randomUUID(), email: cleanEmail, name: cleanName };
  createUser({ ...user, password_hash: hashPassword(password) });
  setTokenCookie(res, signToken(user));
  return res.status(201).json({ user: publicUser(user) });
});

router.post("/login", authLimiter, (req, res) => {
  const { email, password } = (req.body || {}) as {
    email?: unknown;
    password?: unknown;
  };
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  const user = findUserByEmail(cleanEmail);
  if (!user || !verifyPassword(String(password ?? ""), user.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  const safe = { id: user.id, email: user.email, name: user.name };
  setTokenCookie(res, signToken(safe));
  return res.json({ user: publicUser(safe) });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE, { path: "/" });
  return res.json({ ok: true });
});

router.get("/me", (req, res) => {
  const token = req.cookies?.[COOKIE] as string | undefined;
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return res.status(401).json({ error: "Not logged in." });
  }
  const user = findUserById(payload.sub);
  if (!user) {
    return res.status(401).json({ error: "User no longer exists." });
  }
  return res.json({ user: publicUser(user) });
});

export default router;
