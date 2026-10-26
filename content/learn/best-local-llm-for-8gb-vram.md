---
title: The best local LLM for 8 GB of VRAM
description: Which open models run well on an 8 GB graphics card like the RTX 4060, 3070 or RX 7600, how fast they go, and what to do when you outgrow it.
track: models
order: 1
date: 2026-10-26
models: qwen3-8b, qwen3-4b, gemma-3-12b
---
8 GB is the most common amount of graphics memory, and it's enough for a genuinely useful assistant. The trick is picking a model that fits *with room left for the conversation*.

## The pick: Qwen3 8B

```sh
ollama run qwen3:8b
```

At 4-bit it's about 5.2 GB, leaving roughly 2 GB for context on an 8 GB card. It's good at:

- everyday writing, rewriting and summaries,
- light coding questions and explaining code,
- step-by-step answers with its thinking mode (add `/think` to a message, or `/no_think` to skip it).

On an RTX 4060 we estimate about **29 tok/s**, faster than you can read. On a 3070 or 3060 Ti, closer to 45.

## Runner-up: Qwen3 4B for speed

```sh
ollama run qwen3:4b
```

Half the size and twice the speed, with plenty of room for long documents. It's a good pick for scripts, classifying text, or pulling data out of documents, where you run it thousands of times.

## What doesn't fit

**Gemma 3 12B and Qwen3 14B** need 9 to 11 GB. On an 8 GB card they spill onto the CPU and drop to a few tokens per second. You can force them at 3-bit, but Qwen3 8B at 4-bit usually gives better answers than a 14B squeezed that small.

## Your card, by the numbers

Here's the RTX 4060 from our calculator:

{{lineup rtx-4060}}

Other popular 8 GB cards: [RTX 3070](/gpu/rtx-3070), [RTX 3060 Ti](/gpu/rtx-3060-ti), [RTX 4060 Ti 8 GB](/gpu/rtx-4060-ti), [RX 7600](/gpu/rx-7600), [Arc A750](/gpu/arc-a750).

## Tips for 8 GB

- **Close games and the browser's GPU-heavy tabs.** They hold VRAM, and the model will spill onto the CPU.
- **Watch your context.** Pasting a long document adds memory. If speed suddenly drops, run `ollama ps` and check the model is still `100% GPU`.
- **Laptops:** a laptop RTX 4060 has less bandwidth than the desktop card, so expect it to be slower.

## When you outgrow 8 GB

The next real step up is **12 GB** for Qwen3 14B, or **24 GB** for the 30B class. The cheapest way there is usually a used card:

- A used [RTX 3060 12 GB](/gpu/rtx-3060) is around $200.
- A used [RTX 3090](/learn/used-rtx-3090-buying-guide) is around $700 and runs much bigger models.

See the [builds](/builds) for complete parts lists.
