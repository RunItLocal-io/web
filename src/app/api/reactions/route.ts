// GET: views and vote totals for every article. POST { slug, action: "view" } counts a view; POST { slug,
// action: "vote", voter, vote: 1 | -1 | 0 } sets that browser's vote. Both answer with the article's new totals.
// Only real articles count, views once per IP per article per day, votes rate limited per IP.

import { connection } from "next/server";
import { posts } from "@/lib/learn";
import { addView, reactions, vote } from "@/lib/reactions";

const DAY = 864e5, HOUR = 3600_000, VOTES_PER_HOUR = 60;
const seen = new Map<string, number>();
const voted = new Map<string, number[]>();

const ipOf = (req: Request) => req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";

export async function GET() {
  await connection();
  const all = await reactions(posts().map(p => p.slug));
  return Response.json(all, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const text = await req.text();
  if (text.length > 1024) return Response.json({ error: "Too long." }, { status: 413 });
  let b: Record<string, unknown>;
  try { b = JSON.parse(text); } catch { return Response.json({ error: "Send JSON." }, { status: 400 }); }
  const slug = typeof b.slug === "string" ? b.slug : "";
  if (!posts().some(p => p.slug === slug)) return Response.json({ error: "No such article." }, { status: 404 });
  const ip = ipOf(req), now = Date.now();

  if (b.action === "view") {
    const key = ip + " " + slug;
    if (now - (seen.get(key) ?? 0) < DAY) return Response.json((await reactions([slug]))[slug]);
    seen.set(key, now);
    if (seen.size > 100_000) for (const [k, t] of seen) if (now - t > DAY) seen.delete(k);
    return Response.json(await addView(slug));
  }

  if (b.action === "vote") {
    const voter = typeof b.voter === "string" && /^[a-f0-9]{16,32}$/.test(b.voter) ? b.voter : "";
    const v = b.vote === 1 || b.vote === -1 || b.vote === 0 ? b.vote : null;
    if (!voter || v === null) return Response.json({ error: "Bad vote." }, { status: 400 });
    const recent = (voted.get(ip) ?? []).filter(t => now - t < HOUR);
    if (recent.length >= VOTES_PER_HOUR) return Response.json({ error: "That's a lot of votes. Try again later." }, { status: 429 });
    recent.push(now);
    voted.set(ip, recent);
    return Response.json(await vote(slug, voter, v));
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
