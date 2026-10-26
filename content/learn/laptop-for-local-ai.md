---
title: "The best laptop for local AI: what to look for and what to avoid"
description: How to pick a laptop for running local LLMs. Why laptop GPU names mislead, how much VRAM you need, estimated speeds, and when a MacBook is the better choice.
track: hardware
order: 16
date: 2026-10-26
models: qwen3-8b, qwen3-14b, gpt-oss-20b, qwen3-30b-a3b
---
**Buy on memory first.** For a Windows or Linux laptop, that means the GPU's VRAM: 8 GB runs 8B models, 12 GB runs 14B, 16 GB runs gpt-oss 20B, and 24 GB runs the 30B class. For a MacBook, it means unified memory, where 32 GB or more opens up much bigger models. Speed comes second.

## Laptop GPUs aren't desktop GPUs

A laptop "RTX 4090" is not a desktop RTX 4090. It's a smaller chip with less memory and less bandwidth, and its speed also depends on how much power the laptop maker lets it draw. The names line up badly:

| GPU | Laptop version | Desktop version |
|---|---|---|
| RTX 4060 | 8 GB, 256 GB/s | 8 GB, 272 GB/s |
| RTX 4090 | 16 GB, 576 GB/s | 24 GB, 1,008 GB/s |
| RTX 5090 | 24 GB, 896 GB/s | 32 GB, 1,792 GB/s |

Always check the laptop GPU's memory size, not just its name. Our [GPU list](/gpu) has the laptop versions as separate pages.

## What each tier runs

Estimates from our calculator, for laptop GPUs:

| Laptop GPU | VRAM | Best fit | Estimated speed |
|---|---|---|---|
| [RTX 4060 Laptop](/gpu/rtx-4060-laptop) | 8 GB | Qwen3 8B | ~27 tok/s |
| [RTX 4080 Laptop](/gpu/rtx-4080-laptop) | 12 GB | Qwen3 14B | ~26 tok/s |
| [RTX 4090 Laptop](/gpu/rtx-4090-laptop) | 16 GB | gpt-oss 20B | ~101 tok/s |
| [RTX 5090 Laptop](/gpu/rtx-5090-laptop) | 24 GB | Qwen3 30B-A3B | ~157 tok/s |

Here's the RTX 4090 Laptop in full:

{{lineup rtx-4090-laptop}}

These assume the GPU runs at full power. On battery, or in a thin laptop with a low power limit, expect less.

## Or a MacBook

A MacBook Pro shares one pool of memory between the processor and the GPU, so a 48 GB or 64 GB model can hold models no laptop GPU can. It's slower per model than a high-end gaming laptop, but silent, cool and runs for hours on battery. The chip matters: Max chips have far more bandwidth than base and Pro chips. See [Macs for local LLMs](/learn/mac-for-local-llms).

## What else matters

- **Cooling and power.** Gaming laptops sustain heavy loads better than thin ones. Run plugged in.
- **Fan noise.** A laptop GPU at full load is loud. For long jobs, that matters.
- **System RAM.** 32 GB gives headroom if a model spills over from VRAM, and lets you run small models on the CPU. See [system RAM for local AI](/learn/system-ram-for-local-ai).
- **Storage.** Models are big. 1 TB is a sensible minimum.
- **No GPU at all?** Small models still run on the processor. See [running AI on a laptop without a GPU](/learn/run-ai-on-a-laptop-without-a-gpu).

## Our advice

- **On a budget:** an 8 GB RTX laptop runs [Qwen3 8B](/model/qwen3-8b) well, which covers everyday chat and writing.
- **The sweet spot for a gaming laptop:** 16 GB of VRAM, for [gpt-oss 20B](/model/gpt-oss-20b) at good speed.
- **Biggest models in a laptop:** a MacBook Pro with a Max chip and 64 GB or more.
- **Don't buy a laptop just for AI** if you'll mostly use it at a desk. A used desktop with an [RTX 3090](/learn/used-rtx-3090-buying-guide) costs less and runs bigger models faster. Our [builds page](/builds) has one from $900 to $1,200.

You can also try a model in your browser first, using your laptop's GPU, in the [Studio](/studio).
