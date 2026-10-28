---
title: "The RTX 5090 for local AI: what 32 GB and 1.8 TB/s get you"
description: How fast the RTX 5090 runs local LLMs, what fits in 32 GB, what doesn't, the power you need, and when a used 3090 or two is the smarter buy.
track: hardware
order: 7
date: 2026-10-26
models: qwen3-32b, qwen3-30b-a3b, gemma-3-27b, llama-3-3-70b
---
The RTX 5090 is the fastest consumer card for local AI. It has **32 GB of memory at about 1,792 GB/s**, nearly double the bandwidth of an RTX 3090 or 4090. That makes it roughly twice as fast at generating text on anything that fits. What it doesn't do is fit 70B models.

## What it runs

{{lineup rtx-5090}}

Those are our calculator's estimates. The highlights:

- **Qwen3 32B at about 49 tok/s.** The strongest dense model that fits on a 24 GB card runs at nearly double a 3090's speed.
- **Gemma 3 27B at about 58 tok/s.**
- **Qwen3 30B-A3B and gpt-oss 20B at around 300 tok/s.**
- **Llama 3.3 70B doesn't fit** at the usual 4-bit size, which needs about 45 GB.

## What 32 GB buys over 24 GB

The extra 8 GB doesn't unlock a new class of model among the ones we track. It mostly buys **room**:

- Longer context on 27B to 32B models. Context memory (the KV cache) grows with every token, and on 24 GB cards a long document can push a 32B model out of memory. See [how much VRAM you need](/learn/how-much-vram-do-you-need).
- Higher-quality quants. A 32B model at a larger quant than 4-bit fits more easily. See [quantization explained](/learn/quantization-explained).
- A second small model alongside the main one, such as an embedding model for document search.

For 70B and up you still need more memory: two 24 GB cards, a 5090 plus another card, or a big-memory Mac.

## How it compares

| | RTX 5090 | RTX 4090 | RTX 3090 |
|---|---|---|---|
| Memory | 32 GB | 24 GB | 24 GB |
| Bandwidth | 1,792 GB/s | 1,008 GB/s | 936 GB/s |
| Qwen3 32B, estimated | ~49 tok/s | ~28 tok/s | ~26 tok/s |
| Rated power | 575 W | 450 W | 350 W |

A used 3090 is $650 to $850 as of October 2026 (see the [builds page](/builds)). Check current prices for the 5090, but it typically costs several times more. For chat, 26 tok/s on Qwen3 32B is already faster than you read, so the 5090's speed matters most when you generate a lot: long code answers, agents that call the model many times, or serving several people.

## Where it shines

- **Image and video generation.** Compute-heavy work benefits from Blackwell's newer tensor cores far more than text does.
- **Long prompts.** Prompt processing is compute-bound, and the 5090 is very fast at it.
- **Newer formats.** Some model files are built for recent NVIDIA architectures, and some model cards list only recent GPUs: NVIDIA's card for Nemotron 3.5 Bolt names just Ada and Blackwell. Older cards can often run the GGUF anyway (we [ran Bolt on P100s](/learn/nemotron-3-5-bolt-74b-on-two-mining-cards)), but a 5090 is on every list.

## Power and fit

- **Power supply: 1,000 W or more of good quality** for a single 5090 in a normal desktop. See [power supplies for multi-GPU](/learn/power-supplies-for-multi-gpu).
- **The power connector.** It uses the 16-pin 12V-2x6 plug. Push it in fully and avoid sharp bends near the connector. Check it after the first few days of heavy use.
- **Size.** Measure your case. Most cards are long and thick.
- **Power capping works.** Text generation is limited by memory, so you can lower the power limit with little loss:

```sh
sudo nvidia-smi -pl 450
```

## Should you buy one?

- **Yes** if you want the fastest single card, do image generation as well as chat, or need 32B models with lots of context.
- **No** if your goal is 70B models: two used 3090s cost less and hold 48 GB. See [RTX 4090 vs two 3090s](/learn/rtx-4090-vs-two-3090s).
- **No** if you're starting out: a [used RTX 3090](/learn/used-rtx-3090-buying-guide) runs the same models at half the speed for a fraction of the price.

All estimates are on the [RTX 5090 page](/gpu/rtx-5090).
