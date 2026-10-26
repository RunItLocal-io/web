// Umami custom events, and the two things the tracker needs from us: one pageview per real navigation, and the
// utm_* params a visitor landed with, kept so a leaderboard run can be traced back to the post that sent them.
// The tracker is loaded in app/layout.tsx. If it's blocked, or turned off at /notrack, all of this does nothing.

type Data = Record<string, string | number | boolean>;
type Payload = { url?: string; name?: string };

declare global {
  interface Window {
    umami?: { track(name: string, data?: Data): void };
    /** Named by data-before-send on the tracker script. Returning null drops the event. */
    umamiBeforeSend?: (type: string, payload: Payload) => Payload | null;
  }
}

// The tracker loads after hydration, so events from the first moments (the Studio's checks, a model reopening)
// wait for it briefly. If it never shows up, it's blocked: drop them.
const early: [string, Data | undefined][] = [];
let waited = 0, timer = 0;

function send(name: string, data?: Data) {
  try { window.umami?.track(name, data); } catch { /* blocked or broken: never matters to the page */ }
}

export function track(name: string, data?: Data) {
  if (window.umami) return send(name, data);
  early.push([name, data]);
  if (timer) return;
  timer = window.setInterval(() => {
    if (window.umami) early.splice(0).forEach(([n, d]) => send(n, d));
    else if (++waited < 40) return;
    else early.length = 0;
    clearInterval(timer); timer = 0; waited = 0;
  }, 250);
}

/**
 * The tracker counts a pageview whenever pushState or replaceState changes the URL, including the query string.
 * The home page rewrites ?gpu=&mem= on every pick, so one visit could log several views. A navigation that leaves
 * the path where it was isn't a new page: drop it. A reload is a new document, so it still counts.
 */
export function dedupePageviews() {
  let last: string | null = null;
  window.umamiBeforeSend = (type, p) => {
    if (type !== "event" || p.name || !p.url) return p;
    let path: string;
    try { path = new URL(p.url, location.href).pathname; } catch { return p; }
    if (path === last) return null;
    last = path;
    return p;
  };
}

const UTM = "runitlocal:utm";
const UTM_DAYS = 30;
export type Utm = Record<string, string>;

/** Remembers the utm_* params on the landing URL. Client-side navigation drops the query string, so read them later with utm(). */
export function captureUtm() {
  const found: Utm = {};
  for (const [k, v] of new URLSearchParams(location.search)) if (/^utm_[a-z]+$/.test(k) && v) found[k] = v.slice(0, 100);
  if (!Object.keys(found).length) return;
  try { localStorage.setItem(UTM, JSON.stringify({ at: Date.now(), utm: found })); } catch {}
}

/** The utm_* params this visitor most recently landed with, in the last 30 days. */
export function utm(): Utm {
  try {
    const s = JSON.parse(localStorage.getItem(UTM) ?? "null") as { at: number; utm: Utm } | null;
    return s && Date.now() - s.at < UTM_DAYS * 864e5 ? s.utm : {};
  } catch { return {}; }
}

/** "home" for /, else the first path segment: the page name used in share links and events. */
export const pageName = (path: string) => path.split("/")[1] || "home";
