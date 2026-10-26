---
title: "Running LLMs on a Mac: which M-series chip and how much memory"
description: Why Macs with Apple silicon are good at local AI, how much unified memory you need for each model size, and how they compare to a PC with a GPU.
track: hardware
order: 3
date: 2026-10-26
models: qwen3-8b, gpt-oss-20b, llama-3-3-70b, gpt-oss-120b
---
A Mac with Apple silicon is one of the easiest ways to run local AI, and with enough memory one of the few ways to run really big models in a quiet box on your desk.

## Why Macs are good at this

On a PC, a model has to fit in the graphics card's memory, usually 8 to 24 GB. A Mac shares one pool of **unified memory** between the processor and the GPU, and you can buy it with 64, 128 GB or more. That fits models no single consumer graphics card can hold.

The trade-off is speed. Generating text is limited by memory bandwidth (see [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed)), and only the Max and Ultra chips have GPU-class bandwidth.

## Chip matters as much as memory

| Chip | Bandwidth | Qwen3 8B, estimated |
|---|---|---|
| [M2](/gpu/apple-m2) | 100 GB/s | ~11 tok/s |
| [M4 Pro](/gpu/apple-m4-pro) | 273 GB/s | ~29 tok/s |
| [M4 Max](/gpu/apple-m4-max) | 546 GB/s | ~58 tok/s |
| [M3 Ultra](/gpu/apple-m3-ultra) | 819 GB/s | ~87 tok/s |

A base M-chip is fine for small models. For anything 30B and up, look at a Max or Ultra.

## How much memory

macOS lets the GPU use about **two thirds** of memory on Macs up to 36 GB and about **three quarters** above that. Roughly:

| Unified memory | Usable for models | Runs well |
|---|---|---|
| 16 GB | ~11 GB | Qwen3 8B |
| 24 GB | ~16 GB | gpt-oss 20B, Qwen3 14B |
| 36 to 48 GB | ~24 to 36 GB | Qwen3 30B-A3B, Qwen3 32B, Gemma 3 27B |
| 64 GB | ~48 GB | Llama 3.3 70B (slowly) |
| 128 GB+ | ~96 GB+ | gpt-oss 120B |

If you know what you're doing, you can raise the GPU's share at your own risk, for example to 56 GB on a 64 GB Mac (it resets on reboot):

```sh
sudo sysctl iogpu.wired_limit_mb=57344
```

## The big-model sweet spot: mixture of experts

Big dense models like Llama 3.3 70B run at single-digit speeds on most Macs. **Mixture-of-experts** models are a much better fit, because they need lots of memory but read only a small part of it per token. gpt-oss 120B on a 128 GB M4 Max runs at an estimated **60+ tok/s**, while Llama 3.3 70B manages about 7. See [mixture of experts explained](/learn/mixture-of-experts-explained).

{{lineup apple-m4-max 128}}

## Mac or PC?

- **Mac:** silent, low power (about 100 W), simple, and the only easy way to 128 GB+. Slower per dollar for models that fit on a GPU, and much slower at reading long prompts.
- **PC with a used 3090:** faster for anything that fits in 24 GB, and cheaper. Loud, hot, and needs a second card for 70B models.

A used Mac Studio with 64 GB is our "Quiet" build on the [builds page](/builds).

## Software

[Ollama](/learn/how-to-run-ai-locally) works out of the box and uses the GPU automatically. LM Studio also supports **MLX**, Apple's own format, which is often a little faster on Macs. See [Ollama vs llama.cpp vs LM Studio](/learn/ollama-vs-llama-cpp-vs-lm-studio).
