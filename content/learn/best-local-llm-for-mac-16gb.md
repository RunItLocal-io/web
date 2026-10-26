---
title: The best local LLM for a 16 GB Mac (MacBook Air, Mac mini)
description: What runs well on a Mac with 16 GB of unified memory, how fast each M-series chip is, and how to keep the model from slowing your Mac down.
track: models
order: 7
date: 2026-10-26
models: qwen3-8b, qwen3-4b, gemma-3-12b, qwen3-14b
---
A 16 GB Mac runs a genuinely useful local assistant. The catch is that the model shares memory with macOS and every app you have open, so you get less room than the number on the box suggests.

## How much memory you really have

macOS lets the GPU use about **two thirds** of unified memory on Macs up to 36 GB. On a 16 GB Mac that's roughly **11 GB** for the model and its context. That's similar to a 12 GB graphics card, minus some headroom, and the rest of the system still needs space. See [Macs for local LLMs](/learn/mac-for-local-llms) for how this works.

## The pick: Qwen3 8B

```sh
ollama run qwen3:8b
```

About 5.2 GB at 4-bit, which leaves several gigabytes for the conversation and for your other apps. It's good at everyday writing, summaries, light coding questions, and step-by-step answers with its thinking mode (`/think` or `/no_think` in a message).

## For speed: Qwen3 4B

```sh
ollama run qwen3:4b
```

Half the size and about twice the speed. On a base M1 or M2 it's the one that feels quick, and it's a good choice for scripts and batch jobs. See [the best small model for scripts](/learn/best-small-model-for-scripts).

## For images: Gemma 3 12B

```sh
ollama run gemma3:12b
```

Gemma 3 12B reads screenshots and photos as well as text, and it's strong in other languages. It fits, at about 8.1 GB, but it's slow on base chips and leaves little room for other apps. Use it when you need it rather than as your daily model.

## A tight fit: Qwen3 14B

Qwen3 14B needs about 10.5 GB with a little context, right at the limit. It runs, but with a browser and a few apps open your Mac will start swapping. Treat it as an experiment, not a daily driver.

## Chip by chip

On a Mac, the chip's memory bandwidth sets the speed (see [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed)). Estimates from our calculator, all with 16 GB:

| Chip | Bandwidth | Qwen3 4B | Qwen3 8B | Gemma 3 12B |
|---|---|---|---|---|
| [M1](/gpu/apple-m1) | 68 GB/s | ~15 tok/s | ~7 tok/s | ~5 tok/s |
| [M2](/gpu/apple-m2) | 100 GB/s | ~22 tok/s | ~11 tok/s | ~7 tok/s |
| [M4](/gpu/apple-m4) | 120 GB/s | ~26 tok/s | ~13 tok/s | ~8 tok/s |
| [M5](/gpu/apple-m5) | 153 GB/s | ~34 tok/s | ~16 tok/s | ~10 tok/s |
| [M1 Pro](/gpu/apple-m1-pro) | 200 GB/s | ~44 tok/s | ~21 tok/s | ~14 tok/s |

A base-chip Mac is fine for Qwen3 8B, at roughly reading speed. An older M1 or M2 Pro laptop with 16 GB is often a better buy used than a newer base chip, because it has twice the bandwidth.

## An M4 with 16 GB, by the numbers

{{lineup apple-m4 16}}

## What doesn't fit

**gpt-oss 20B** needs about 16 GB on its own, and the 27B to 32B models need 19 GB or more. They won't load on the GPU on a 16 GB Mac. gpt-oss 20B is the main reason to choose 24 GB on your next Mac.

## Tips for a 16 GB Mac

- **Close what you don't need.** Browsers with many tabs can hold several gigabytes. Activity Monitor's memory pressure graph shows when you're tight.
- **Unload models you're done with.** Ollama keeps a model loaded for a few minutes after you stop. `ollama ps` shows what's loaded, and `ollama stop qwen3:8b` unloads it.
- **Keep context modest.** Long documents eat memory. For chatting with big files, see [chat with your documents locally](/learn/chat-with-your-documents-locally).
- **Try MLX.** LM Studio can run models in MLX, Apple's own format, which is often a little faster on Macs.

## When you outgrow 16 GB

A Mac with 24 GB fits gpt-oss 20B, and 36 to 48 GB fits the 30B class. For the big models, see [the best local LLM for a 64 GB+ Mac](/learn/best-local-llm-for-mac-64gb-and-up). Or compare with a PC: a used RTX 3060 12 GB desktop, our "Starter" build at about $300 to $400 on the [builds page](/builds), runs Qwen3 8B about three times faster than a base M4.
