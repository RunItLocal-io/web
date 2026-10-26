---
title: "Run an LLM on CPU only: local AI on a laptop without a GPU"
description: Which models run on a laptop with no graphics card, how fast to expect them, and the settings that make CPU-only local AI usable.
track: start
order: 4
date: 2026-10-26
models: qwen3-4b, qwen3-8b, gpt-oss-20b
---
**Yes, you can run a language model on a laptop with no graphics card.** Ollama falls back to the processor automatically. The catch is speed: stick to a small model like [Qwen3 4B](/model/qwen3-4b) and it runs at about reading speed. Go bigger and it slows to a crawl, unless the bigger model is a mixture of experts.

## Why the CPU is slower

Each word a model writes means reading all of its active weights from memory once. So speed comes down to memory bandwidth (see [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed)). A graphics card's memory moves 300 to 1,000 GB/s. A laptop's normal RAM moves something like 50 to 100 GB/s. That gap, not the processor itself, is why CPU-only is slower.

The upside: laptop RAM is often bigger than a cheap card's VRAM. A 32 GB laptop can load models that an 8 GB graphics card can't.

## What to expect

Our calculator assumes about 60 GB/s for a laptop without a graphics card, and lets models use about 60% of system memory. Its estimates:

| Model | 16 GB laptop | 32 GB laptop |
|---|---|---|
| [Qwen3 4B](/model/qwen3-4b) | ~13 tok/s | ~13 tok/s |
| [Qwen3 8B](/model/qwen3-8b) | ~6 tok/s | ~6 tok/s |
| Qwen3 14B | does not fit | ~4 tok/s |
| [gpt-oss 20B](/model/gpt-oss-20b) | does not fit | ~11 tok/s |
| Gemma 3 27B | does not fit | ~2 tok/s |

Around 10 tok/s is about reading speed. Under 5 tok/s works for short tasks if you're patient. These are estimates: a laptop with fast DDR5 memory will beat them, and an older one with a single memory stick will fall short.

Notice gpt-oss 20B. It's bigger than Qwen3 14B but nearly three times faster, because only about 3.6B of its 21B parameters work on each token. On a 32 GB laptop it's the best model you can run at a usable speed. More in [mixture of experts explained](/learn/mixture-of-experts-explained).

## How to set it up

Install Ollama from [ollama.com](https://ollama.com/download). Nothing special is needed for CPU-only. See the [Windows](/learn/run-ai-locally-on-windows) or [Linux](/learn/run-ai-locally-on-linux) guide if you get stuck. Then start with the small model:

```sh
ollama run qwen3:4b
```

While it's loaded, check where it's running:

```sh
ollama ps
```

On a laptop without a supported graphics card, the `PROCESSOR` column says `100% CPU`. That's expected.

## Making it faster

- **Plug in.** Many laptops slow the processor on battery.
- **Close the browser tabs.** Memory used by other apps is memory the model can't have, and if the system starts swapping to disk, speed collapses.
- **Keep chats short.** Every token of context has to be processed. On a CPU, reading a long pasted document takes much longer than writing the answer.
- **Turn off thinking for quick jobs.** Qwen3 models reason out loud before answering, which means more tokens to generate. For a rewrite or a summary, type `/set nothink` in the chat to skip it.
- **Use a MoE model if you have the RAM.** gpt-oss 20B on 32 GB is the sweet spot.

## What about built-in graphics?

Most laptops have graphics built into the processor (Intel Iris or Arc, AMD Radeon). They share the same system RAM, so they don't add much bandwidth, and Ollama mostly runs on the CPU with them. Two things can still use them:

- **LM Studio** has a Vulkan option that can run models on many integrated GPUs. Results vary by chip and driver. See [Ollama vs llama.cpp vs LM Studio](/learn/ollama-vs-llama-cpp-vs-lm-studio).
- **Your browser.** Our [Studio](/studio) runs small models on whatever graphics you have through WebGPU, with nothing to install. See [run AI in your browser](/learn/run-ai-in-your-browser-webgpu).

## Macs are the exception

An Apple silicon MacBook isn't "CPU only". Its GPU shares fast unified memory and Ollama uses it automatically. Even a base M1 runs Qwen3 4B at about 15 tok/s by our estimate. See [run AI locally on a Mac](/learn/run-ai-locally-on-a-mac).

## When to stop and buy a card

If you find yourself using it daily and wishing it were smarter, the cheapest real upgrade is a graphics card in a desktop. Our Starter build, a used desktop with an RTX 3060 12 GB, comes to about $300 to $400 and runs Qwen3 8B at about 38 tok/s by our estimate:

{{lineup rtx-3060 12}}

## Where to go next

- **Which model when you have more memory?** Read [how much VRAM you need](/learn/how-much-vram-do-you-need).
- **Need ideas for a small model?** See [your first week with local AI](/learn/first-week-with-local-ai).
- **Shopping?** Every option with a parts list is on the [builds page](/builds).
