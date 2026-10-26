// Everything the Studio can load onto the visitor's GPU, with example prompts to start each one, and a
// single way to load, check and remove any of them.

import type { MLCEngine } from "@mlc-ai/web-llm";
import type { WebGpuInfo } from "@/lib/detect";
import { IMAGE_MODEL, deleteImageModel, imageModelCached, loadImageEngine, type ImageEngine } from "@/lib/studio/image";

export type StudioModel = {
  id: string; kind: "chat" | "image"; group: "Images" | "Chat" | "Code & reasoning";
  label: string; size: string; blurb: string;
  /** Free graphics memory it needs, in GB. */
  minGb: number;
  /** Only published with 16-bit weights, so it needs shader-f16. */
  f16Only?: boolean;
  /** A Qwen3 model: answer directly instead of thinking out loud first. */
  noThink?: boolean;
  /** Prompts shown when it's picked; clicking one runs it. Defaults to its group's. */
  examples?: string[];
};

export const GROUPS = ["Images", "Chat", "Code & reasoning"] as const;

const EXAMPLES: Record<StudioModel["group"], string[]> = {
  Images: [
    "a cozy home server rack glowing in a dark garage, cinematic lighting",
    "a red fox in a snowy pine forest at sunrise, photo",
    "isometric tiny city on a floating island, soft pastel colors",
    "a robot barista pouring latte art, film still",
  ],
  Chat: [
    "Write a haiku about a GPU fan spinning up",
    "Rewrite this to sound friendlier: \"Send me the report by Friday.\"",
    "Plan a three-day trip to Lisbon on a small budget",
    "In three short sentences: why run AI on your own computer instead of the cloud?",
  ],
  "Code & reasoning": [
    "Write a Python function that checks whether a string is a palindrome, with tests",
    "A bat and a ball cost $1.10. The bat costs $1 more than the ball. How much is the ball?",
    "Explain what this does: git rebase -i HEAD~3",
  ],
};
export const examplesFor = (m: StudioModel) => m.examples ?? EXAMPLES[m.group];

// Sizes are WebLLM's own graphics-memory figures for the 4-bit builds. minGb leaves headroom on top, since the
// browser only gets part of the card.
const chat = (id: string, label: string, mb: number, blurb: string, extra: Partial<StudioModel> = {}): StudioModel => ({
  id, kind: "chat", group: "Chat", label, blurb, size: `${(mb / 1000).toFixed(1)} GB`, minGb: mb < 1500 ? 0 : Math.ceil(mb * 1.6 / 1000), ...extra,
});

export const STUDIO_MODELS: StudioModel[] = [
  {
    id: "sd-turbo", kind: "image", group: "Images", label: IMAGE_MODEL.label, size: IMAGE_MODEL.size.replace("about ", ""), minGb: 4, f16Only: true,
    blurb: "Text to image in one step, 512 px. A picture in a second or two.",
  },
  chat("gemma3-1b-it", "Gemma 3 1B", 711, "Google's tiny model. Quick and surprisingly fluent.", { f16Only: true }),
  chat("Llama-3.2-1B-Instruct", "Llama 3.2 1B", 879, "Tiny and fast. Good for quick questions and short writing."),
  chat("Qwen3-1.7B", "Qwen3 1.7B", 2037, "Small but sharp. Good at following instructions.", { noThink: true }),
  chat("Llama-3.2-3B-Instruct", "Llama 3.2 3B", 2264, "Noticeably smarter. Rewrites, summaries and plans."),
  chat("gemma-4-E2B-it", "Gemma 4 E2B", 3387, "Google's newest small model. Strong writing for its size."),
  chat("Qwen3-4B", "Qwen3 4B", 3432, "The best all-rounder that fits most laptops.", { noThink: true }),
  chat("Llama-3.1-8B-Instruct", "Llama 3.1 8B", 5001, "A proper assistant. Needs a real graphics card or a recent Mac."),
  chat("Qwen3-8B", "Qwen3 8B", 5696, "The smartest chat model here. Big download, best answers.", { noThink: true }),
  chat("Phi-4-mini-instruct", "Phi-4 mini", 3438, "Microsoft's small model, tuned for math and logic.", { group: "Code & reasoning" }),
  chat("Qwen2.5-Coder-7B-Instruct", "Qwen2.5 Coder 7B", 5107, "Writes and explains code. Paste in a function and ask.", { group: "Code & reasoning" }),
  chat("DeepSeek-R1-Distill-Qwen-7B", "DeepSeek R1 7B", 5107, "Thinks step by step before it answers. Slower, more careful.", { group: "Code & reasoning" }),
];

export const studioModel = (id: string | null) => STUDIO_MODELS.find(m => m.id === id) ?? null;

const chatModelId = (id: string, f16: boolean) => `${id}-${f16 ? "q4f16_1" : "q4f32_1"}-MLC`;

/** Why a model can't run here, or null when it can. */
export function cantRun(m: StudioModel, webgpu: WebGpuInfo, usableGb: number): string | null {
  if (m.f16Only && !webgpu.f16) return "Needs 16-bit shader support, which this browser or GPU doesn't offer";
  if (usableGb < m.minGb) return `Needs about ${m.minGb} GB of graphics memory`;
  return null;
}

export type Loaded =
  | { kind: "chat"; model: StudioModel; engine: MLCEngine }
  | { kind: "image"; model: StudioModel; engine: ImageEngine };

export type Progress = { p: number; text: string };

export async function loadModel(m: StudioModel, webgpu: WebGpuInfo, onProgress: (p: Progress) => void): Promise<Loaded> {
  if (m.kind === "image") {
    const engine = await loadImageEngine(r => onProgress({ p: r.total ? r.loaded / r.total : 0, text: `${r.text} · ${(r.loaded / 1e6).toFixed(0)} / ${(r.total / 1e6).toFixed(0)} MB` }));
    return { kind: "image", model: m, engine };
  }
  const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
  const engine = await CreateMLCEngine(chatModelId(m.id, webgpu.f16), { initProgressCallback: r => onProgress({ p: r.progress, text: r.text }) });
  return { kind: "chat", model: m, engine };
}

export function unload(l: Loaded) {
  if (l.kind === "image") l.engine.dispose();
  else l.engine.unload();
}

/** Models already downloaded to this device, each with a way to remove it. */
export async function storedModels(): Promise<{ model: StudioModel; remove: () => Promise<void> }[]> {
  const out: { model: StudioModel; remove: () => Promise<void> }[] = [];
  for (const m of STUDIO_MODELS) {
    if (m.kind === "image") {
      if (await imageModelCached()) out.push({ model: m, remove: deleteImageModel });
      continue;
    }
    try {
      const { hasModelInCache, deleteModelAllInfoInCache } = await import("@mlc-ai/web-llm");
      const ids: string[] = [];
      for (const f16 of m.f16Only ? [true] : [true, false]) if (await hasModelInCache(chatModelId(m.id, f16))) ids.push(chatModelId(m.id, f16));
      if (ids.length) out.push({ model: m, remove: async () => { for (const id of ids) await deleteModelAllInfoInCache(id); } });
    } catch { /* cache unreadable */ }
  }
  return out;
}
