---
title: "Mini PCs and AMD Strix Halo for local AI: unified memory on x86"
description: Can a mini PC run local LLMs? What ordinary mini PCs manage, why AMD's Strix Halo chips with up to 128 GB of shared memory are different, and the trade-offs.
track: hardware
order: 17
date: 2026-10-26
models: qwen3-4b, qwen3-8b, qwen3-30b-a3b, gpt-oss-120b
---
**An ordinary mini PC runs small models slowly. A Strix Halo mini PC is a different class of machine.** AMD's Ryzen AI Max chips, codenamed Strix Halo, pair a large built-in GPU with up to 128 GB of shared memory, the same idea as an Apple silicon Mac. That lets a small, quiet x86 box load models no single consumer graphics card can hold. The catch is speed: its memory is much slower than a graphics card's.

## Ordinary mini PCs

Most mini PCs use the processor's built-in graphics and regular dual-channel laptop memory. That memory is slow, typically under 100 GB/s, and generation speed follows bandwidth (see [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed)).

In practice that means:

- **Small models are usable.** [Qwen3 4B](/model/qwen3-4b) and [Qwen3 8B](/model/qwen3-8b) work for chat, slowly.
- **Mixture-of-experts models are the best fit.** They read only a few billion weights per token, so if the machine has enough RAM, a model like [Qwen3 30B-A3B](/model/qwen3-30b-a3b) can be surprisingly usable.
- **Big dense models crawl.**

Run them like any CPU-only machine. See [running AI without a GPU](/learn/run-ai-on-a-laptop-without-a-gpu).

## What Strix Halo changes

Strix Halo machines use a wider memory bus, giving roughly **256 GB/s**: about three times a normal mini PC, and similar to an Apple M4 Pro. Exact figures depend on the memory fitted, so check the spec of the machine you're looking at.

The bigger change is capacity. With 128 GB of shared memory, a large portion can be given to the GPU. How much, and how you set it, depends on the machine, its firmware and your operating system. Check the maker's documentation.

That's enough for models that normally need two or more graphics cards:

- **[gpt-oss 120B](/model/gpt-oss-120b)** needs about 67 GB. As a mixture-of-experts model with about 5B active parameters, it's the standout fit for this kind of machine.
- **[Llama 3.3 70B](/model/llama-3-3-70b)** at about 45 GB fits, but as a dense model on this bandwidth it will be slow.

## Rough speeds

Our calculator doesn't have a Strix Halo page yet. The closest machine it covers is the Apple M4 Pro, at 273 GB/s, so its estimates are a rough guide for the models that fit:

{{lineup apple-m4-pro 64}}

Read that as: Qwen3 30B-A3B and gpt-oss 20B fast enough to be pleasant, at around 48 tok/s estimated; dense 27B to 32B models slow, under 10 tok/s; and 70B dense very slow.

## Strix Halo vs the alternatives

| | Strix Halo, 128 GB | Mac Studio, 64 GB | RTX 3090 desktop |
|---|---|---|---|
| Memory for models | Most of 128 GB, configurable | About 48 GB usable | 24 GB |
| Bandwidth | About 256 GB/s | 400 GB/s (M1/M2 Max) | 936 GB/s |
| gpt-oss 120B | Fits | Doesn't fit | Doesn't fit |
| Noise | Quiet | Silent | Loud under load |
| Used price, Oct 2026 | Check current prices | $1,500 to $2,100 | $900 to $1,200 |

The Mac and 3090 prices are from our [builds page](/builds).

## Software

Strix Halo runs llama.cpp and the tools built on it, using AMD's GPU through Vulkan or ROCm. Support has been improving; check current ROCm and tool documentation for your chip. See [AMD GPUs for local AI](/learn/amd-gpus-for-local-ai) for how the two paths compare, and [Ollama vs llama.cpp vs LM Studio](/learn/ollama-vs-llama-cpp-vs-lm-studio) for which tool to start with.

## Who it's for

- **Good fit:** a quiet, low-power box that can load very large mixture-of-experts models, on Windows or Linux.
- **Bad fit:** fast dense models, image generation at speed, or anyone who wants the widest tool support. A [used RTX 3090](/learn/used-rtx-3090-buying-guide) is faster for everything that fits in 24 GB.
- **Comparing with a Mac?** See [Macs for local LLMs](/learn/mac-for-local-llms).
