import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { verifyToken } from "./auth.js";
import { findUserById } from "./db.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string; name: string };
    }
  }
}

export const authLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.wl_token as string | undefined;
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return res.status(401).json({ error: "Authentication required." });
  }
  const user = await findUserById(payload.sub);
  if (!user) {
    return res.status(401).json({ error: "User no longer exists." });
  }
  req.user = { id: user.id, email: user.email, name: user.name };
  next();
}

// Accepts either a logged-in cookie session or the shared API_TOKEN (for
// non-browser / headless clients). Used to gate the paid AI proxy.
export function requireAuthOrToken(req: Request, res: Response, next: NextFunction) {
  if (config.apiToken && req.get("x-api-key") === config.apiToken) {
    return next();
  }
  return requireAuth(req, res, next);
}
