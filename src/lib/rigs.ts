// Leaderboard storage: one JSON file in DATA_DIR (a Docker volume in production). Low volume, so a file with
// serialized writes is plenty. Each submission needs a one-time token, which carries the name the person typed.

import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { TESTS, type BenchRun, type Tier } from "./bench";

const DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DIR, "rigs.json");
const CLAIM_TTL_MS = 24 * 3600_000;

/** utm_* params from the visitor's landing URL, so a run can be traced back to the post that sent them. */
export type Utm = Record<string, string>;
type Claim = { handle: string; use: string; tier: Tier | null; created: number; run?: string; utm?: Utm };
export type Run = BenchRun & { id: string; handle: string; use: string; tier: Tier; submitted: string; utm?: Utm };
type Db = { claims: Record<string, Claim>; runs: Run[] };

async function load(): Promise<Db> {
  try { return JSON.parse(await readFile(FILE, "utf8")) as Db; } catch { return { claims: {}, runs: [] }; }
}

// Writes go through one promise chain so two submissions can't overwrite each other.
let queue: Promise<unknown> = Promise.resolve();
function update<T>(fn: (db: Db) => T): Promise<T> {
  const next = queue.then(async () => {
    const db = await load();
    const out = fn(db);
    const now = Date.now();
    for (const [k, c] of Object.entries(db.claims)) if (now - c.created > CLAIM_TTL_MS) delete db.claims[k];
    await mkdir(DIR, { recursive: true });
    await writeFile(FILE + ".tmp", JSON.stringify(db));
    await rename(FILE + ".tmp", FILE);
    return out;
  });
  queue = next.catch(() => {});
  return next;
}

const tidy = (s: unknown, n: number) => typeof s === "string" ? s.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, n) : "";

/** Only utm_* keys with short string values, at most eight. */
function tidyUtm(v: unknown): Utm | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const out: Utm = {};
  for (const [k, x] of Object.entries(v).slice(0, 8)) if (/^utm_[a-z]{1,20}$/.test(k) && tidy(x, 100)) out[k] = tidy(x, 100);
  return Object.keys(out).length ? out : undefined;
}

export async function createClaim(handle: unknown, use: unknown, tier: unknown, utm?: unknown): Promise<string> {
  const token = randomBytes(12).toString("base64url");
  const t = TESTS.find(x => x.tier === tier)?.tier ?? null;
  await update(db => { db.claims[token] = { handle: tidy(handle, 40) || "Anonymous", use: tidy(use, 80), tier: t, created: Date.now(), utm: tidyUtm(utm) }; });
  return token;
}

/** Ranked fastest first by decode speed, among runs of the same test. */
export function ranked(runs: Run[], tier: Tier) {
  return runs.filter(r => r.tier === tier).sort((a, b) => (b.test.decode_tps ?? 0) - (a.test.decode_tps ?? 0));
}

export type SubmitResult = { ok: true; id: string; tier: Tier; rank: number; of: number; utm?: Utm } | { ok: false; status: number; error: string };

export function submitRun(token: string, run: BenchRun): Promise<SubmitResult> {
  return update((db): SubmitResult => {
    const c = db.claims[token];
    if (!c || Date.now() - c.created > CLAIM_TTL_MS) return { ok: false, status: 404, error: "This submit link is unknown or expired. Get a new prompt at runitlocal.io/leaderboard." };
    if (c.run) return { ok: false, status: 409, error: "This submit link was already used. Get a new prompt to add another run." };
    const tier = TESTS.find(x => x.tier === run.test.tier)?.tier ?? c.tier;
    if (!tier) return { ok: false, status: 400, error: 'test.tier must be "S" or "M".' };
    const id = randomBytes(6).toString("base64url");
    db.runs.push({ ...run, id, handle: c.handle, use: c.use, tier, submitted: new Date().toISOString(), ...(c.utm ? { utm: c.utm } : {}) });
    c.run = id;
    const board = ranked(db.runs, tier);
    return { ok: true, id, tier, rank: board.findIndex(r => r.id === id) + 1, of: board.length, utm: c.utm };
  });
}

export async function claimStatus(token: string) {
  const db = await load();
  const c = db.claims[token];
  if (!c) return null;
  if (!c.run) return { done: false as const };
  const run = db.runs.find(r => r.id === c.run);
  if (!run) return null;
  const board = ranked(db.runs, run.tier);
  return { done: true as const, id: run.id, tier: run.tier, rank: board.findIndex(r => r.id === run.id) + 1, of: board.length };
}

export async function allRuns() {
  return (await load()).runs;
}

/** Runs as the public sees them: where a visitor came from stays private. */
export async function publicRuns() {
  return (await allRuns()).map(r => ({ ...r, utm: undefined }));
}
