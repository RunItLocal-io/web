---
title: "The best GPU for local AI under $300"
description: The best graphics cards for running local LLMs on a $300 budget, what each one runs, estimated speeds, and which to pick for easy setup or raw value.
track: hardware
order: 14
date: 2026-10-26
models: qwen3-8b, qwen3-14b, gpt-oss-20b, qwen3-30b-a3b
---
**For most people, a used RTX 3060 12 GB.** It costs about $180 to $230 used as of October 2026, it fits 14B models, and every tool supports it. **For the most memory and speed per dollar, a Tesla P100** at under $100 each, if you're happy to add a cooling shroud and use Linux-friendly tools. Two P100s fit in the same budget and give you 32 GB.

## The shortlist

| Card | Memory | Bandwidth | Qwen3 14B, estimated | Used price |
|---|---|---|---|---|
| [RTX 3060 12 GB](/gpu/rtx-3060) | 12 GB | 360 GB/s | ~21 tok/s | $180 to $230 |
| [Tesla P100](/gpu/tesla-p100) | 16 GB | 732 GB/s | ~43 tok/s | We paid about $85 |
| [Tesla P40](/gpu/tesla-p40) | 24 GB | 346 GB/s | ~20 tok/s | Check current prices |
| [RTX 2080 Ti](/gpu/rtx-2080-ti) | 11 GB | 616 GB/s | ~36 tok/s | Check current prices |
| [Arc B580](/gpu/arc-b580) | 12 GB | 456 GB/s | ~27 tok/s | Check current prices |
| [RX 7600 XT](/gpu/rx-7600-xt) | 16 GB | 288 GB/s | ~17 tok/s | Check current prices |

Prices for the first two come from our [builds page](/builds). Speeds are our calculator's estimates. Prices for the rest move a lot, so check before you buy and only consider ones that land under $300.

## Pick 1: RTX 3060 12 GB, the easy one

It's slow on paper but has enough memory for [Qwen3 14B](/model/qwen3-14b), the point where local models start to feel smart. It works on Windows and Linux with Ollama, LM Studio, image generators and everything else. Avoid the 8 GB version.

{{lineup rtx-3060 12}}

Our "Starter" build puts it in a used desktop for $300 to $400 total. Full details: [the RTX 3060 12 GB for AI](/learn/rtx-3060-12gb-for-ai).

## Pick 2: Tesla P100, the value one

The P100 has 16 GB of HBM2 at 732 GB/s, about twice the 3060's bandwidth, so it generates text about twice as fast on anything that fits. It also fits [gpt-oss 20B](/model/gpt-oss-20b), at about 128 tok/s estimated.

Two of them, at $170 to $240 for the pair, give you 32 GB. On our rack, **two P100s run Qwen3.6-35B-A3B at 53 tok/s, measured**.

The catches: no fans (you need a shroud, about $15 to $25 per card), a CPU-style EPS power plug, no display output, slow prompt processing, and older software support. Read [the Tesla P100 guide](/learn/tesla-p100-for-local-llms) first.

## The others

- **Tesla P40:** 24 GB in one card, but slow memory. Good for MoE models like [Qwen3 30B-A3B](/model/qwen3-30b-a3b), at about 61 tok/s estimated; slow on dense 32B models. Same cooling and power catches as the P100. See [the Tesla P40 guide](/learn/tesla-p40-for-local-llms).
- **RTX 2080 Ti:** fast for its age, but 11 GB is tight for 14B models with long context.
- **Arc B580:** a new card with 12 GB, but narrower software support. See [Intel Arc for local AI](/learn/intel-arc-for-local-ai).
- **RX 7600 XT:** 16 GB is a lot for the money, but its memory is slow. See [AMD GPUs for local AI](/learn/amd-gpus-for-local-ai).

## What to avoid

- **8 GB cards** if you can stretch to 12 GB. 8 GB stops at 8B models. See [how much VRAM you need](/learn/how-much-vram-do-you-need).
- **Very old cards** with 4 to 6 GB, like the GTX 1060. They'll run only the smallest models.
- **Untested listings.** Ask for proof it runs under load. See [how to check a used GPU](/learn/how-to-check-a-used-gpu).

## Which one?

- **First card, want it to just work:** RTX 3060 12 GB.
- **Homelab, want the most for your money:** two Tesla P100s.
- **Can stretch your budget:** see the [best GPU under $1,000](/learn/best-gpu-under-1000), where a used RTX 3090 changes the picture.
