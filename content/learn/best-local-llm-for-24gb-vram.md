---
title: The best local LLM for 24 GB of VRAM (RTX 3090, 4090, 7900 XTX)
description: What to run on a 24 GB card, the community's favorite size for local AI. Picks for speed, smarts, images and code, with estimated speeds.
track: models
order: 2
date: 2026-10-26
models: qwen3-30b-a3b, qwen3-32b, gemma-3-27b, gpt-oss-20b
---
24 GB is where local AI gets serious. It fits the 30B class of models, which are good enough to replace a cloud subscription for a lot of work. It's also why the used RTX 3090 is the most popular card in this hobby.

## Pick for most people: Qwen3 30B-A3B

```sh
ollama run qwen3:30b
```

A [mixture-of-experts](/learn/mixture-of-experts-explained) model: it knows about as much as a 30B model but only works 3B of it per token. On a 3090 we estimate around **160 tok/s**. Answers appear almost instantly, and it leaves a few gigabytes for context.

## Pick for hard problems: Qwen3 32B

```sh
ollama run qwen3:32b
```

The strongest dense model that fits one 24 GB card. It's more careful than the 30B MoE on tricky code and long reasoning, at about **26 tok/s** on a 3090, still faster than reading speed. Use it when getting it right matters more than getting it fast.

## Pick for images: Gemma 3 27B

```sh
ollama run gemma3:27b
```

Google's model reads images as well as text: screenshots, charts, photos of documents. It's also strong at writing and other languages. Around **30 tok/s** on a 3090.

## Pick for reasoning on a budget: gpt-oss 20B

```sh
ollama run gpt-oss:20b
```

OpenAI's smaller open model is fast and good at step-by-step reasoning and tool use. On 24 GB it has lots of room for long context.

## Card by card

The three common 24 GB cards are close, because their memory bandwidth is close:

| Card | Bandwidth | Qwen3 32B | Qwen3 30B-A3B | Used price |
|---|---|---|---|---|
| [RTX 3090](/gpu/rtx-3090) | 936 GB/s | ~26 tok/s | ~160 tok/s | ~$650 to $850 |
| [RX 7900 XTX](/gpu/rx-7900-xtx) | 960 GB/s | ~26 tok/s | ~170 tok/s | varies |
| [RTX 4090](/gpu/rtx-4090) | 1,008 GB/s | ~28 tok/s | ~180 tok/s | much more |
| [Tesla P40](/gpu/tesla-p40) | 346 GB/s | ~10 tok/s | ~60 tok/s | cheap, slow |

The 4090 is much faster at reading long prompts, but for generating text it's only a little ahead of a 3090 that costs a third as much. AMD works well with Ollama and llama.cpp, though fewer other tools support it.

## What doesn't fit

**70B models** like Llama 3.3 70B need about 45 GB. On one 24 GB card they spill onto the CPU and drop to a couple of tokens per second. For those, add a second card: two 3090s run a 70B comfortably.

## The full list for a 3090

{{lineup rtx-3090}}

Thinking about buying one? Read the [used RTX 3090 buying guide](/learn/used-rtx-3090-buying-guide).
