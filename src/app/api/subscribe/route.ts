// POST { email, source, website }: join the podcast list. "website" is a hidden field people never fill in;
// when it has a value, the request came from a bot and is quietly dropped.

import { EMAIL_RE } from "@/lib/bench";
import { subscribe } from "@/lib/subscribers";

export async function POST(req: Request) {
  const text = await req.text();
  if (text.length > 2048) return Response.json({ error: "Too big." }, { status: 413 });
  let body: { email?: unknown; source?: unknown; website?: unknown };
  try { body = JSON.parse(text); } catch { return Response.json({ error: "Send JSON." }, { status: 400 }); }
  if (body.website) return Response.json({ ok: true });
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (email.length > 120 || !EMAIL_RE.test(email)) return Response.json({ error: "That email doesn't look right." }, { status: 400 });
  const ok = await subscribe(email, typeof body.source === "string" ? body.source : "site");
  if (!ok) return Response.json({ error: "The list is full right now. Try again later." }, { status: 503 });
  return Response.json({ ok: true });
}
