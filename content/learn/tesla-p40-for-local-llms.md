---
title: "The Tesla P40 for local LLMs: 24 GB cheap, but is it fast enough?"
description: What the 24 GB Tesla P40 runs, how fast, how it compares to the P100, and the cooling, power and software catches before you buy one.
track: hardware
order: 4
date: 2026-10-26
models: qwen3-14b, qwen3-30b-a3b, qwen3-32b, gpt-oss-20b
---
The Tesla P40 is a 2016 data-center card with **24 GB of memory**, the same amount as an RTX 3090. That's why people buy it. The catch is speed: its memory moves about **346 GB/s**, well under half of a 3090 and less than half of its sibling, the Tesla P100. It fits big models; it doesn't run them quickly.

## What it runs

{{lineup tesla-p40}}

Those are our calculator's estimates. The short version:

- **Mixture-of-experts models are its sweet spot.** Qwen3 30B-A3B and gpt-oss 20B only read a few billion weights per token, so they run at an estimated 60 tok/s or so.
- **Small dense models are fine.** Qwen3 14B at around 20 tok/s is comfortable for chat.
- **Big dense models are slow.** Qwen3 32B fits, but at an estimated 10 tok/s. Gemma 3 27B is about the same.

Why the gap? Generating text is limited by how fast the card can read its memory, not by its compute. See [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed) and [mixture of experts explained](/learn/mixture-of-experts-explained).

## P40 or P100?

| | Tesla P40 | Tesla P100 |
|---|---|---|
| Memory | 24 GB GDDR5 | 16 GB HBM2 |
| Bandwidth | 346 GB/s | 732 GB/s |
| Qwen3 14B, estimated | ~20 tok/s | ~43 tok/s |
| Qwen3 30B-A3B on one card | Fits | Doesn't fit |

The P40 wins on capacity per card: one P40 holds a 30B-class model, while you need two P100s. The P100 is roughly twice as fast at everything that fits. We chose P100s for our rack, and two of them run Qwen3.6-35B-A3B at **53 tok/s, measured**. Full story in the [Tesla P100 guide](/learn/tesla-p100-for-local-llms).

If you want a single passive card for a 30B MoE model and speed isn't critical, the P40 makes sense. If you have the slots for two cards, two P100s are usually the better buy.

## Two P40s

Two P40s give you 48 GB, enough for Llama 3.3 70B at 4-bit. Our calculator puts that at about **4 tok/s**, which is readable but slow. For 70B at a comfortable speed, two RTX 3090s are the standard answer, at about 12 tok/s estimated.

## The catches

**It has no fans.** Like the P100, the P40 is passive and expects server airflow. In a desktop case it overheats quickly. Fit a blower shroud or run it in a server chassis. See [cooling passive data-center cards](/learn/cooling-passive-data-center-cards).

**It uses a CPU-style power plug.** The P40 takes an 8-pin EPS connector, not a standard graphics card plug. Use a proper adapter cable, and never force a PCIe cable into it.

**Weak half-precision math.** Pascal's P40 is very slow at 16-bit floating-point work. llama.cpp and the tools built on it (Ollama, LM Studio) handle this well, which is why they're the right choice here. Engines that rely on fast 16-bit math run poorly or not at all.

**Old architecture.** NVIDIA's newest CUDA releases have dropped Pascal. Stay on a driver and CUDA version that still supports it, and don't update blindly.

**Slow at long prompts.** No tensor cores means reading a long document takes a while, even when generating the reply is fine.

**No display outputs.** You need another GPU or the CPU's graphics for a monitor.

## What to pay

Our [builds page](/builds) doesn't track P40 prices, so check current used prices. As a rule, compare the price against a P100 (we paid about $85 each) and a used RTX 3090 ($650 to $850 in October 2026). The P40 only makes sense well below the 3090.

## Who it's for

- **Good fit:** a homelab box that needs 24 GB on one card cheaply, and mostly runs MoE models like [Qwen3 30B-A3B](/model/qwen3-30b-a3b).
- **Bad fit:** dense 32B models at speed, image generation, or a quiet desk machine. A [used RTX 3090](/learn/used-rtx-3090-buying-guide) does all three.

Full speeds are on the [Tesla P40 page](/gpu/tesla-p40). If you run one, add your numbers to the [leaderboard](/leaderboard).
