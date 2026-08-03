import { Router } from "express";
import { getState, setState } from "../db.js";
import { requireAuth } from "../middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", (req, res) => {
  const state = getState(req.user!.id);
  return res.json({ state });
});

router.put("/", (req, res) => {
  const { state } = (req.body || {}) as { state?: unknown };
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return res.status(400).json({ error: "Expected { state: object }." });
  }
  const json = JSON.stringify(state);
  if (json.length > 2 * 1024 * 1024) {
    return res.status(413).json({ error: "State is too large." });
  }
  setState(req.user!.id, json);
  return res.json({ ok: true });
});

export default router;
