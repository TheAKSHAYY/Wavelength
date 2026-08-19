import { z } from "zod";
import { api, ApiError } from "./client";
import { extractJSON } from "./parse";

interface GenerateOptions {
  system: string;
  prompt: string;
  useWebSearch?: boolean;
}

export function parseModelJSON<T>(schema: z.ZodType<T>, text: string): T {
  const json = extractJSON(text);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const paths = parsed.error.issues
      .map((i) => i.path.join("."))
      .filter(Boolean)
      .slice(0, 3)
      .join(", ");
    throw new Error(
      `Model response didn't match the expected shape${paths ? ` (${paths})` : ""}. Try again.`
    );
  }
  return parsed.data;
}

export async function generateJSON<T>(
  schema: z.ZodType<T>,
  options: GenerateOptions
): Promise<T> {
  try {
    const res = await api.post<{ text: string }>("/api/generate", {
      system: options.system,
      prompt: options.prompt,
      useWebSearch: Boolean(options.useWebSearch),
    });
    return parseModelJSON(schema, res.text);
  } catch (err) {
    if (err instanceof ApiError && err.status >= 500) {
      const res = await api.post<{ text: string }>("/api/gemini/generate", {
        system: options.system,
        prompt: options.prompt,
      });
      return parseModelJSON(schema, res.text);
    }
    throw err;
  }
}

export function uid(): string {
  return crypto.randomUUID();
}

export function withIds<T>(items: T[]): Array<T & { id: string }> {
  return items.map((item) => ({ id: uid(), ...item }));
}
