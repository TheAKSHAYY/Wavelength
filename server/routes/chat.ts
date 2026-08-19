import { Router } from "express";
import { config } from "../config.js";
import { aiLimiter, requireAuthOrToken } from "../middleware.js";
import { searchYouTubeVideos } from "../services/youtubeResearch.js";

const router = Router();

router.use(aiLimiter, requireAuthOrToken);

const SYSTEM_PROMPT =
  "You are Wavelength AI, a world-class YouTube strategist, channel mentor, and viral content consultant. You help creators find viral topics, formulate high-CTR titles (using curiosity gaps, open loops, and high emotional stakes), write captivating hooks and retention-optimized scripts, analyze competitor gaps, and structure their content roadmap. Always provide comprehensive, complete, highly practical responses formatted with markdown headings, bullet points, and bold emphasis. Never stop or truncate mid-sentence.";

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
        { role: "system", content: SYSTEM_PROMPT },
        ...(history || []).slice(-8).map((h) => ({
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
          max_tokens: 3000,
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
      } else {
        const errorText = await openaiRes.text();
        console.warn("OpenAI API returned non-200, falling back to Gemini:", openaiRes.status, errorText.slice(0, 150));
      }
    } catch (err) {
      console.warn("Chat OpenAI error, falling back:", err);
    }
  }

  // 2. Try Gemini if available
  if (config.geminiApiKey) {
    try {
      const model = config.geminiModel || "gemini-2.0-flash";
      
      // Build proper multi-turn history for Gemini
      const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

      // Add conversation history
      const recentHistory = (history || []).slice(-8);
      for (const item of recentHistory) {
        contents.push({
          role: item.role === "ai" ? "model" : "user",
          parts: [{ text: item.content }],
        });
      }

      // Add current user query
      contents.push({
        role: "user",
        parts: [{ text: userQuery }],
      });

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
            },
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
      } else {
        const errorText = await geminiRes.text();
        console.warn("Gemini API returned non-200:", geminiRes.status, errorText.slice(0, 150));
      }
    } catch (err) {
      console.warn("Chat Gemini error:", err);
    }
  }

  // 3. Fallback to Live YouTube Data & intelligent guidance
  let extraInsights = "";
  if (config.youtubeApiKey) {
    try {
      const videos = await searchYouTubeVideos(userQuery, { maxResults: 4 });
      if (videos.length > 0) {
        extraInsights =
          `\n\n📌 **Live YouTube Benchmark Data for "${userQuery}":**\n` +
          videos
            .map(
              (v) =>
                `• **${v.title}** by *${v.channelTitle}* (${(v.views / 1000).toFixed(0)}K views)`
            )
            .join("\n");
      }
    } catch (e) {
      console.error("YouTube search error:", e);
    }
  }

  const defaultAdvice =
    `### Strategic Recommendations for **"${userQuery}"**\n\n` +
    `Here is a proven YouTube strategy breakdown for this topic:\n\n` +
    `1. **Focus on the 0-15s Retention Hook:**\n` +
    `   - Never open with a generic greeting or logo animation.\n` +
    `   - State the high-stakes problem or show the finished end-result in the first 5 seconds to lock in audience curiosity.\n\n` +
    `2. **High-CTR Title Angles:**\n` +
    `   - **The Contrast Angle:** *"I Rebuilt [System] From Scratch (Here's What Broke)"*\n` +
    `   - **The Counter-Intuitive Angle:** *"Why Everyone is Wrong About ${userQuery}"*\n` +
    `   - **The Speedrun Angle:** *"Master ${userQuery} in 15 Minutes (Zero Fluff)"*\n\n` +
    `3. **Thumbnail Visual Hierarchy:**\n` +
    `   - Limit text to 2-4 punchy words.\n` +
    `   - Use complementary high-contrast colors (e.g. Amber & Dark Blue or Emerald & Charcoal) to stand out on mobile feeds.\n\n` +
    `4. **Pacing & Micro-Payoffs:**\n` +
    `   - Insert a visual diagram, code walkthrough, or key takeaway every 90 seconds to maintain high viewer velocity.` +
    extraInsights;

  return res.json({ reply: defaultAdvice });
});

export default router;
