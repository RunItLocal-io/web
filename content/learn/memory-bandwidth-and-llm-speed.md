---
title: Why memory bandwidth sets LLM speed (and how to estimate tokens per second)
description: The one spec that predicts how fast a GPU runs a local model, the formula we use, and why a 2016 data-center card can beat a new gaming card.
track: basics
order: 3
date: 2026-10-26
models: qwen3-32b, qwen3-30b-a3b
---
When people compare GPUs for gaming they look at compute. For running a language model, the number that matters most is **memory bandwidth**: how many gigabytes per second the card can read from its own memory.

## Why bandwidth, not compute

To produce each token, the model reads all of its active weights from memory once. The math on those weights is quick; waiting for the data to arrive is the slow part. So:

> **tokens per second ≈ memory bandwidth ÷ size of the active weights × efficiency**

Efficiency covers everything that isn't perfect: overhead, cache misses, the software. On our rack, dense models reach about **55%** of the ceiling, and mixture-of-experts models about **35%**.

## Try it

An RTX 3090 has **936 GB/s**. Qwen3 32B at 4-bit is about **20 GB**:

936 ÷ 20 × 0.55 ≈ **26 tok/s**

That's comfortably faster than you can read. Our calculator does exactly this for every card and model we track, and it's usually within about a third of real results.

## Why an old card can beat a new one

| Card | Year | Bandwidth | Qwen3 14B, estimated |
|---|---|---|---|
| RTX 4060 Ti 16 GB | 2023 | 288 GB/s | ~17 tok/s |
| Tesla P100 16 GB | 2016 | 732 GB/s | ~43 tok/s |
| RTX 3090 24 GB | 2020 | 936 GB/s | ~55 tok/s |

The P100 is a 2016 data-center card with no tensor cores, and it's more than twice as fast as a new mid-range gaming card on this job, because it has fast HBM2 memory. We run a rack of them; see [the P100 for local LLMs](/learn/tesla-p100-for-local-llms).

## Where the formula breaks down

- **Prompt processing is different.** Reading a long document *into* the model is compute-bound, not bandwidth-bound. Newer cards with tensor cores are far faster at it. If you paste in huge documents, compute matters too.
- **Mixture-of-experts models** only read the experts they use per token, so they run much faster than their size suggests. See [mixture of experts explained](/learn/mixture-of-experts-explained).
- **Spilling onto the CPU** drops you to system memory bandwidth, typically 50 to 100 GB/s. That's why a model that doesn't fit gets so slow.
- **Two GPUs** splitting a model by layers run at about the speed of one card, with twice the memory. Splitting every layer across cards (tensor parallel) can be faster, but needs server software like vLLM.

## Macs

Apple silicon has a lot of bandwidth for a laptop: an M4 Max reads at about 546 GB/s, and an M3 Ultra at about 819 GB/s. That's why big-memory Macs run large models well. See [Macs for local LLMs](/learn/mac-for-local-llms).

## See it for any card

{{lineup tesla-p100}}

Pick any card on [every GPU](/gpu) to see the same estimate for it.
