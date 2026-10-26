---
title: "Mixture of experts explained: why a 30B model can run like a 3B"
description: What MoE models are, what "active parameters" means, and why models like Qwen3 30B-A3B and gpt-oss are so fast on home hardware.
track: basics
order: 4
date: 2026-10-26
models: qwen3-30b-a3b, gpt-oss-20b, gpt-oss-120b
---
Some of the best models to run at home are **mixture-of-experts** (MoE) models. They have the knowledge of a big model and the speed of a small one. The catch is memory.

## How it works

A normal (dense) model uses every one of its parameters for every token. An MoE model splits most of its layers into many smaller "experts", and a small router picks just a few of them for each token.

So an MoE model has two sizes:

- **Total parameters:** everything that has to be loaded into memory.
- **Active parameters:** what's actually used per token, which sets the speed.

The names often tell you both. **Qwen3 30B-A3B** has 30 billion total and about 3 billion active.

## Why it's fast

Speed comes from how many bytes you read from memory per token (see [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed)). An MoE model only reads its active experts:

| Model | Total | Active | RTX 3090, estimated |
|---|---|---|---|
| Qwen3 32B (dense) | 32B | 32B | ~26 tok/s |
| Qwen3 30B-A3B (MoE) | 30B | 3B | ~160 tok/s |
| gpt-oss 20B (MoE) | 21B | 3.6B | ~160 tok/s |

Similar size, about six times the speed.

## The catch: it all has to fit

All the experts must be loaded, because the router can pick any of them for the next token. So Qwen3 30B-A3B still needs about 20 GB, the same as a dense 32B. It's fast, but not small.

MoE also doesn't make a model smarter than its total size. A 30B MoE is generally a little behind a dense 32B on hard problems, and much faster. For most people that's a great trade.

## Where MoE shines

- **Older cards with lots of memory.** Data-center cards like the Tesla P100 have plenty of memory but no modern compute. MoE plays to that. On our rack, two P100s run a 35B MoE at **53 tok/s**.
- **Macs.** Big unified memory and moderate bandwidth is exactly the right shape. A 128 GB Mac runs gpt-oss 120B at a usable speed, where a dense 70B crawls.
- **Spilling onto the CPU.** If an MoE model doesn't quite fit, keeping the experts in system RAM and the rest on the GPU works far better than it does for dense models. llama.cpp can do this with its `--n-cpu-moe` option.

## Try one

On a 24 GB card:

```sh
ollama run qwen3:30b
```

On a 16 GB card or Mac:

```sh
ollama run gpt-oss:20b
```
