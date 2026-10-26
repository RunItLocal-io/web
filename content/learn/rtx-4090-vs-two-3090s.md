---
title: "RTX 4090 vs two RTX 3090s for local AI: which should you buy?"
description: One 24 GB RTX 4090 or two used 3090s with 48 GB? Speeds, what each can run, power, cost and which is right for chat, 70B models and image generation.
track: hardware
order: 6
date: 2026-10-26
models: qwen3-32b, qwen3-30b-a3b, llama-3-3-70b
---
**For running LLMs, two used RTX 3090s beat one RTX 4090.** They give you 48 GB instead of 24 GB, which opens up 70B-class models, and they usually cost less. The 4090 wins if you mostly generate images, want one quiet-ish card, or care about fast prompt processing.

## The numbers

| | One RTX 4090 | Two RTX 3090s |
|---|---|---|
| Memory for models | 24 GB | 48 GB |
| Bandwidth per card | 1,008 GB/s | 936 GB/s |
| Qwen3 32B, estimated | ~28 tok/s | ~26 tok/s |
| Qwen3 30B-A3B, estimated | ~176 tok/s | ~164 tok/s |
| Llama 3.3 70B, estimated | Doesn't fit | ~12 tok/s |
| Rated power | 450 W | 2 × 350 W |
| Used price, Oct 2026 | Check current prices | $1,300 to $1,700 for the pair |

Speeds are from our calculator. On anything that fits in 24 GB, the 4090 is only about 8% faster, because generating text is limited by memory bandwidth and the two cards' bandwidth is close. See [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed).

## Two cards don't double speed

When you split a model across two GPUs, the usual way (layer split) runs one card at a time, so you get roughly **one card's speed with two cards' memory**. That's why the 70B estimate is 12 tok/s and not 24. The second 3090 buys capacity, not speed. More in [multi-GPU explained](/learn/multi-gpu-explained).

Here's what the pair runs:

{{lineup rtx-3090 48}}

And one 4090:

{{lineup rtx-4090}}

## Where the 4090 wins

- **Prompt processing.** The 4090 has far more compute, so reading a long document or a big code file before answering is much faster.
- **Image and video generation.** These are compute-bound, and the 4090 is a lot quicker. See [local image generation models](/learn/local-image-generation-models).
- **Simplicity.** One card, one power connector, one slot pair. No riser cables, no worrying about spacing.
- **Power.** One 450 W card draws less than two 350 W cards under load.

## Where two 3090s win

- **48 GB.** Llama 3.3 70B, Qwen3 32B with very long context, or two different models loaded at once.
- **Price.** The pair is usually cheaper than one 4090. Check current used prices for the 4090 before you decide.
- **Serving several people.** More memory means more room for parallel requests.

## What the two-3090 build needs

This is our "Serious" build on the [builds page](/builds), about **$1,900 to $2,500** all in:

- 2× RTX 3090 24 GB: $1,300 to $1,700
- Workstation board with two x16 slots, 64 GB RAM: $350 to $500
- 1,200 W PSU: $150 to $220
- Open frame or large case: $80 to $120

**The gotcha:** two 3090s need real spacing or riser cables, a 1,200 W supply and ideally a dedicated circuit. Expect about 750 W under load. You can cap each card's power with little loss in text speed:

```sh
sudo nvidia-smi -pl 280
```

See [power supplies for multi-GPU](/learn/power-supplies-for-multi-gpu) for sizing.

## What about the RTX 5090?

If you're spending 4090 money, look at the [RTX 5090](/learn/rtx-5090-for-local-ai) too: 32 GB and much higher bandwidth on one card. It still won't fit a 70B model at 4-bit, though.

## Our pick

- **Mostly chat and coding, models up to 32B:** neither. One used 3090 is enough. See the [used RTX 3090 buying guide](/learn/used-rtx-3090-buying-guide).
- **You want 70B models:** two 3090s.
- **You mostly generate images, or want the fastest single card:** the 4090.
