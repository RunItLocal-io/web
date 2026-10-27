// Things people send in from /learn/posts: a measured run, a tip, a fix, a build. One JSON file in DATA_DIR (the
// same Docker volume as the podcast list). Nothing here is ever public; it's a queue read at /admin, and the good
// ones get written up as posts by hand, with credit.

import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BenchRun } from "./bench";
import type { Kind } from "./submission-kinds";

const DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DIR, "submissions.json");
const MAX = 5_000;

export type Status = "new" | "used" | "dismissed";
export type Utm = Record<string, string>;

export type Submission = {
  id: string; at: string; status: Status; kind: Kind;
  title: string; body: string; handle: string;
  /** Private: only so we can say thanks or ask a question. Never shown. */
  email: string;
  /** Free text, e.g. "2× RTX 3090". */
  hardware: string;
  /** The benchmark prompt's JSON, already cleaned field by field. */
  run: BenchRun | null;
  utm?: Utm;
};

async function load(): Promise<Submission[]> {
  try { return JSON.parse(await readFile(FILE, "utf8")) as Submission[]; } catch { return []; }
}

// Writes go through one promise chain so two submissions can't overwrite each other.
let queue: Promise<unknown> = Promise.resolve();
function update<T>(fn: (all: Submission[]) => T): Promise<T> {
  const next = queue.then(async () => {
    const all = await load();
    const out = fn(all);
    await mkdir(DIR, { recursive: true });
    await writeFile(FILE + ".tmp", JSON.stringify(all));
    await rename(FILE + ".tmp", FILE);
    return out;
  });
  queue = next.catch(() => {});
  return next;
}

export const tidy = (s: unknown, n: number) => typeof s === "string" ? s.replace(/[\u0000-\u0008\u000b-\u001f]/g, "").trim().slice(0, n) : "";

/** Only utm_* keys with short string values, at most eight. */
export function tidyUtm(v: unknown): Utm | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const out: Utm = {};
  for (const [k, x] of Object.entries(v).slice(0, 8)) if (/^utm_[a-z]{1,20}$/.test(k) && tidy(x, 100)) out[k] = tidy(x, 100);
  return Object.keys(out).length ? out : undefined;
}

/** Adds one to the queue. Returns false when the queue is full. */
export function addSubmission(s: Omit<Submission, "id" | "at" | "status">): Promise<boolean> {
  return update(all => {
    if (all.length >= MAX) return false;
    all.push({ ...s, id: randomBytes(6).toString("base64url"), at: new Date().toISOString(), status: "new" });
    return true;
  });
}

/** Newest first. */
export async function submissions() {
  return (await load()).reverse();
}

export function setStatus(id: string, status: Status) {
  return update(all => { const s = all.find(x => x.id === id); if (s) s.status = status; });
}

export function removeSubmission(id: string) {
  return update(all => { const i = all.findIndex(x => x.id === id); if (i >= 0) all.splice(i, 1); });
}
