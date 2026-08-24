import { config } from "../config.js";
import { synthesizeRealYouTubeResponse } from "./realDataSynthesizer.js";

export interface AICompletionOptions {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
  useWebSearch?: boolean;
  jsonMode?: boolean;
}

export interface AICompletionResult {
  text: string;
  provider: "gemini" | "groq" | "openrouter" | "openai" | "youtube-synthesizer" | "mock-engine";
  modelUsed?: string;
}

/**
 * Multi-model cascade for Gemini to handle temporary demand/rate-limit spikes.
 * Prioritizes ultra-fast lightweight models with highest availability.
 */
const GEMINI_MODELS_CASCADE = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
];

/**
 * Call Google Gemini API with automatic model cascade and optional native JSON / Search Grounding
 */
async function callGemini(options: AICompletionOptions): Promise<{ text: string; model: string } | null> {
  if (!config.geminiApiKey) return null;

  const modelsToTry = Array.from(
    new Set([config.geminiModel || "gemini-3.5-flash-lite", ...GEMINI_MODELS_CASCADE])
  );

  const systemPart = options.system ? `${options.system}\n\n` : "";
  const fullText = `${systemPart}${options.prompt}`.trim();

  for (const model of modelsToTry) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const requestBody: Record<string, any> = {
        contents: [{ role: "user", parts: [{ text: fullText }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 3500,
          ...(options.jsonMode ? { responseMimeType: "application/json" } : {}),
        },
      };

      if (options.useWebSearch) {
        requestBody.tools = [{ google_search: {} }];
      }

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
          config.geminiApiKey
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);

      if (!resp.ok) {
        const errText = await resp.text();
        console.warn(`Gemini API [${model}] status ${resp.status}:`, errText.slice(0, 120));
        continue; // Immediately failover to next model in cascade
      }

      const data = (await resp.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };

      const text = (data.candidates || [])
        .flatMap((c) => c.content?.parts || [])
        .flatMap((p) => (p.text ? [p.text] : []))
        .join("\n")
        .trim();

      if (text) {
        return { text, model };
      }
    } catch (err) {
      console.warn(`Gemini API [${model}] network/timeout error:`, err);
    }
  }

  return null;
}

/**
 * Call Groq Cloud API (Free tier: ultra-fast Llama 3.3 70B & DeepSeek R1)
 */
async function callGroq(options: AICompletionOptions): Promise<string | null> {
  if (!config.groqApiKey) return null;

  try {
    const messages: Array<{ role: "system" | "user"; content: string }> = [];
    if (options.system?.trim()) {
      messages.push({ role: "system", content: options.system.trim() });
    }
    messages.push({ role: "user", content: options.prompt.trim() });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14000);

    const reqBody: Record<string, any> = {
      model: config.groqModel || "llama-3.3-70b-versatile",
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    };

    if (options.jsonMode) {
      reqBody.response_format = { type: "json_object" };
    }

    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.groqApiKey}`,
      },
      body: JSON.stringify(reqBody),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      console.warn("Groq API returned error status:", resp.status, await resp.text());
      return null;
    }

    const data = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (err) {
    console.warn("Groq API error in aiProvider:", err);
    return null;
  }
}

/**
 * Call OpenRouter API (Free open models e.g. meta-llama/llama-3.3-70b-instruct:free)
 */
async function callOpenRouter(options: AICompletionOptions): Promise<string | null> {
  if (!config.openrouterApiKey) return null;

  try {
    const messages: Array<{ role: "system" | "user"; content: string }> = [];
    if (options.system?.trim()) {
      messages.push({ role: "system", content: options.system.trim() });
    }
    messages.push({ role: "user", content: options.prompt.trim() });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const reqBody: Record<string, any> = {
      model: config.openrouterModel || "meta-llama/llama-3.3-70b-instruct:free",
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    };

    if (options.jsonMode) {
      reqBody.response_format = { type: "json_object" };
    }

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openrouterApiKey}`,
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Wavelength YouTube Dashboard",
      },
      body: JSON.stringify(reqBody),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      console.warn("OpenRouter API returned error status:", resp.status, await resp.text());
      return null;
    }

    const data = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (err) {
    console.warn("OpenRouter API error in aiProvider:", err);
    return null;
  }
}

/**
 * Call OpenAI or custom OpenAI-compatible endpoint (Ollama / vLLM / Local AI)
 */
async function callOpenAICompatible(options: AICompletionOptions): Promise<string | null> {
  const apiKey = config.openaiApiKey;
  const baseUrl = config.openaiBaseUrl.replace(/\/$/, "");
  const isCustomLocal = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

  // If standard OpenAI and no key, skip. If custom local endpoint (e.g. Ollama), key is optional
  if (!apiKey && !isCustomLocal) return null;

  try {
    const messages: Array<{ role: "system" | "user"; content: string }> = [];
    if (options.system?.trim()) {
      messages.push({ role: "system", content: options.system.trim() });
    }
    messages.push({ role: "user", content: options.prompt.trim() });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);

    const reqBody: Record<string, any> = {
      model: config.openaiModel || "gpt-4o-mini",
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    };

    if (options.jsonMode) {
      reqBody.response_format = { type: "json_object" };
    }

    const resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(reqBody),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      console.warn("OpenAI / OpenAI-compatible API error status:", resp.status, await resp.text());
      return null;
    }

    const data = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (err) {
    console.warn("OpenAI / Custom Base API error in aiProvider:", err);
    return null;
  }
}

/**
 * Executes multi-provider AI completion with automatic cascading fallback.
 * Throws explicit error if all real providers fail so the UI presents an authentic error
 * state instead of silently faking output with hardcoded mock fixtures.
 */
export async function generateAICompletion(
  options: AICompletionOptions
): Promise<AICompletionResult> {
  const systemStr = options.system || "";
  const promptStr = options.prompt || "";

  // 1. Try Google Gemini (Multi-model cascade)
  if (config.geminiApiKey) {
    const geminiRes = await callGemini(options);
    if (geminiRes?.text) {
      return { text: geminiRes.text, provider: "gemini", modelUsed: geminiRes.model };
    }
  }

  // 2. Try Groq (Ultra-low latency Llama 3.3)
  if (config.groqApiKey) {
    const groqText = await callGroq(options);
    if (groqText) {
      return { text: groqText, provider: "groq", modelUsed: config.groqModel };
    }
  }

  // 3. Try OpenRouter (Free Open-Source models)
  if (config.openrouterApiKey) {
    const openrouterText = await callOpenRouter(options);
    if (openrouterText) {
      return { text: openrouterText, provider: "openrouter", modelUsed: config.openrouterModel };
    }
  }

  // 4. Try OpenAI or Local Ollama
  if (config.openaiApiKey || config.openaiBaseUrl.includes("localhost") || config.openaiBaseUrl.includes("127.0.0.1")) {
    const openaiText = await callOpenAICompatible(options);
    if (openaiText) {
      return { text: openaiText, provider: "openai", modelUsed: config.openaiModel };
    }
  }

  // 5. Try Real YouTube Data Synthesizer (only if configured and relevant)
  if (config.youtubeApiKey) {
    try {
      const realYouTubeData = await synthesizeRealYouTubeResponse(systemStr, promptStr);
      if (realYouTubeData) {
        return { text: realYouTubeData, provider: "youtube-synthesizer" };
      }
    } catch (err) {
      console.warn("Real YouTube data synthesis error in aiProvider:", err);
    }
  }

  // If all real providers fail, raise a clear error so the user and frontend know
  // the AI request failed rather than displaying deceptive hardcoded mock data.
  const configuredProviders = [
    config.geminiApiKey ? "Gemini" : null,
    config.groqApiKey ? "Groq" : null,
    config.openrouterApiKey ? "OpenRouter" : null,
    config.openaiApiKey ? "OpenAI" : null,
  ].filter(Boolean);

  const providerMsg = configuredProviders.length
    ? `Configured providers (${configuredProviders.join(", ")}) were exhausted or unavailable.`
    : "No active AI API key found in configuration (e.g. GEMINI_API_KEY, GROQ_API_KEY, OPENAI_API_KEY).";

  throw new Error(`AI generation unavailable: ${providerMsg} Please check your API key or try again in a few moments.`);
}

