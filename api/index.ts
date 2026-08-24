import type { IncomingMessage, ServerResponse } from "node:http";

// Dynamically import to avoid top-level await issues
let handler: ((req: IncomingMessage, res: ServerResponse) => void) | null = null;

async function getHandler() {
  if (!handler) {
    const { default: app } = await import("../server/index.js");
    handler = app;
  }
  return handler;
}

export default async function vercelHandler(
  req: IncomingMessage,
  res: ServerResponse
) {
  const h = await getHandler();
  h(req, res);
}
