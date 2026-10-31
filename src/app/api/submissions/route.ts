// POST { kind, title, body, handle, email, hardware, json, website, utm }: send something in for us to read.
// It goes to a private queue at /admin, never straight onto the site. "website" is a hidden field people never
// fill in; when it has a value, the request came from a bot and is quietly dropped. Rate limited per IP.

import { EMAIL_RE, validate } from "@/lib/bench";
import { KINDS } from "@/lib/submission-kinds";
import { addSubmission, tidy, tidyUtm } from "@/lib/submissions";
import { serverEvent } from "@/lib/umami";

const MAX_BYTES = 64 * 1024;
const LIMIT = 10;
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
  const text = await req.text();
  if (text.length > MAX_BYTES) return Response.json({ error: "That's too long for one post. Trim it down a little." }, { status: 413 });
  let b: Record<string, unknown>;
  try { b = JSON.parse(text); } catch { return Response.json({ error: "Send JSON." }, { status: 400 }); }
  if (b.website) return Response.json({ ok: true });

  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!allowed(ip)) return Response.json({ error: "That's a lot from one place. Try again in an hour." }, { status: 429 });

  const kind = KINDS.find(k => k.id === b.kind)?.id;
  if (!kind) return Response.json({ error: "Pick what you're sending." }, { status: 400 });
  const title = tidy(b.title, 120), body = tidy(b.body, 4000), email = tidy(b.email, 120), json = tidy(b.json, MAX_BYTES);
  const errors: string[] = [];
  if (title.length < 3) errors.push("Give it a short title.");
  if (email && !EMAIL_RE.test(email)) errors.push("That email doesn't look right. It's optional, so you can leave it empty.");
  let run = null;
  if (json) {
    const v = validate(json);
    if (v.errors.length) errors.push(...v.errors.map(e => "Benchmark JSON: " + e));
    else run = v.clean ?? null;
  }
  if (!body && !run) errors.push(kind === "run" ? "Tell us the numbers, or paste the benchmark JSON." : "Tell us a bit more.");
  if (errors.length) return Response.json({ error: "Almost. Fix these and send it again:", errors }, { status: 400 });

  const ok = await addSubmission({ kind, title, body, handle: tidy(b.handle, 40), email, hardware: tidy(b.hardware, 120), run, utm: tidyUtm(b.utm) });
  if (!ok) return Response.json({ error: "Our inbox is full right now. Try again later." }, { status: 503 });
  await serverEvent(req, "post_submitted", "/articles", { kind, benchmark: run ? "yes" : "no" });
  return Response.json({ ok: true });
}
