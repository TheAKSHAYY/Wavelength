import { Router } from "express";
import { aiLimiter, requireAuthOrToken } from "../middleware.js";
import { generateAICompletion } from "../services/aiProvider.js";

const router = Router();

router.use(aiLimiter, requireAuthOrToken);

const SYSTEM_PROMPT = `You are Wavelength AI, a world-class YouTube strategist, channel mentor, and viral content consultant.
You help creators:
- Brainstorm viral video ideas tailored to their exact niche and topic.
- Formulate high-CTR titles using curiosity gaps, open loops, and high emotional stakes.
- Write captivating hooks, retention-optimized scripts, and community-building CTAs.
- Analyze competitors and find content gaps.
- Structure long-term channel roadmaps and packaging blueprints.

CRITICAL RULES:
1. Always understand and adapt to the user's specific topic, niche, and language (English, Hindi, Hinglish, etc.).
2. Never default to programming or software examples unless the user is specifically asking about coding/tech.
3. Provide comprehensive, actionable, and structured responses formatted with clear markdown headings, bullet points, and bold emphasis.
4. Keep the tone encouraging, high-energy, and creator-focused.`;

router.post("/", async (req, res) => {
  const { message, history } = (req.body || {}) as {
    message?: string;
    history?: Array<{ role: "user" | "ai"; content: string }>;
  };

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Missing message in request body." });
  }

  const userQuery = message.trim();

  try {
    // Format multi-turn conversation history cleanly
    const recentHistory = (history || []).slice(-8).filter((h) => h.content && h.content.trim());
    
    let conversationText = "";
    if (recentHistory.length > 0) {
      conversationText = recentHistory
        .map((h) => `${h.role === "ai" ? "Wavelength Strategist" : "Creator"}: ${h.content.trim()}`)
        .join("\n\n");
    }

    const fullPrompt = conversationText
      ? `Conversation History:\n${conversationText}\n\nCreator: ${userQuery}\n\nWavelength Strategist:`
      : `Creator: ${userQuery}\n\nWavelength Strategist:`;

    const aiResult = await generateAICompletion({
      system: SYSTEM_PROMPT,
      prompt: fullPrompt,
      temperature: 0.7,
      maxTokens: 3000,
    });

    if (aiResult && aiResult.text && aiResult.text.trim()) {
      return res.json({ reply: aiResult.text.trim() });
    }

    throw new Error("AI did not return a response.");
  } catch (err: any) {
    console.error("Chat generation error:", err);
    return res.status(500).json({
      error: `Chat AI generation failed: ${err.message || "Unknown error"}. Please try again.`,
    });
  }
});

export default router;

