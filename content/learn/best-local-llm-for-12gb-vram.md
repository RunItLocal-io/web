---
title: The best local LLM for 12 GB of VRAM (RTX 3060, 4070, B580)
description: What to run on a 12 GB graphics card like the RTX 3060, 4070 or Arc B580. Picks for smarts, images and speed, with estimated speeds for each card.
track: models
order: 4
date: 2026-10-26
models: qwen3-14b, gemma-3-12b, qwen3-8b, qwen3-4b
---
12 GB is the first size where a local model starts to feel smart rather than just handy. It fits the 12B to 14B class, which is a clear step up from the 8B models that 8 GB cards are stuck with.

## The pick: Qwen3 14B

```sh
ollama run qwen3:14b
```

At 4-bit it's about 9.3 GB, which leaves roughly 1.5 GB for the conversation on a 12 GB card. It's noticeably better than 8B models at:

- coding help and reviewing code,
- reasoning through a problem with thinking mode (add `/think` to a message, `/no_think` to skip it),
- following longer, more detailed instructions,
- tool calling and simple agents.

On a used RTX 3060 12 GB we estimate about **21 tok/s**, a bit faster than most people read. On an RTX 4070, about 30.

## For images: Gemma 3 12B

```sh
ollama run gemma3:12b
```

Google's model reads images as well as text: screenshots, charts, photos of receipts. It's also strong at writing and at languages other than English, and it has a long 128K context window. At about 8.1 GB it leaves more room for context than Qwen3 14B. It's weaker at hard reasoning and math, where Qwen3 14B wins. See [the best local vision model](/learn/best-local-vision-model).

## For speed: Qwen3 8B

```sh
ollama run qwen3:8b
```

If you want snappy answers or long documents, Qwen3 8B runs about twice as fast as the 14B and leaves around 5 GB for context. On a 3060 that's an estimated 38 tok/s.

## Card by card

Speed depends on memory bandwidth (see [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed)), so 12 GB cards vary a lot:

| Card | Bandwidth | Qwen3 14B | Gemma 3 12B | Qwen3 8B |
|---|---|---|---|---|
| [RTX 3060 12 GB](/gpu/rtx-3060) | 360 GB/s | ~21 tok/s | ~24 tok/s | ~38 tok/s |
| [RX 6700 XT](/gpu/rx-6700-xt) | 384 GB/s | ~23 tok/s | ~26 tok/s | ~41 tok/s |
| [Arc B580](/gpu/arc-b580) | 456 GB/s | ~27 tok/s | ~31 tok/s | ~48 tok/s |
| [RTX 4070](/gpu/rtx-4070) | 504 GB/s | ~30 tok/s | ~34 tok/s | ~53 tok/s |
| [RTX 5070](/gpu/rtx-5070) | 672 GB/s | ~40 tok/s | ~46 tok/s | ~71 tok/s |
| [RTX 3080 Ti](/gpu/rtx-3080-ti) | 912 GB/s | ~54 tok/s | ~62 tok/s | ~96 tok/s |

All are estimates from our calculator. NVIDIA cards work with every tool. AMD and Intel work well with Ollama and llama.cpp-based apps, with less support elsewhere.

## The RTX 3060 12 GB, by the numbers

{{lineup rtx-3060 12}}

## What doesn't fit

**gpt-oss 20B** needs about 16 GB, and the 27B to 32B models need 19 to 22 GB. On a 12 GB card they spill onto the CPU and slow to a few tokens per second. A 3-bit squeeze of a bigger model is possible, but Qwen3 14B at 4-bit is usually the better trade.

## Tips for 12 GB

- **Watch context with the 14B.** Pasting a long document can push it over 12 GB. If speed suddenly drops, run `ollama ps` and check it still says `100% GPU`. If not, switch to Gemma 3 12B or Qwen3 8B for long documents.
- **Close GPU-heavy apps.** Games and some browser tabs hold VRAM.
- **Mind the 3060 8 GB.** There is also an 8 GB RTX 3060 with less bandwidth. Make sure a used one is the 12 GB model.

## Why 12 GB is a good starting point

The cheapest real way into local AI is our "Starter" build: a used desktop with an RTX 3060 12 GB, about **$300 to $400** all in, with the card itself around $180 to $230. Parts list on the [builds page](/builds).

When you outgrow it, the next useful step is [16 GB](/learn/best-local-llm-for-16gb-vram) for gpt-oss 20B, or [24 GB](/learn/best-local-llm-for-24gb-vram) for the 30B class. For code specifically, see [the best local LLM for coding](/learn/best-local-llm-for-coding).
