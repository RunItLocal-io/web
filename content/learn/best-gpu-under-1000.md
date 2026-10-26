---
title: "The best GPU for local AI under $1,000"
description: Why a used RTX 3090 is the best local AI card under $1,000, how it compares to new 16 GB cards and the RTX A4500, and what to buy for each kind of use.
track: hardware
order: 15
date: 2026-10-26
models: qwen3-32b, qwen3-30b-a3b, gemma-3-27b, gpt-oss-20b
---
**A used RTX 3090.** At about **$650 to $850** as of October 2026, it's the cheapest way to get 24 GB of fast memory on one card, and memory decides what you can run. Nothing new under $1,000 matches it for local LLMs. The leftover budget covers a good power supply.

## Why 24 GB wins at this price

New cards in this price range mostly have 12 or 16 GB. That's enough for 14B models and gpt-oss 20B, but not the 27B to 32B class, which is where local models get noticeably better at code and hard problems. See [the best local LLM for 24 GB](/learn/best-local-llm-for-24gb-vram).

{{lineup rtx-3090}}

Those are our calculator's estimates: Qwen3 32B at about 26 tok/s, Gemma 3 27B at about 30 tok/s, and Qwen3 30B-A3B at around 164 tok/s.

## The options

| Card | Memory | Bandwidth | Qwen3 32B, estimated | Price |
|---|---|---|---|---|
| [RTX 3090](/gpu/rtx-3090), used | 24 GB | 936 GB/s | ~26 tok/s | $650 to $850 |
| [RX 7900 XTX](/gpu/rx-7900-xtx), used | 24 GB | 960 GB/s | ~26 tok/s | Check current prices |
| [RTX A4500](/gpu/rtx-a4500), used | 20 GB | 640 GB/s | Doesn't fit | Check current prices |
| [RTX 5070 Ti](/gpu/rtx-5070-ti) | 16 GB | 896 GB/s | Doesn't fit | Check current prices |
| [RTX 5060 Ti 16 GB](/gpu/rtx-5060-ti) | 16 GB | 448 GB/s | Doesn't fit | Check current prices |
| 2× [Tesla P100](/gpu/tesla-p100), used | 32 GB | 732 GB/s | ~20 tok/s | $170 to $240 the pair |

The 3090 and P100 prices are from our [builds page](/builds). Check current prices for the rest.

## When to pick something else

**You want new, with a warranty.** A 16 GB card like the RTX 5070 Ti is fast on what fits: gpt-oss 20B at about 157 tok/s estimated. You give up the 24 GB class. A 5060 Ti 16 GB fits the same models at about half the speed.

**You already run AMD or Linux.** The RX 7900 XTX matches the 3090 on paper. Software takes more effort; see [AMD GPUs for local AI](/learn/amd-gpus-for-local-ai).

**You want a compact, efficient card.** The RTX A4500 is a workstation card with 20 GB and a blower fan. On our rack, **two A4500s run Qwen3.6-35B-A3B at 110 tok/s, measured**, and they won every speed test while sitting on their power cap. One card fits up to Gemma 3 27B, at about 21 tok/s estimated, but not Qwen3 32B.

**You want the most memory for the least money.** Two Tesla P100s give 32 GB for a fraction of the budget. On our rack they run Qwen3.6-35B-A3B at 53 tok/s, measured. They need shrouds, a workstation and some homework. See [the Tesla P100 guide](/learn/tesla-p100-for-local-llms).

## Spend the rest wisely

A 3090 at $650 to $850 leaves room for the parts that matter:

- **An 850 W power supply of good quality.** The 3090 spikes well above its 350 W rating. See [power supplies for multi-GPU](/learn/power-supplies-for-multi-gpu).
- **32 GB of system RAM**, so models load fast and you have headroom.
- **A case that fits it.** Most 3090s are over 30 cm long and three slots thick.

Our "Popular" build is a used desktop with a 3090 for about $900 to $1,200 all in.

## Buying used

A 3090 is a used purchase, so test it under load and check memory temperatures before you pay. Our [used RTX 3090 buying guide](/learn/used-rtx-3090-buying-guide) covers what to look for, and [how to check a used GPU](/learn/how-to-check-a-used-gpu) covers testing any card.

## Our pick

- **Best overall:** used RTX 3090.
- **New only:** a 16 GB card, accepting 20B as your ceiling.
- **Most memory per dollar:** two Tesla P100s.
- **Want 70B models later?** Start with one 3090 and add a second. See [RTX 4090 vs two 3090s](/learn/rtx-4090-vs-two-3090s).
