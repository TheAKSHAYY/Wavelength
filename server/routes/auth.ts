import { randomUUID } from "node:crypto";
import { Router, type Response } from "express";
import { config } from "../config.js";
import { hashPassword, signToken, verifyPassword, verifyToken } from "../auth.js";
import { createUser, findUserByEmail, findUserById, updateUserProfile, updateUserPassword, type UserRow } from "../db.js";
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

function publicUser(user: UserRow | { id: string; email: string; name: string }) {
  const row = user as UserRow;
  let parsedSocial: Record<string, string> = {};
  if (row.social_links) {
    try {
      parsedSocial = typeof row.social_links === "string" ? JSON.parse(row.social_links) : row.social_links;
    } catch {
      parsedSocial = {};
    }
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    channel_name: row.channel_name || "",
    handle: row.handle || "",
    bio: row.bio || "",
    avatar_url: row.avatar_url || "",
    avatar_color: row.avatar_color || "#6366f1",
    niche: row.niche || "",
    target_audience: row.target_audience || "",
    tone: row.tone || "",
    youtube_channel_id: row.youtube_channel_id || "",
    upload_goal: row.upload_goal || "",
    social_links: parsedSocial,
    created_at: row.created_at || new Date().toISOString(),
  };
}

const router = Router();

router.post("/register", authLimiter, async (req, res) => {
  try {
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
    const existing = await findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    const cleanName = String(name ?? "").trim().slice(0, 60) || "creator";
    const user = {
      id: randomUUID(),
      email: cleanEmail,
      name: cleanName,
      avatar_color: "#6366f1",
    };
    await createUser({ ...user, password_hash: hashPassword(password) });
    setTokenCookie(res, signToken(user));
    const created = await findUserById(user.id);
    return res.status(201).json({ user: publicUser(created || user) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    console.error("Register error:", err);
    return res.status(500).json({ error: message });
  }
});

router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = (req.body || {}) as {
      email?: unknown;
      password?: unknown;
    };
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);
    if (!user || !verifyPassword(String(password ?? ""), user.password_hash)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const safe = { id: user.id, email: user.email, name: user.name };
    setTokenCookie(res, signToken(safe));
    return res.json({ user: publicUser(user) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    console.error("Login error:", err);
    return res.status(500).json({ error: message });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE, { path: "/" });
  return res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  const token = req.cookies?.[COOKIE] as string | undefined;
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return res.status(401).json({ error: "Not logged in." });
  }
  const user = await findUserById(payload.sub);
  if (!user) {
    return res.status(401).json({ error: "User no longer exists." });
  }
  return res.json({ user: publicUser(user) });
});

router.put("/profile", async (req, res) => {
  const token = req.cookies?.[COOKIE] as string | undefined;
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return res.status(401).json({ error: "Not logged in." });
  }

  const {
    name,
    channel_name,
    handle,
    bio,
    avatar_url,
    avatar_color,
    niche,
    target_audience,
    tone,
    youtube_channel_id,
    upload_goal,
    social_links,
  } = (req.body || {}) as Record<string, unknown>;

  const updated = await updateUserProfile(payload.sub, {
    name: name !== undefined ? String(name) : undefined,
    channel_name: channel_name !== undefined ? String(channel_name) : undefined,
    handle: handle !== undefined ? String(handle) : undefined,
    bio: bio !== undefined ? String(bio) : undefined,
    avatar_url: avatar_url !== undefined ? String(avatar_url) : undefined,
    avatar_color: avatar_color !== undefined ? String(avatar_color) : undefined,
    niche: niche !== undefined ? String(niche) : undefined,
    target_audience: target_audience !== undefined ? String(target_audience) : undefined,
    tone: tone !== undefined ? String(tone) : undefined,
    youtube_channel_id: youtube_channel_id !== undefined ? String(youtube_channel_id) : undefined,
    upload_goal: upload_goal !== undefined ? String(upload_goal) : undefined,
    social_links: social_links !== undefined ? (typeof social_links === "string" ? social_links : JSON.stringify(social_links)) : undefined,
  });

  if (!updated) {
    return res.status(404).json({ error: "User not found." });
  }

  return res.json({ user: publicUser(updated) });
});

router.put("/password", async (req, res) => {
  const token = req.cookies?.[COOKIE] as string | undefined;
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return res.status(401).json({ error: "Not logged in." });
  }

  const { currentPassword, newPassword } = (req.body || {}) as {
    currentPassword?: unknown;
    newPassword?: unknown;
  };

  if (!currentPassword || typeof currentPassword !== "string") {
    return res.status(400).json({ error: "Current password is required." });
  }
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters." });
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (!verifyPassword(currentPassword, user.password_hash)) {
    return res.status(400).json({ error: "Incorrect current password." });
  }

  await updateUserPassword(user.id, hashPassword(newPassword));
  return res.json({ ok: true, message: "Password updated successfully." });
});

export default router;
