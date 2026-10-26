// Speed estimates. Generating each token reads the model's active weights from memory once, so
// tok/s ≈ bandwidth ÷ active weight size × efficiency. Mixture-of-experts models reach a lower share of
// that ceiling. Efficiencies are calibrated against our rack: 2× A4500 measured 110 tok/s on a 3B-active MoE.

import { BUILDS, type Build } from "./builds";
import type { Gpu } from "./gpus";

export type LocalModel = {
  name: string;
  tag: string;      // ollama run <tag>
  file: number;     // GB on disk at the default Ollama quant
  active: number;   // GB of weights read per token (= file for dense models)
  blurb: string;
};

/** Ordered from least to most capable. */
export const LOCAL_MODELS: LocalModel[] = [
  { name: "Qwen3 4B", tag: "qwen3:4b", file: 2.5, active: 2.5, blurb: "Quick everyday chat and summaries" },
  { name: "Qwen3 8B", tag: "qwen3:8b", file: 5.2, active: 5.2, blurb: "A solid all-rounder for chat and writing" },
  { name: "Gemma 3 12B", tag: "gemma3:12b", file: 8.1, active: 8.1, blurb: "Reads images as well as text" },
  { name: "Qwen3 14B", tag: "qwen3:14b", file: 9.3, active: 9.3, blurb: "Noticeably smarter at reasoning and code" },
  { name: "gpt-oss 20B", tag: "gpt-oss:20b", file: 14, active: 2.0, blurb: "OpenAI's open model. Fast, strong reasoning" },
  { name: "Gemma 3 27B", tag: "gemma3:27b", file: 17, active: 17, blurb: "Google's best open model for its size" },
  { name: "Qwen3 30B-A3B", tag: "qwen3:30b", file: 19, active: 2.0, blurb: "30B smarts at small-model speed" },
  { name: "Qwen3 32B", tag: "qwen3:32b", file: 20, active: 20, blurb: "Strong coding and long answers" },
  { name: "Llama 3.3 70B", tag: "llama3.3:70b", file: 43, active: 43, blurb: "Close to the big cloud models" },
  { name: "gpt-oss 120B", tag: "gpt-oss:120b", file: 65, active: 2.9, blurb: "OpenAI's largest open model" },
];

/** URL form of a model, as in /model/qwen3-32b. */
export const modelSlug = (m: Pick<LocalModel, "name">) => m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const DENSE_EFF = 0.55;
const MOE_EFF = 0.35;
/** Context and runtime overhead on top of the weights. */
const OVERHEAD_GB = 1.2;

export type Verdict = "great" | "usable" | "slow" | "nofit";

export const VERDICT_LABEL: Record<Verdict, string> = {
  great: "Runs great",
  usable: "Usable",
  slow: "Slow",
  nofit: "Too big",
};

export const VERDICT_PHRASE: Record<Exclude<Verdict, "nofit">, string> = {
  great: "faster than you can read",
  usable: "about reading speed",
  slow: "slow, but it works",
};

/** GB a model can use: all of a card's VRAM, or the share of unified memory macOS and PCs give the GPU. */
export function usableGb(gpu: Pick<Gpu, "kind">, mem: number) {
  if (gpu.kind === "apple") return mem * (mem > 36 ? 0.75 : 0.67);
  // Linux on a DGX Spark or Ryzen AI Max lets the GPU take most of memory; Windows caps Ryzen AI Max at 96 of 128.
  if (gpu.kind === "unified") return mem * 0.75;
  if (gpu.kind === "integrated") return mem * 0.6;
  return mem;
}

export function estimate(m: LocalModel, bw: number, usable: number) {
  const fits = m.file + OVERHEAD_GB <= usable;
  const tps = bw / m.active * (m.active < m.file ? MOE_EFF : DENSE_EFF);
  const verdict: Verdict = !fits ? "nofit" : tps >= 30 ? "great" : tps >= 10 ? "usable" : "slow";
  return { fits, tps, verdict };
}

export type Rated = LocalModel & ReturnType<typeof estimate>;

export function rateAll(bw: number, usable: number): Rated[] {
  return LOCAL_MODELS.map(m => ({ ...m, ...estimate(m, bw, usable) }));
}

/** The most capable model that still runs at a comfortable speed, else the most capable one that fits. */
export function pickHero(rated: Rated[]): Rated | null {
  const fits = rated.filter(r => r.fits);
  return fits.filter(r => r.tps >= 20).pop() ?? fits.pop() ?? null;
}

/** The cheapest build from our list that runs a more capable model than this machine can. */
export function pickUpgrade(rated: Rated[], usable: number): { build: Build; model: Rated } | null {
  const bestIdx = rated.map(r => r.fits).lastIndexOf(true);
  for (const b of BUILDS.slice().sort((x, y) => x.lo - y.lo)) {
    if (b.hi === 0 || b.vram <= usable) continue;
    const theirs = rateAll(b.bw, b.vram);
    const better = theirs.slice(bestIdx + 1).filter(r => r.fits && r.tps >= 15).pop();
    if (better) return { build: b, model: better };
  }
  return null;
}

export const fmtTps = (t: number) => t >= 100 ? String(Math.round(t / 10) * 10) : String(Math.round(t));
