// Podcast sign-ups: one JSON file in DATA_DIR (the same Docker volume as the submissions queue). Emails are never
// shown on the site or returned by any API; this file is only read by whoever sends the episodes.

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DIR, "subscribers.json");
const MAX = 50_000;

export type Sub = { email: string; at: string; source: string; name?: string };

async function load(): Promise<Sub[]> {
  try { return JSON.parse(await readFile(FILE, "utf8")) as Sub[]; } catch { return []; }
}

let queue: Promise<unknown> = Promise.resolve();

/** Everyone on the list, newest first. Only /admin reads this. */
export async function subscribers(): Promise<Sub[]> {
  return (await load()).sort((a, b) => b.at.localeCompare(a.at));
}

/** Adds an email once; a name sent later fills in one that was missing. Returns false when the list is full. */
export function subscribe(email: string, source: string, name = ""): Promise<boolean> {
  const next = queue.then(async () => {
    const subs = await load();
    const key = email.toLowerCase();
    const had = subs.find(s => s.email === key);
    if (had && (had.name || !name)) return true;
    if (had) had.name = name;
    else if (subs.length >= MAX) return false;
    else subs.push({ email: key, at: new Date().toISOString(), source: source.slice(0, 40), ...(name && { name }) });
    await mkdir(DIR, { recursive: true });
    await writeFile(FILE + ".tmp", JSON.stringify(subs));
    await rename(FILE + ".tmp", FILE);
    return true;
  });
  queue = next.catch(() => {});
  return next;
}
