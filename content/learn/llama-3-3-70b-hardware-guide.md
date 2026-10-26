---
title: "Llama 3.3 70B hardware guide: what you need to run it locally"
description: Llama 3.3 70B needs about 45 GB at 4-bit. The setups that run it, two 3090s, a 48 GB card or a big Mac, with estimated speeds and used prices.
track: models
order: 20
date: 2026-10-26
models: llama-3-3-70b, qwen3-32b, gpt-oss-120b
---
**You need about 45 GB of GPU memory.** At the 4-bit size Ollama downloads by default, Llama 3.3 70B is a 43 GB file, plus a gigabyte or two to start a conversation. That rules out every single consumer graphics card. The three common ways to get there: two 24 GB cards, one 48 GB workstation card, or a Mac with 64 GB or more.

## The options

| Setup | Memory | Llama 3.3 70B, estimated | Cost |
|---|---|---|---|
| 2× [RTX 3090](/gpu/rtx-3090) | 48 GB | ~12 tok/s | $1,900 to $2,500, full build |
| 1× [RTX A6000](/gpu/rtx-a6000) | 48 GB | ~10 tok/s | check current used prices |
| [M1 Max](/gpu/apple-m1-max) Mac Studio, 64 GB | ~48 GB usable | ~5 tok/s | $1,500 to $2,100 |
| [M1 Ultra](/gpu/apple-m1-ultra), 128 GB | ~96 GB usable | ~10 tok/s | check current used prices |
| [M3 Ultra](/gpu/apple-m3-ultra), 96 GB | ~72 GB usable | ~10 tok/s | check current used prices |

Speeds come from our calculator. Prices are October 2026 used-market from our [builds page](/builds). A dense 70B model reads all 43 GB for every token, so speed follows memory bandwidth closely; see [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed).

## Two RTX 3090s: the usual answer

Our "Serious" build: two used 3090s on a workstation board with two x16 slots, 64 GB of RAM and a 1,200 W power supply, about **$1,900 to $2,500** all in. It runs Llama 3.3 70B at an estimated 12 tok/s and serves a small team.

Ollama and llama.cpp split the model across both cards by layers automatically. That runs at about one card's speed, not double, but it pools the memory, which is the point. See [multi-GPU explained](/learn/multi-gpu-explained).

The catches: two 3090s need real spacing or riser cables, the whole build draws about 750 W under load, and you want a dedicated circuit. Read the [used RTX 3090 buying guide](/learn/used-rtx-3090-buying-guide) before you buy two.

## One 48 GB card

An RTX A6000 does the same job in one slot, at lower power and with no splitting. It's a little slower than two 3090s because its bandwidth is lower, and it costs more. Worth it if you only have one slot or want a quieter, simpler box.

{{lineup rtx-a6000}}

## A Mac

A 64 GB Mac gives the GPU about 48 GB, just enough. On a Max chip expect around 5 tok/s: it works, but long answers drag. Ultra chips have about twice the bandwidth and reach around 10 tok/s. Macs are also slow to read long prompts. See [Macs for local LLMs](/learn/mac-for-local-llms).

## Older data-center cards

Tesla P100s have 16 GB each, so it takes three for 48 GB. By our formula three would run it at about 9 tok/s, but that means a workstation with three slots, cooling shrouds and the right power cables. Our P100 rack runs mixture-of-experts models instead, where the cards shine. See [the Tesla P100 for local LLMs](/learn/tesla-p100-for-local-llms).

## What about one 24 GB card?

It won't fit. You have two ways round it, both with trade-offs:

- **Spill onto the CPU.** Ollama does this automatically when a model is too big. Expect speed to drop to a few tokens per second or less. See [CPU offloading explained](/learn/cpu-offloading-explained).
- **Use a smaller quant.** 3-bit and 2-bit versions are much smaller, but quality drops noticeably at those sizes. See [quantization explained](/learn/quantization-explained).

## Leave room for context

45 GB gets the model loaded with a short conversation. A 70B model's memory per token of context is larger than a small model's, so on a 48 GB setup long documents run out of room quickly. If long context matters, plan for more memory than the minimum. See [how much VRAM you need](/learn/how-much-vram-do-you-need).

## Is it the right model to buy for?

Before spending $2,000 on Llama 3.3 70B, consider:

- [Qwen3 32B](/model/qwen3-32b) runs on one 3090, about twice as fast, and is strong at reasoning and code. See [Qwen3 32B vs Llama 3.3 70B](/learn/qwen3-32b-vs-llama-3-3-70b).
- [gpt-oss 120B](/model/gpt-oss-120b) needs more memory but, as a mixture-of-experts model, runs far faster than Llama 3.3 70B where it fits.

If you still want it, it's one command once the hardware is there:

```sh
ollama run llama3.3:70b
```
