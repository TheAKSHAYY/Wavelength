import { Router } from "express";
import { getState, setState } from "../db.js";
import { requireAuth } from "../middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const state = await getState(req.user!.id);
    return res.json({ state });
  } catch (err: unknown) {
    console.error("getState error:", err);
    return res.status(500).json({ error: "Failed to load state." });
  }
});

router.put("/", async (req, res) => {
  try {
    const { state } = (req.body || {}) as { state?: unknown };
    if (!state || typeof state !== "object" || Array.isArray(state)) {
      return res.status(400).json({ error: "Expected { state: object }." });
    }
    const json = JSON.stringify(state);
    if (json.length > 2 * 1024 * 1024) {
      return res.status(413).json({ error: "State is too large." });
    }
    await setState(req.user!.id, json);
    return res.json({ ok: true });
  } catch (err: unknown) {
    console.error("setState error:", err);
    return res.status(500).json({ error: "Failed to save state." });
  }
});

export default router;
