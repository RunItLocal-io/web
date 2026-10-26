// Hands out a one-time submit token for a name and a test. Rate limited per IP so the file can't be flooded.

import { createClaim } from "@/lib/rigs";

const LIMIT = 20;
const WINDOW_MS = 3600_000;
const hits = new Map<string, number[]>();

function allowed(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) return false;
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

export async function POST(req: Request) {
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!allowed(ip)) return Response.json({ error: "Too many prompts from here. Try again in an hour." }, { status: 429 });
  const body = await req.json().catch(() => ({})) as { handle?: unknown; use?: unknown; tier?: unknown };
  return Response.json({ token: await createClaim(body.handle, body.use, body.tier) });
}
