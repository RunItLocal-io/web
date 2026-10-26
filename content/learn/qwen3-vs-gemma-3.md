---
title: "Qwen3 vs Gemma 3: which local model should you run?"
description: Qwen3 and Gemma 3 compared for local use. Reasoning, images, writing, licenses, memory and estimated speeds on 12 and 24 GB cards.
track: models
order: 16
date: 2026-10-26
models: qwen3-8b, qwen3-14b, qwen3-30b-a3b, qwen3-32b, gemma-3-12b, gemma-3-27b
---
**Pick Qwen3 for reasoning, code and speed. Pick Gemma 3 if you need it to read images, or you write a lot in languages other than English.** Both are good, both run well on ordinary hardware, and many people keep one of each.

## The short version

| | Qwen3 | Gemma 3 |
|---|---|---|
| Made by | Alibaba (Qwen) | Google DeepMind |
| Sizes we track | 4B, 8B, 14B, 32B, 30B-A3B (MoE) | 12B, 27B |
| Reads images | No | Yes |
| Thinking mode | Yes, on or off per message | No |
| Context | 32K, 128K with YaRN | 128K |
| License | Apache 2.0 | Gemma Terms of Use |
| Best at | Reasoning, math, code, tool calling | Images, writing, translation |

## Where Qwen3 wins

**Reasoning and code.** Qwen3 can think step by step before it answers. Add `/think` to a message for hard problems and `/no_think` when you just want a quick reply. On tricky code and math that makes a real difference, and Gemma 3 has no equivalent switch.

**Speed for its smarts.** Qwen3 30B-A3B is a [mixture-of-experts](/learn/mixture-of-experts-explained) model. It holds 30B parameters but reads only about 3B per token, so on a 24 GB card it runs several times faster than any dense model of similar quality. Gemma 3 has nothing like it.

**More sizes.** Qwen3 comes in a size for almost every card, from a 4B that runs on a laptop to a 32B that fills a 24 GB card.

**A simpler license.** Apache 2.0 is a standard open-source license. Gemma has its own terms. If that matters for your project, see [open model licenses explained](/learn/open-model-licenses-explained).

## Where Gemma 3 wins

**It reads images.** Drop in a screenshot, a chart, a photo of a receipt or a page of handwriting and ask about it. [Gemma 3 12B](/model/gemma-3-12b) is the smallest model on our list that can do this. If you want vision, that settles it.

**Writing and languages.** Gemma 3 tends to write more naturally, and it is strong across many languages. For drafting, rewriting and translation, try it before you assume Qwen3 is better.

**Long documents.** It has a 128K context out of the box. Qwen3 needs YaRN switched on to go past 32K. Either way, long context costs memory; see [how much VRAM you need](/learn/how-much-vram-do-you-need).

## Speed and memory, head to head

The pairs that compete on the same card, from our calculator:

| Card | Qwen3 | Gemma 3 |
|---|---|---|
| [RTX 3060 12 GB](/gpu/rtx-3060) | 14B: ~21 tok/s | 12B: ~24 tok/s |
| [RTX 3090 24 GB](/gpu/rtx-3090) | 14B: ~55 tok/s | 12B: ~64 tok/s |
| RTX 3090 24 GB | 32B: ~26 tok/s | 27B: ~30 tok/s |
| RTX 3090 24 GB | 30B-A3B: ~164 tok/s | none |

These are estimates. Size for size they are close, because both are dense models and speed follows file size. The outlier is Qwen3 30B-A3B, which is in a different league for speed.

Memory: Gemma 3 12B is an 8 GB download and Qwen3 14B is about 9 GB, so both fit a 12 GB card. Gemma 3 27B (17 GB) and Qwen3 32B (20 GB) both need a 24 GB card.

{{lineup rtx-3090}}

## Our picks by card

- **8 GB:** [Qwen3 8B](/model/qwen3-8b). Gemma 3 12B is too tight. See [best local LLM for 8 GB](/learn/best-local-llm-for-8gb-vram).
- **12 GB:** [Qwen3 14B](/model/qwen3-14b) for thinking and code, Gemma 3 12B for images and writing. Both fit, so keep both.
- **24 GB:** [Qwen3 30B-A3B](/model/qwen3-30b-a3b) as the daily driver, [Gemma 3 27B](/model/gemma-3-27b) for images, [Qwen3 32B](/model/qwen3-32b) for the hard ones. See [best local LLM for 24 GB](/learn/best-local-llm-for-24gb-vram).

## Try both in five minutes

Ollama only loads the model you're using, so having both on disk costs nothing but space.

```sh
ollama pull qwen3:14b && ollama pull gemma3:12b
```

Then give each the same three prompts from your real work and compare. That beats any leaderboard. Our [new model checklist](/learn/new-model-checklist) has a quick way to do it.

Not sure what fits your machine? Start at [every GPU](/gpu).
