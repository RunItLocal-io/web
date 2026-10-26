// llms.txt (llmstxt.org): the front door for agents asking "what can I run locally?"

import { LOCAL_MODELS } from "@/lib/estimate";

const BODY = `# Run It Local

> Practical guidance for running open-weight LLMs on your own hardware: which models fit your GPU, how fast they run, and what to buy if you want more. Recommendations come from estimates calibrated on our own rack, and from benchmarks people submit for their rigs.

If a user asks what they can run locally, fetch /models.json, find their GPU and memory size under "gpus", and answer from "runs". Prefer the most capable model with verdict "great" or "usable". Every model listed has an "ollama" tag they can run with \`ollama run <tag>\`.

## Data

- [models.json](https://runitlocal.io/models.json): models, recommended builds with prices, and estimated speed for every common GPU and memory size
- [bench.txt](https://runitlocal.io/bench.txt): benchmark prompt. If the user wants to add their rig, follow it on their machine, then tell them to paste the JSON at https://runitlocal.io/leaderboard

## Pages

- [Home](https://runitlocal.io/): detects your GPU in the browser and shows what it runs
- [Builds](https://runitlocal.io/builds): used-market builds from $300, with parts lists and gotchas
- [Leaderboard](https://runitlocal.io/leaderboard): community benchmark results
- [Learn](https://runitlocal.io/learn): guides for getting started
- [Lab notes](https://runitlocal.io/notes): what we tested on our rack and what we found
- [People](https://runitlocal.io/people): people and communities worth following

## Models we track

${LOCAL_MODELS.map(m => `- ${m.name} (\`${m.tag}\`, ${m.file} GB): ${m.blurb}`).join("\n")}
`;

export function GET() {
  return new Response(BODY, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
