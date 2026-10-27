// Podcast sign-ups: one JSON file in DATA_DIR (the same Docker volume as the submissions queue). Emails are never
// shown on the site or returned by any API; this file is only read by whoever sends the episodes.

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DIR, "subscribers.json");
const MAX = 50_000;

type Sub = { email: string; at: string; source: string };

async function load(): Promise<Sub[]> {
  try { return JSON.parse(await readFile(FILE, "utf8")) as Sub[]; } catch { return []; }
}

let queue: Promise<unknown> = Promise.resolve();

/** Adds an email once. Returns false when the list is full. */
export function subscribe(email: string, source: string): Promise<boolean> {
  const next = queue.then(async () => {
    const subs = await load();
    const key = email.toLowerCase();
    if (subs.some(s => s.email === key)) return true;
    if (subs.length >= MAX) return false;
    subs.push({ email: key, at: new Date().toISOString(), source: source.slice(0, 40) });
    await mkdir(DIR, { recursive: true });
    await writeFile(FILE + ".tmp", JSON.stringify(subs));
    await rename(FILE + ".tmp", FILE);
    return true;
  });
  queue = next.catch(() => {});
  return next;
}
