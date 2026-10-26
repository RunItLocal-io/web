// One run per tier from our own rack, shown on the board as "Reference run" so a tier is never empty.
// Fill in a tier's numbers to show it; a tier whose decode_tps is null stays hidden. Take the figures from a real
// llama-bench run done with the board's own prompt (runitlocal.io/bench.txt), so they compare like for like.
// Reference runs aren't counted when ranking community runs.

import type { Tier } from "./bench";

export type ReferenceRun = {
  /** Shown as the rig's name, e.g. "RunItLocal rack". */
  handle: string;
  /** Each card, e.g. { model: "RTX 3090", vram_gb: 24 }. List a card once per physical card. */
  gpus: { model: string; vram_gb: number }[];
  engine: string;
  /** Prompt processing at 4K context, tok/s. */
  prefill_4096: number | null;
  /** Generation speed, tok/s. This is what the board ranks by. */
  decode_tps: number | null;
  /** Average GPU power during decode, W. */
  power_w: number | null;
  /** power_w divided by decode_tps. */
  joules_per_token: number | null;
};

export const REFERENCE_RUNS: Record<Tier, ReferenceRun> = {
  S: {
    handle: "RunItLocal rack",
    gpus: [{ model: "TODO: GPU model", vram_gb: 0 }],
    engine: "llama.cpp",
    prefill_4096: null,
    decode_tps: null,
    power_w: null,
    joules_per_token: null,
  },
  M: {
    handle: "RunItLocal rack",
    gpus: [{ model: "TODO: GPU model", vram_gb: 0 }],
    engine: "llama.cpp",
    prefill_4096: null,
    decode_tps: null,
    power_w: null,
    joules_per_token: null,
  },
};

/** The reference run for a tier, once its numbers are filled in. */
export const referenceRun = (tier: Tier) => {
  const r = REFERENCE_RUNS[tier];
  return r.decode_tps != null && r.decode_tps > 0 ? r : null;
};
