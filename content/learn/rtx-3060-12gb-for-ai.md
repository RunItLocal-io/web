---
title: "The RTX 3060 12 GB for AI: the best cheap starter card"
description: Why the 12 GB RTX 3060 is the cheapest sensible GPU for local AI, what it runs and how fast, what to pay, and the 8 GB version to avoid.
track: hardware
order: 5
date: 2026-10-26
models: qwen3-8b, qwen3-14b, gemma-3-12b
---
If you want to run local AI on a graphics card and spend as little as possible, the **RTX 3060 12 GB** is the answer. It has more memory than many newer, pricier cards, every tool supports it, and used ones sell for about **$180 to $230** as of October 2026.

## What it runs

{{lineup rtx-3060 12}}

Those are our calculator's estimates. In plain terms:

- **Qwen3 8B at about 38 tok/s.** Faster than you can read.
- **Qwen3 14B and Gemma 3 12B at about 20 to 24 tok/s.** These are the models where local AI starts to feel smart, and 12 GB is what lets them fit.
- **Nothing bigger.** gpt-oss 20B needs about 16 GB and the 30B class needs over 20 GB.

For which model to pick, see [the best local LLM for 8 GB](/learn/best-local-llm-for-8gb-vram) as a baseline, then step up to [Qwen3 14B](/model/qwen3-14b), the best fit for this card.

## Why 12 GB matters

Memory decides which models you can run (see [how much VRAM you need](/learn/how-much-vram-do-you-need)). Many newer mid-range cards ship with 8 GB, which tops out at 8B models. The 3060's extra 4 GB is the difference between an 8B model and a 14B one, and that's a real step up in quality.

It's not a fast card. Its memory moves 360 GB/s, about 40% of an RTX 3090. But for models up to 14B, it's comfortably fast enough for chat.

## Watch out for the 8 GB version

NVIDIA also sold an **RTX 3060 8 GB**, which is slower and has a third less memory. Listings don't always make it obvious. Check the memory size in the listing photos or ask the seller to show it in GPU-Z or `nvidia-smi`. Also don't confuse it with the **3060 Ti**, which is faster but only has 8 GB. For AI, the plain 3060 12 GB is the one you want.

## A full starter build

The "Starter" build on our [builds page](/builds) is a used desktop with this card, about **$300 to $400** all in:

| Part | Used price, Oct 2026 |
|---|---|
| RTX 3060 12 GB | $180 to $230 |
| Used desktop tower, 16 GB RAM, 450 W+ PSU | $100 to $150 |
| 1 TB SSD | $40 to $60 |

The whole system draws about 200 W under load.

**The gotcha:** check that the power supply has an 8-pin GPU cable and that the case fits a full-size card. Office small-form-factor PCs usually don't, and their power supplies are often too small or proprietary.

## Getting started

Install the NVIDIA driver, then [Ollama](/learn/how-to-run-ai-locally). Your first model:

```sh
ollama run qwen3:14b
```

If it's slow, check that it's actually using the GPU. A model that doesn't fit spills onto the processor and slows down a lot.

## When to skip it

- **You want 20B to 32B models.** Save up for a [used RTX 3090](/learn/used-rtx-3090-buying-guide), with 24 GB.
- **You want 16 GB on a budget and don't mind tinkering.** A [Tesla P100](/learn/tesla-p100-for-local-llms) has 16 GB of much faster memory for under $100, but needs a cooling shroud and has no display output.
- **You're comparing all the options.** See the [best GPU under $300](/learn/best-gpu-under-300).

All estimates for this card are on the [RTX 3060 page](/gpu/rtx-3060).
