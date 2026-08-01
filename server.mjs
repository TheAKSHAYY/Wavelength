import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(root, "dist");

await loadEnv();

const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (url.pathname === "/api/generate" && req.method === "POST") {
      await handleGenerate(req, res);
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    await serveStatic(url.pathname, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Server error" });
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Wavelength running at http://127.0.0.1:${port}`);
});

async function handleGenerate(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    sendJson(res, 400, { error: "OPENAI_API_KEY is not set" });
    return;
  }

  const body = await readJson(req);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5",
      instructions: `${body.system || "Return only valid JSON."}

You are powering a production dashboard. Return exactly one valid JSON value and nothing else. Do not wrap it in markdown. Keep strings concise and make every field practical, specific, and safe to display in a UI.`,
      input: body.prompt || "",
      max_output_tokens: 2200,
      tools: body.useWebSearch ? [{ type: "web_search" }] : undefined,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    sendJson(res, response.status, {
      error: data.error?.message || `OpenAI API error ${response.status}`,
    });
    return;
  }

  const text =
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content || [])
      ?.filter((item) => item.type === "output_text")
      ?.map((item) => item.text)
      ?.join("\n") ||
    "";

  sendJson(res, 200, { text });
}

async function serveStatic(pathname, res) {
  if (!existsSync(distDir)) {
    sendText(res, 503, "Run npm run build first.");
    return;
  }

  const requested = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const normalizedPath = normalize(requested).replace(/^(\.\.[\\/])+/, "");
  let filePath = join(distDir, normalizedPath);

  if (!filePath.startsWith(distDir)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  if (!existsSync(filePath)) {
    filePath = join(distDir, "index.html");
  }

  const content = await readFile(filePath);
  res.writeHead(200, {
    "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
  });
  res.end(content);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

async function loadEnv() {
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) return;

  const lines = (await readFile(envPath, "utf8")).split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalIndex = trimmed.indexOf("=");
    if (equalIndex === -1) continue;

    const key = trimmed.slice(0, equalIndex).trim();
    const value = trimmed.slice(equalIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}
