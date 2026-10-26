---
title: "gpt-oss 20B vs Qwen3 30B-A3B: two fast MoE models compared"
description: OpenAI's gpt-oss 20B and Qwen3 30B-A3B both run fast on home hardware. Which fits your card, which is smarter where, and estimated speeds.
track: models
order: 17
date: 2026-10-26
models: gpt-oss-20b, qwen3-30b-a3b
---
**If you have 16 GB, the choice is made for you: run gpt-oss 20B. With 24 GB or more, try both. Qwen3 30B-A3B usually knows more and writes better; gpt-oss 20B is a sharp, tidy reasoner with lots of room left for context.**

Both are [mixture-of-experts](/learn/mixture-of-experts-explained) models. Each holds far more parameters than it uses per token, which is why both feel fast on cards that would crawl through a dense model of the same size.

## Side by side

| | [gpt-oss 20B](/model/gpt-oss-20b) | [Qwen3 30B-A3B](/model/qwen3-30b-a3b) |
|---|---|---|
| Made by | OpenAI | Alibaba (Qwen) |
| Parameters | 21B total, 3.6B active | 30B total, 3B active |
| Download (Ollama) | ~14 GB | ~19 GB |
| Memory needed | ~16 GB | ~21 GB |
| Context | 128K | 32K, 128K with YaRN |
| Reasoning control | Effort: low, medium, high | Thinking on or off |
| Images | No | No |
| License | Apache 2.0 | Apache 2.0 |
| Ollama tag | `gpt-oss:20b` | `qwen3:30b` |

## Memory is the real difference

Speed is close because each reads about 2 GB of weights per token at the default quant. What differs is how much has to sit in memory: about 16 GB for gpt-oss 20B and about 21 GB for Qwen3 30B-A3B, before you add long context.

So on popular cards:

| Card | gpt-oss 20B | Qwen3 30B-A3B |
|---|---|---|
| [RTX 4060 Ti 16 GB](/gpu/rtx-4060-ti) | ~50 tok/s | does not fit |
| [RTX A4500 20 GB](/gpu/rtx-a4500) | ~112 tok/s | does not fit |
| [RTX 3090 24 GB](/gpu/rtx-3090) | ~164 tok/s | ~164 tok/s |
| [RTX 5090 32 GB](/gpu/rtx-5090) | ~314 tok/s | ~314 tok/s |
| [M4 Pro, 64 GB](/gpu/apple-m4-pro) | ~48 tok/s | ~48 tok/s |

All estimates from our calculator. A 20 GB card is the awkward one: gpt-oss fits with room to spare and Qwen3 30B-A3B misses by a gigabyte. On our rack we run the A4500s in pairs for exactly this reason. Two of them measured **110 tok/s** on Qwen3.6-35B-A3B, a newer MoE of the same shape.

## Where gpt-oss 20B is better

- **Structured reasoning.** It thinks before every answer, and you choose how hard. Low effort is quick; high effort is slower but catches more on logic and math.
- **Tool calling.** It was built with agents in mind and is reliable at calling functions in the expected format. See [best model for agents and tool calling](/learn/best-local-model-for-agents-and-tool-calling).
- **Long context on 24 GB.** It leaves about 8 GB free on a 24 GB card for conversation history and documents.

## Where Qwen3 30B-A3B is better

- **Knowledge and breadth.** More total parameters means it simply knows more, and it shows on general questions and less common topics.
- **Writing.** gpt-oss can sound flat. Qwen3 is more natural for drafting and rewriting.
- **Quick answers.** Turn thinking off with `/no_think` and it replies straight away. gpt-oss always reasons a little first, even at low effort.
- **Languages.** Qwen3 handles many languages well, including Chinese.

## Speed in practice

Raw tok/s is nearly the same, but gpt-oss spends tokens reasoning before every reply and Qwen3 only does when you ask. For quick chat, Qwen3 with thinking off often *feels* faster. For hard problems both spend time thinking, and the fair comparison is how often the answer is right.

{{lineup rtx-3090}}

## Our take

- **16 to 20 GB card:** gpt-oss 20B. It's the best model that fits. See [best local LLM for 16 GB](/learn/best-local-llm-for-16gb-vram).
- **24 GB card:** Qwen3 30B-A3B as the daily model, gpt-oss 20B when you need long context or an agent. Both download in minutes, so keep both.
- **Coding:** try both on your own repo. Our [coding guide](/learn/best-local-llm-for-coding) covers the setup.

```sh
ollama run gpt-oss:20b
```

Run your own three prompts on each, the way our [new model checklist](/learn/new-model-checklist) describes. Then check [your GPU's page](/gpu) for what else it runs.
