---
title: "The Tesla P100 for local LLMs: 16 GB of HBM2 for under $100"
description: What we learned running a rack of 2016 data-center P100s for AI. Real speeds, what it takes to cool and power them, and the software catch.
track: hardware
order: 2
date: 2026-10-26
models: qwen3-14b, gpt-oss-20b, qwen3-30b-a3b
---
The Tesla P100 is a data-center card from 2016. It has no fans, no display outputs and no tensor cores. It's also one of the best deals in local AI, because it has **16 GB of HBM2 memory at 732 GB/s**, and used ones sell for under $100. We run a rack of them.

## Why it's fast at this

Generating text is limited by memory bandwidth, not compute (see [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed)). The P100's bandwidth is more than double that of a new RTX 4060 Ti, so for generating text it's simply faster.

{{lineup tesla-p100}}

## What we measured

On our rack, **two P100s run Qwen3.6-35B-A3B at 53 tok/s.** That's a 35B mixture-of-experts model split across both cards' 32 GB. In a run of a billion tokens across 90 used GPUs, the P100s never throttled, and power came to about 6 to 8 cents per million tokens.

## The catches

**Cooling is not optional.** The P100 is passive: it expects a server pushing air straight through it. In a normal case it overheats within minutes. You need either a server chassis or a 3D-printed or bought blower shroud on each card, about $15 to $25 each.

**Power uses a CPU-style plug.** The P100 takes an 8-pin EPS connector, like a motherboard's CPU power, not a normal graphics card plug. Use the right adapter. Plugging in the wrong cable can damage the card or the supply.

**Old architecture, limited software.** Pascal (compute capability 6.0) is supported by llama.cpp and the tools built on it, including Ollama and LM Studio. Many newer server engines, like vLLM, need newer cards. NVIDIA's newest CUDA releases have also dropped Pascal, so stay on a driver and CUDA version that still supports it.

**Slow at reading long prompts.** No tensor cores means prompt processing is much slower than on an RTX card. Chatting is fine; pasting a 50-page document takes a while.

**No display output.** You need another GPU, or the CPU's graphics, for a monitor.

## What to build around it

A used workstation like a Dell T7810 or HP Z840 is ideal: lots of PCIe slots, big power supplies, and 64 GB of RAM for a few hundred dollars. Two P100s plus shrouds and cables come to about **$450 to $650** all in. That's our "Best value" build on the [builds page](/builds), with a full parts list.

## Who it's for

- **Good fit:** tinkerers who want 32 GB of fast memory cheaply, homelabs, and anyone serving a model to a few people around the clock.
- **Bad fit:** a quiet desk machine, image generation (slow without tensor cores), or anyone who wants it to just work out of the box. For that, a [used RTX 3090](/learn/used-rtx-3090-buying-guide) is the easy path.

Running one already? [Send us your numbers](/learn/posts#share).
