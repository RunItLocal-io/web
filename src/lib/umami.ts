// Umami events sent from the server, for things that happen with no browser involved (a post sent in through the API).
// Uses the same collect endpoint as the tracker script. Our proxy at a.darkcompute.io serves it as /assets/event;
// stock Umami's /api/send isn't exposed there. Never throws and never holds up the response for long.

const COLLECT = process.env.UMAMI_COLLECT_URL || "https://a.darkcompute.io/assets/event";
const WEBSITE = process.env.UMAMI_WEBSITE_ID || "5ff26a63-3965-4186-9fdb-1cf7f036e494";
// Umami drops events from user agents that look like bots, and needs one to make a session.
const UA = "Mozilla/5.0 (X11; Linux x86_64) RunItLocal-Server/1.0";

export async function serverEvent(req: Request, name: string, url: string, data: Record<string, string | number>) {
  if (process.env.NODE_ENV !== "production" && !process.env.UMAMI_COLLECT_URL) return;
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim();
  try {
    await fetch(COLLECT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": UA, ...(ip ? { "X-Forwarded-For": ip } : {}) },
      body: JSON.stringify({ type: "event", payload: { website: WEBSITE, hostname: "runitlocal.io", language: "en-US", screen: "0x0", url, name, data } }),
      signal: AbortSignal.timeout(3000),
    });
  } catch { /* analytics never breaks a submission */ }
}
