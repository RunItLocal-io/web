"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import type { Totals } from "@/lib/reactions";

// Views and up/down votes on an article. The page is static, so the numbers load here, after it shows. One fetch
// of every article's totals serves the whole page (and the Articles list). A view counts once per browser per day;
// a vote is kept in this browser so it can be changed or taken back.

const VOTER = "runitlocal:voter", VOTES = "runitlocal:votes", VIEWED = "runitlocal:viewed";
const ZERO: Totals = { views: 0, up: 0, down: 0 };

function store<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; } catch { return fallback; }
}
function keep(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* private window: it just won't remember */ }
}

function voterId() {
  let id = store<string>(VOTER, "");
  if (!/^[a-f0-9]{16,32}$/.test(id)) {
    id = [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(16).padStart(2, "0")).join("");
    keep(VOTER, id);
  }
  return id;
}

let all: Promise<Record<string, Totals>> | null = null;
/** Every article's totals, fetched once per page load. */
export function allReactions() {
  all ??= fetch("/api/reactions").then(r => (r.ok ? r.json() : {}), () => ({}));
  return all;
}

async function post(body: object): Promise<Totals | null> {
  try {
    const r = await fetch("/api/reactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

const listeners = new Set<(slug: string, t: Totals) => void>();
const announce = (slug: string, t: Totals) => listeners.forEach(f => f(slug, t));

function useTotals(slug: string) {
  const [t, setT] = useState<Totals | null>(null);
  useEffect(() => {
    let live = true;
    allReactions().then(a => { if (live) setT(cur => cur ?? a[slug] ?? ZERO); });
    const on = (s: string, n: Totals) => { if (s === slug) setT(n); };
    listeners.add(on);
    return () => { live = false; listeners.delete(on); };
  }, [slug]);
  return t;
}

export const fmtCount = (n: number) => (n >= 10_000 ? `${Math.round(n / 1000)}K` : n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n));

/** "1.2K views": counts this visit, once a day. Goes in the article's byline. */
export function Views({ slug }: { slug: string }) {
  const t = useTotals(slug);
  useEffect(() => {
    const viewed = store<Record<string, number>>(VIEWED, {});
    if (Date.now() - (viewed[slug] ?? 0) < 864e5) return;
    viewed[slug] = Date.now();
    keep(VIEWED, viewed);
    post({ slug, action: "view" }).then(n => n && announce(slug, n));
  }, [slug]);
  return <span className="views" aria-live="polite">{t ? `${fmtCount(t.views)} view${t.views === 1 ? "" : "s"}` : " "}</span>;
}

const Arrow = ({ down }: { down?: boolean }) => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" style={down ? { transform: "rotate(180deg)" } : undefined}>
    <path d="M8 3 14 11H2Z" fill="currentColor" />
  </svg>
);

/** Up and down buttons with their counts. */
export function Vote({ slug, title }: { slug: string; title?: string }) {
  const t = useTotals(slug);
  const [mine, setMine] = useState<1 | -1 | 0>(0);
  const [busy, setBusy] = useState(false);
  // This browser's own vote shows with the totals, after hydration (the server can't know it).
  useEffect(() => {
    let live = true;
    allReactions().then(() => { if (live) setMine(store<Record<string, 1 | -1>>(VOTES, {})[slug] ?? 0); });
    return () => { live = false; };
  }, [slug]);

  async function cast(dir: 1 | -1) {
    if (busy) return;
    const v = mine === dir ? 0 : dir;
    setBusy(true);
    const n = await post({ slug, action: "vote", voter: voterId(), vote: v });
    setBusy(false);
    if (!n) return;
    const votes = store<Record<string, 1 | -1>>(VOTES, {});
    if (v) votes[slug] = v; else delete votes[slug];
    keep(VOTES, votes);
    setMine(v);
    announce(slug, n);
    track(v === 1 ? "article_upvote" : v === -1 ? "article_downvote" : "article_unvote", { slug });
  }

  return (
    <div className="vote" role="group" aria-label={title ? `Rate “${title}”` : "Rate this article"}>
      <button type="button" className={"up" + (mine === 1 ? " on" : "")} aria-pressed={mine === 1} disabled={busy} onClick={() => cast(1)} title="Worth reading">
        <Arrow /><span>{t ? fmtCount(t.up) : "·"}</span><span className="sr">upvotes</span>
      </button>
      <button type="button" className={"down" + (mine === -1 ? " on" : "")} aria-pressed={mine === -1} disabled={busy} onClick={() => cast(-1)} title="Not for me">
        <Arrow down /><span>{t ? fmtCount(t.down) : "·"}</span><span className="sr">downvotes</span>
      </button>
    </div>
  );
}

/** Views and score for one card in the Articles list, without counting a view. */
export function CardStats({ slug }: { slug: string }) {
  const t = useTotals(slug);
  if (!t) return <span className="card-stats" aria-hidden="true">&nbsp;</span>;
  return (
    <span className="card-stats">
      <span>{fmtCount(t.views)} view{t.views === 1 ? "" : "s"}</span>
      <span title={`${t.up} up, ${t.down} down`}>▲ {fmtCount(t.up - t.down)}</span>
    </span>
  );
}
