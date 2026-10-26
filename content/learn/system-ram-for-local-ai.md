---
title: "How much RAM do you need for local AI? (System RAM, not VRAM)"
description: How much system memory a local AI machine needs when the model is on the GPU, when it spills onto the CPU, on a Mac, and with no GPU at all.
track: basics
order: 12
date: 2026-10-26
models: qwen3-8b, qwen3-32b, gpt-oss-120b
---
**If your model fits on the GPU: 16 GB is the minimum and 32 GB is comfortable. If you plan to spill models onto the CPU, or run with no GPU, you want enough RAM to hold the model plus about 8 GB for everything else.** A Mac is different, because its RAM is the GPU's memory.

## Model on the GPU: RAM is a supporting act

When everything fits in VRAM, system RAM mostly helps with loading. The model file is read from disk, often through RAM, and then copied to the card. After that it sits on the GPU, and RAM speed has no effect on how fast the model writes.

So you need enough for your operating system, your browser and other apps, the inference tool itself, and some room for the file while it loads. In practice:

| GPU setup | Comfortable system RAM |
|---|---|
| One 8 to 12 GB card | 16 GB |
| One 24 GB card | 32 GB |
| Two or more cards, 32 to 48 GB of VRAM | 64 GB |

That's what our builds use. The RTX 3060 starter has 16 GB, the RTX 3090 desktop has 32 GB, and the used workstations for multi-GPU builds come with 64 GB, which is cheap in old DDR4 workstations. See the [builds page](/builds).

Having less than the model's size in RAM usually still works, because tools like llama.cpp can stream the file from disk instead of holding it all. It can make loading slower, and it's tight if you also run a browser and Docker.

## Model spilling onto the CPU: RAM is the bottleneck

If the model doesn't fit in VRAM, the rest goes in system RAM and runs on the CPU. Now RAM matters twice:

- **Size.** VRAM + system RAM has to hold the whole model, its context, and your OS. Rule of thumb: **RAM ≥ (model file − VRAM) + 8 GB.**
- **Speed.** Every token reads the offloaded part from RAM, so RAM bandwidth sets your speed. Fill both memory channels (two or four matching sticks), and faster RAM helps directly.

Example: [gpt-oss 120B](/model/gpt-oss-120b) is about 65 GB. On a 24 GB card, about 41 GB has to live in RAM, plus your OS, so **64 GB of RAM** is the realistic minimum. Because it's a mixture-of-experts model, this setup is usable; a dense model of the same size would crawl. See [CPU offloading explained](/learn/cpu-offloading-explained).

## No GPU at all

On a CPU-only machine, RAM is your VRAM. Use the same sizing as [how much VRAM you need](/learn/how-much-vram-do-you-need), plus room for the OS:

| System RAM | What runs |
|---|---|
| 8 GB | [Qwen3 4B](/model/qwen3-4b), tightly |
| 16 GB | [Qwen3 8B](/model/qwen3-8b) |
| 32 GB | Qwen3 14B, or Qwen3 30B-A3B, which is quick on a CPU because only 3B parameters are active |
| 64 GB+ | Bigger models, slowly |

Expect a few tokens per second on dense models. MoE models are the best fit for CPU-only machines. See [running AI on a laptop without a GPU](/learn/run-ai-on-a-laptop-without-a-gpu).

## Macs: unified memory

On Apple silicon, there's one pool of memory shared by the CPU and GPU, and macOS lets the GPU use about two thirds of it on machines up to 36 GB, and about three quarters above that. So RAM *is* the model budget:

| Mac memory | Roughly usable for models |
|---|---|
| 16 GB | ~11 GB |
| 32 GB | ~21 GB |
| 64 GB | ~48 GB |
| 128 GB | ~96 GB |

With a Mac, buy as much memory as you can afford. You can't add it later. See [Macs for local LLMs](/learn/mac-for-local-llms).

## Other reasons to add RAM

- **Keeping several models loaded.** Ollama can keep models in memory between requests. Swapping between models is quicker if the file is still cached in RAM.
- **Docker and Open WebUI.** A few GB for the containers. See [Open WebUI setup](/learn/open-webui-setup).
- **Documents and embeddings.** Document search keeps an index in RAM. Small for personal use.

## Quick answer by machine

- **Gaming PC, 8 to 16 GB card:** 16 GB is fine, 32 GB if you multitask.
- **One 24 GB card:** 32 GB.
- **Two cards, or plans to offload big MoE models:** 64 GB or more.
- **Mac:** as much unified memory as the budget allows.

Here's what a 24 GB card runs with everything in VRAM, so RAM size doesn't touch speed:

{{lineup rtx-3090}}
