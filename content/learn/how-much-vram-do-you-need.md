---
title: How much VRAM do you need to run an LLM locally?
description: A simple rule for how much graphics memory a model needs, what fits in 8, 12, 16, 24 and 48 GB, and why context length adds more.
track: basics
order: 1
date: 2026-10-26
models: qwen3-8b, qwen3-14b, qwen3-32b, llama-3-3-70b
---
**Memory decides which models you can run. Speed comes second.** If a model doesn't fit in your graphics card's memory (VRAM), it spills onto the processor and slows to a crawl. So the first question is always: does it fit?

## The rule of thumb

At the 4-bit size most people run (what Ollama downloads by default):

> **GB needed ≈ billions of parameters × 0.6, plus 1 to 2 GB for context.**

So an 8B model needs about 5 GB plus context, a 32B model about 20 GB plus context, and a 70B model about 43 GB plus context.

Where does 0.6 come from? A 4-bit model stores each parameter in about 4.8 bits once you count the scaling data, and 4.8 ÷ 8 bits per byte ≈ 0.6 bytes. For other sizes, see [quantization explained](/learn/quantization-explained).

## What fits in your card

| VRAM | Best models that fit comfortably | Example cards |
|---|---|---|
| 8 GB | Qwen3 8B | RTX 4060, RTX 3070, RX 7600 |
| 12 GB | Qwen3 14B, Gemma 3 12B | RTX 3060 12 GB, RTX 4070 |
| 16 GB | gpt-oss 20B, Qwen3 14B with long context | RTX 4060 Ti 16 GB, RTX 5080, Tesla P100 |
| 24 GB | Qwen3 32B, Qwen3 30B-A3B, Gemma 3 27B | RTX 3090, RTX 4090, RX 7900 XTX |
| 32 GB | The 30B class with lots of context | RTX 5090, two P100s |
| 48 GB+ | Llama 3.3 70B | Two 3090s, RTX A6000, a 64 GB Mac |

Each card has a page with the full list and speeds. Start at [every GPU](/gpu).

## Why context needs memory too

While it works, a model keeps a memory of everything in the conversation, called the KV cache. It grows with every token.

For a model like Llama 3 8B that's about **128 KB per token**, so an 8,000-token conversation adds about 1 GB, and 32,000 tokens adds about 4 GB. Bigger models need more per token. This is why a model that "fits" can still run out of memory when you paste in a long document.

Ollama starts with a short context to save memory. You can raise it, but leave room for it when you choose a card.

## Macs are different

Macs with Apple silicon share one pool of memory between the processor and the GPU. macOS lets the GPU use about **two thirds** of it on machines up to 36 GB, and about **three quarters** above that. A 64 GB Mac has roughly 48 GB for models, which is enough for Llama 3.3 70B. See [Macs for local LLMs](/learn/mac-for-local-llms).

## What if it doesn't fit?

- **Pick a smaller model or a smaller quant.** Usually the better choice.
- **Let it spill onto the CPU.** It works, but expect speed to drop by five to ten times.
- **Add a second card.** Two GPUs pool their memory for models. Two used 24 GB cards run 70B models. See the [builds](/builds).

## Check a specific card

Here's a 24 GB RTX 3090, the most popular card for this, from our calculator:

{{lineup rtx-3090}}
