// Views and up/down votes on articles: one JSON file in DATA_DIR (the same Docker volume as the podcast list).
// A view is counted once per browser per day (the browser remembers) and once per IP per article per day (we do).
// A vote is keyed by a random id the browser makes, so a reader can change or take back their vote; an IP can cast
// only so many votes an hour. Nobody's id or IP is shown anywhere: the public only sees the totals.

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DIR, "reactions.json");
const MAX_VOTERS = 20_000;

type Entry = { views: number; votes: Record<string, 1 | -1> };
export type Totals = { views: number; up: number; down: number };

let state: Record<string, Entry> | null = null;
let loading: Promise<Record<string, Entry>> | null = null;

async function load() {
  if (state) return state;
  loading ??= readFile(FILE, "utf8").then(t => JSON.parse(t) as Record<string, Entry>, () => ({}));
  return (state = await loading);
}

// Views come in often, so writes are batched: at most one every two seconds.
let timer: ReturnType<typeof setTimeout> | null = null;
function save() {
  if (timer) return;
  timer = setTimeout(async () => {
    timer = null;
    try {
      await mkdir(DIR, { recursive: true });
      await writeFile(FILE + ".tmp", JSON.stringify(state));
      await rename(FILE + ".tmp", FILE);
    } catch { /* the next change tries again */ }
  }, 2000);
}

const totals = (e?: Entry): Totals => {
  const v = Object.values(e?.votes ?? {});
  return { views: e?.views ?? 0, up: v.filter(x => x === 1).length, down: v.filter(x => x === -1).length };
};

/** Totals for each slug asked for; a slug nobody has seen yet gets zeros. */
export async function reactions(slugs: string[]): Promise<Record<string, Totals>> {
  const s = await load();
  return Object.fromEntries(slugs.map(slug => [slug, totals(s[slug])]));
}

const entry = (s: Record<string, Entry>, slug: string) => (s[slug] ??= { views: 0, votes: {} });

export async function addView(slug: string): Promise<Totals> {
  const e = entry(await load(), slug);
  e.views++;
  save();
  return totals(e);
}

/** Sets this voter's vote: 1 up, -1 down, 0 to take it back. */
export async function vote(slug: string, voter: string, v: 1 | -1 | 0): Promise<Totals> {
  const e = entry(await load(), slug);
  if (v === 0) delete e.votes[voter];
  else if (e.votes[voter] || Object.keys(e.votes).length < MAX_VOTERS) e.votes[voter] = v;
  save();
  return totals(e);
}
