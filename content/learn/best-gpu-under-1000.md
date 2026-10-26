---
title: "The best GPU for local AI under $1,000"
description: What to buy for local AI under $1,000 now that a used RTX 3090 costs more, how Tesla P100s and the RTX 3060 compare to new 16 GB cards and the RTX A4500, and what to buy for each kind of use.
track: hardware
order: 15
date: 2026-10-26
models: qwen3-32b, qwen3-30b-a3b, gemma-3-27b, gpt-oss-20b
---
**Two used Tesla P100s, or a used RTX 3060 12 GB for the easy path.** The used RTX 3090 used to be the answer here, but at about **$1,400 to $1,600** as of October 2026 it has moved above $1,000. Two P100s, at **$200 to $300** for the pair, are now the cheapest way to 32 GB of fast memory, and memory decides what you can run. A used RTX 3060 12 GB, at **$300 to $380**, fits 14B models and every tool supports it. The leftover budget covers the computer around them.

## Why 24 GB wins at this price

New cards in this price range mostly have 12 or 16 GB. That's enough for 14B models and gpt-oss 20B, but not the 27B to 32B class, which is where local models get noticeably better at code and hard problems. See [the best local LLM for 24 GB](/learn/best-local-llm-for-24gb-vram). Under $1,000, two P100s are the reliable way into that class. A 3090 does it on one card, but no longer at this price; here's what it gets you if you can stretch:

{{lineup rtx-3090}}

Those are our calculator's estimates: Qwen3 32B at about 26 tok/s, Gemma 3 27B at about 30 tok/s, and Qwen3 30B-A3B at around 164 tok/s.

## The options

| Card | Memory | Bandwidth | Qwen3 32B, estimated | Price |
|---|---|---|---|---|
| [RTX 3090](/gpu/rtx-3090), used | 24 GB | 936 GB/s | ~26 tok/s | $1,400 to $1,600, over budget |
| [RX 7900 XTX](/gpu/rx-7900-xtx), used | 24 GB | 960 GB/s | ~26 tok/s | Check current prices |
| [RTX A4500](/gpu/rtx-a4500), used | 20 GB | 640 GB/s | Doesn't fit | Check current prices |
| [RTX 5070 Ti](/gpu/rtx-5070-ti) | 16 GB | 896 GB/s | Doesn't fit | Check current prices |
| [RTX 5060 Ti 16 GB](/gpu/rtx-5060-ti) | 16 GB | 448 GB/s | Doesn't fit | Check current prices |
| 2× [Tesla P100](/gpu/tesla-p100), used | 32 GB | 732 GB/s | ~20 tok/s | $200 to $300 the pair |
| [RTX 3060 12 GB](/gpu/rtx-3060), used | 12 GB | 360 GB/s | Doesn't fit | $300 to $380 |

The 3090, P100 and 3060 prices are from our [builds page](/builds). Check current prices for the rest.

## When to pick something else

**You want new, with a warranty.** A 16 GB card like the RTX 5070 Ti is fast on what fits: gpt-oss 20B at about 157 tok/s estimated. You give up the 24 GB class. A 5060 Ti 16 GB fits the same models at about half the speed.

**You already run AMD or Linux.** The RX 7900 XTX matches the 3090 on paper. Software takes more effort; see [AMD GPUs for local AI](/learn/amd-gpus-for-local-ai).

**You want a compact, efficient card.** The RTX A4500 is a workstation card with 20 GB and a blower fan. On our rack, **two A4500s run Qwen3.6-35B-A3B at 110 tok/s, measured**, and they won every speed test while sitting on their power cap. One card fits up to Gemma 3 27B, at about 21 tok/s estimated, but not Qwen3 32B.

**You want the most memory for the least money.** Two Tesla P100s give 32 GB for a fraction of the budget. On our rack they run Qwen3.6-35B-A3B at 53 tok/s, measured. They need shrouds, a workstation and some homework. See [the Tesla P100 guide](/learn/tesla-p100-for-local-llms).

**You want 24 GB on one card and can spend more.** A used RTX 3090 is still the community default, but it now costs $1,400 to $1,600 for the card alone. See the [used RTX 3090 buying guide](/learn/used-rtx-3090-buying-guide).

## Spend the rest wisely

Two P100s at $200 to $300, or a 3060 at $300 to $380, leave room for the parts that matter:

- **A host that fits them.** Two P100s need a used workstation like a Dell T7810 or HP Z840, about $500 to $700 with 64 GB of RAM; buy one with the RAM already in it, because adding DDR4 now costs more than the computer. A 3060 goes in a used desktop tower with 16 GB of RAM and a 450 W+ supply, about $150 to $250.
- **An SSD.** A 1 TB NVMe drive is about $130 to $180 now, so keep the one that came in the machine if it has one.
- **Power and cooling.** Check the supply has the right cables (P100s take an EPS adapter, the 3060 an 8-pin GPU cable), and add a blower shroud to each P100. See [power supplies for multi-GPU](/learn/power-supplies-for-multi-gpu).

Our "Starter" build is a used desktop with a 3060 for about $600 to $800 all in, and our "Best value" build, a workstation with two P100s, is about $750 to $1,100. The "Popular" 3090 desktop is now $1,850 to $2,250.

## Buying used

Everything here except the new 16 GB cards is a used purchase, so test each card under load and check temperatures before you pay. Our [used RTX 3090 buying guide](/learn/used-rtx-3090-buying-guide) covers what to look for, and [how to check a used GPU](/learn/how-to-check-a-used-gpu) covers testing any card.

## Our pick

- **Best overall:** two used Tesla P100s, if you're fine with shrouds and llama.cpp-based tools.
- **Easiest:** a used RTX 3060 12 GB.
- **New only:** a 16 GB card, accepting 20B as your ceiling.
- **24 GB on one card:** a used RTX 3090, now above $1,000.
- **Want 70B models later?** That now takes well over $1,000. See [RTX 4090 vs two 3090s](/learn/rtx-4090-vs-two-3090s).
