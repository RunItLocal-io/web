// Prompts behind the "Open in your LLM" buttons. Kept short and pointed at our pages, because URLs truncate
// long prompts and the answer should come from our data, not the model's memory.

import type { Build } from "./builds";

export const LLMS = [
  { key: "claude", label: "Claude", url: (q: string) => "https://claude.ai/new?q=" + encodeURIComponent(q) },
  { key: "chatgpt", label: "ChatGPT", url: (q: string) => "https://chatgpt.com/?q=" + encodeURIComponent(q) },
  { key: "perplexity", label: "Perplexity", url: (q: string) => "https://www.perplexity.ai/search?q=" + encodeURIComponent(q) },
];

export const gpuPrompt = (gpu: string, memGb: number) =>
  `I have a ${gpu} with ${memGb} GB. Read https://runitlocal.io/models.json and tell me the best local models I can run on it, what each is good for, and how to set up the top pick step by step.`;

export const buildPrompt = (b: Build) =>
  `I'm considering the "${b.name}" build from https://runitlocal.io/builds (about $${b.lo} to $${b.hi}). Check the parts list there, tell me what to look for buying each part used, and what could go wrong.`;

export const guidePrompt = (path: string) =>
  `Read https://runitlocal.io${path} and walk me through it step by step on my computer. Ask me what OS and hardware I have first.`;

export const BENCH_ONE_LINER = "Read https://runitlocal.io/bench.txt and follow it on this machine.";
