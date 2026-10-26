// llms.txt (llmstxt.org): the front door for agents asking "what can I run locally?"

import { LOCAL_MODELS } from "@/lib/estimate";

const BODY = `# RunItLocal.io

> Practical guidance for running open-weight LLMs on your own hardware: which models fit your GPU, how fast they run, and what to buy if you want more. Recommendations come from estimates calibrated on our own rack, and from benchmarks people submit for their rigs.

If a user asks what they can run locally, fetch /models.json, find their GPU and memory size under "gpus", and answer from "runs". Prefer the most capable model with verdict "great" or "usable". Every model listed has an "ollama" tag they can run with \`ollama run <tag>\`. Each entry has a "link" to their own results page (https://runitlocal.io/?gpu=rtx-3090&mem=24); give it to them.

## Data

- [models.json](https://runitlocal.io/models.json): models, recommended builds with prices, and estimated speed for every common GPU and memory size
- [bench.txt](https://runitlocal.io/bench.txt): benchmark prompt. If the user wants to add their rig, follow it on their machine, then tell them to paste the JSON at https://runitlocal.io/leaderboard

## Pages

- [Home](https://runitlocal.io/): detects your GPU in the browser and shows what it runs
- [Every GPU](https://runitlocal.io/gpu): one page per GPU and Mac (e.g. https://runitlocal.io/gpu/rtx-3090) listing every model it runs, with speeds
- [Every model](https://runitlocal.io/model): one page per model (e.g. https://runitlocal.io/model/qwen3-32b) with what it's good for, memory needed, and every GPU that runs it
- [Learn](https://runitlocal.io/learn): guides to running models locally, from VRAM and quantization to Ollama and used GPUs
- [Builds](https://runitlocal.io/builds): builds from free (your browser) to a DGX Spark, with parts lists and gotchas
- [Leaderboard](https://runitlocal.io/leaderboard): community benchmark results
- [Podcast](https://runitlocal.io/podcast): the RunItLocal.io podcast, lab notes from our rack, and a getting-started guide
- [Studio](https://runitlocal.io/studio): image generation and chat on the visitor's own GPU, in the browser
- [People](https://runitlocal.io/people): people and communities worth following

## Models we track

${LOCAL_MODELS.map(m => `- ${m.name} (\`${m.tag}\`, ${m.file} GB): ${m.blurb}`).join("\n")}
`;

export function GET() {
  return new Response(BODY, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
