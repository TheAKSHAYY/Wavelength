import { Router } from "express";
import { config } from "../config.js";
import { aiLimiter, requireAuthOrToken } from "../middleware.js";
import { searchYouTubeVideos } from "../services/youtubeResearch.js";

const router = Router();

router.use(aiLimiter, requireAuthOrToken);

router.post("/", async (req, res) => {
  const { message, history } = (req.body || {}) as {
    message?: string;
    history?: Array<{ role: "user" | "ai"; content: string }>;
  };

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Missing message in request body." });
  }

  const userQuery = message.trim();

  // 1. Try OpenAI if available
  if (config.openaiApiKey) {
    try {
      const messages = [
        {
          role: "system",
          content:
            "You are Wavelength AI, an expert YouTube strategist and growth assistant. You help creators find viral topics, increase CTR, write captivating hooks/scripts, analyze competitors, and optimize video retention. Give concise, actionable, formatting-rich advice with bullet points and bold highlights.",
        },
        ...(history || []).slice(-6).map((h) => ({
          role: h.role === "ai" ? "assistant" : "user",
          content: h.content,
        })),
        { role: "user", content: userQuery },
      ];

      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: config.openaiModel || "gpt-4o-mini",
          messages,
          temperature: 0.7,
        }),
      });

      if (openaiRes.ok) {
        const data = (await openaiRes.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const reply = data.choices?.[0]?.message?.content;
        if (reply && reply.trim()) {
          return res.json({ reply: reply.trim() });
        }
      }
    } catch (err) {
      console.warn("Chat OpenAI error:", err);
    }
  }

  // 2. Try Gemini if available
  if (config.geminiApiKey) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are Wavelength AI, a YouTube growth and content expert. Help the creator with: "${userQuery}". Give clear, high-impact bullet points, actionable tips, and strategic advice.`,
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        }
      );

      if (geminiRes.ok) {
        const data = (await geminiRes.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply && reply.trim()) {
          return res.json({ reply: reply.trim() });
        }
      }
    } catch (err) {
      console.warn("Chat Gemini error:", err);
    }
  }

  // 3. Fallback to Live YouTube Data & intelligent guidance
  let extraInsights = "";
  if (config.youtubeApiKey) {
    try {
      const videos = await searchYouTubeVideos(userQuery, { maxResults: 3 });
      if (videos.length > 0) {
        extraInsights = `\n\n📌 **Live YouTube Benchmark Data for "${userQuery}":**\n` +
          videos.map((v) => `• **${v.title}** by *${v.channelTitle}* (${(v.views / 1000).toFixed(0)}K views)`).join("\n");
      }
    } catch (e) {
      console.error(e);
    }
  }

  const defaultAdvice =
    `Here is strategic advice for **"${userQuery}"**:\n\n` +
    `1. **Focus on High-CTR Hooks:** The first 5-10 seconds determine 70% of video retention. Start with an intriguing problem or visual curiosity gap rather than a generic introduction.\n` +
    `2. **Title Patterning:** Use contrast and curiosity (e.g., *"Why Everyone is Wrong About..."* or *"I Tested... in Production"*).\n` +
    `3. **Visual Packaging:** Ensure your thumbnail has at most 3-4 focal points and 2-4 words in bold, high-contrast typography.\n` +
    `4. **Audience Demand:** Deliver high-density value in under 12 minutes to maximize watch time percentage.` +
    extraInsights;

  return res.json({ reply: defaultAdvice });
});

export default router;
