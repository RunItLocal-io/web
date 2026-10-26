// Learn articles: Markdown files in content/learn, read at build time. Each starts with a front-matter block:
//   ---
//   title: How much VRAM do you need?
//   description: One sentence for search results.
//   track: basics
//   date: 2026-10-26
//   models: qwen3-32b, llama-3-3-70b   (optional, model slugs this article is about)
//   order: 2                           (optional, position within the track)
//   nav: VRAM needs                    (optional, sidebar label; defaults to the title up to any colon)
//   ---
// Files starting with "_" are drafts and planning notes, never published.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "content", "learn");

export const TRACKS = [
  { id: "start", label: "Get started", blurb: "Your first model on the computer you already own." },
  { id: "basics", label: "Know what matters", blurb: "Memory, quantization, and why one card is fast and another isn't." },
  { id: "models", label: "Pick a model", blurb: "Which open model to run for what, at every memory size." },
  { id: "hardware", label: "Pick your hardware", blurb: "Used GPUs, Macs, and builds, with what they really run." },
  { id: "serve", label: "Run and serve it", blurb: "Ollama, llama.cpp, LM Studio, Open WebUI, and serving a team." },
  { id: "use", label: "Make it useful", blurb: "Chat with your documents, code with it, run agents, add voice." },
] as const;

export type TrackId = (typeof TRACKS)[number]["id"];

export type Article = {
  slug: string;
  title: string;
  /** Short label for the sidebar. */
  nav: string;
  description: string;
  track: TrackId;
  date: string;
  models: string[];
  order: number;
  body: string;
};

function parse(slug: string, raw: string): Article {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`content/learn/${slug}.md: missing front matter`);
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  }
  const track = TRACKS.find(t => t.id === meta.track)?.id;
  if (!meta.title || !meta.description || !track || !/^\d{4}-\d{2}-\d{2}$/.test(meta.date ?? "")) {
    throw new Error(`content/learn/${slug}.md: needs title, description, track (${TRACKS.map(t => t.id).join("|")}) and date (YYYY-MM-DD)`);
  }
  return {
    slug, title: meta.title, nav: meta.nav || meta.title.split(":")[0].trim(), description: meta.description, track, date: meta.date,
    models: meta.models ? meta.models.split(",").map(s => s.trim()).filter(Boolean) : [],
    order: Number(meta.order) || 99,
    body: m[2].trim(),
  };
}

let cache: Article[] | null = null;

/** Every published article, newest first. */
export function articles(): Article[] {
  if (cache) return cache;
  let files: string[] = [];
  try { files = readdirSync(DIR).filter(f => f.endsWith(".md") && !f.startsWith("_")); } catch { /* no content yet */ }
  cache = files
    .map(f => parse(f.slice(0, -3), readFileSync(path.join(DIR, f), "utf8")))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  return cache;
}

export const article = (slug: string) => articles().find(a => a.slug === slug) ?? null;

/** A track's articles in reading order. */
export const inTrack = (track: TrackId) => articles().filter(a => a.track === track).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

export const aboutModel = (slug: string) => articles().filter(a => a.models.includes(slug));

export const fmtDate = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** Every article in reading order: tracks in order, each track in its own order. Drives the sidebar and prev/next. */
export const sequence = () => TRACKS.flatMap(t => inTrack(t.id));
