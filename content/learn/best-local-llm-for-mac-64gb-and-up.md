---
title: The best local LLM for a Mac with 64 GB, 96 GB or 128 GB+
description: What to run on a Mac Studio or MacBook Pro with 64 GB or more of unified memory, from Qwen3 30B-A3B to Llama 3.3 70B and gpt-oss 120B, with estimated speeds.
track: models
order: 8
date: 2026-10-26
models: qwen3-30b-a3b, llama-3-3-70b, gpt-oss-120b, gemma-3-27b
---
A Mac with lots of unified memory is the easiest way to run really big models in a quiet box on your desk. The rule for picking one: **at this size, mixture-of-experts models beat dense ones by a mile.** They need lots of memory but read only a small part of it per token, which suits a Mac's big-but-slower memory.

## Picks by memory

macOS lets the GPU use about three quarters of memory above 36 GB, so a 64 GB Mac has about 48 GB for models, 96 GB about 72 GB, and 128 GB about 96 GB.

| Memory | Pick | Command | Also fits |
|---|---|---|---|
| 64 GB | [Qwen3 30B-A3B](/model/qwen3-30b-a3b) | `ollama run qwen3:30b` | Llama 3.3 70B, slowly |
| 96 GB | [gpt-oss 120B](/model/gpt-oss-120b) | `ollama run gpt-oss:120b` | Everything else here |
| 128 GB+ | gpt-oss 120B with long context | `ollama run gpt-oss:120b` | Several models loaded at once |

## 64 GB: fast 30B, and 70B if you're patient

**Qwen3 30B-A3B** is the daily driver. It knows about as much as a 30B model but reads only about 3B per token. On an M4 Max we estimate around **96 tok/s**, and on an M1 or M2 Max around 70.

**Llama 3.3 70B** fits, needing about 45 GB of the 48 available. It's strong at writing and general knowledge, but as a dense model it reads all 43 GB per token: about **7 tok/s** on an M4 Max and 5 on an M1 or M2 Max, by our estimates. Usable for a careful answer you're willing to wait for, tiring for chat. It also leaves little room for context.

If you know what you're doing, you can raise the GPU's share of memory for more context (it resets on reboot). This sets 56 GB on a 64 GB Mac:

```sh
sudo sysctl iogpu.wired_limit_mb=57344
```

**gpt-oss 120B** needs about 67 GB and does not fit on a 64 GB Mac.

## 96 GB and up: gpt-oss 120B

This is the reason to buy a big Mac. gpt-oss 120B is OpenAI's largest open model, the strongest reasoning model you can run at home, and good at tool calling and agents. With only about 5.1B of its 117B parameters active per token, it runs far faster than Llama 3.3 70B despite being bigger.

| Chip | Bandwidth | gpt-oss 120B | Llama 3.3 70B | Qwen3 30B-A3B |
|---|---|---|---|---|
| [M2 Max](/gpu/apple-m2-max) or [M3 Max](/gpu/apple-m3-max), 96 GB+ | 400 GB/s | ~48 tok/s | ~5 tok/s | ~70 tok/s |
| [M4 Max](/gpu/apple-m4-max), 128 GB | 546 GB/s | ~66 tok/s | ~7 tok/s | ~96 tok/s |
| [M1 Ultra](/gpu/apple-m1-ultra) or [M2 Ultra](/gpu/apple-m2-ultra), 128 GB+ | 800 GB/s | ~97 tok/s | ~10 tok/s | ~140 tok/s |
| [M3 Ultra](/gpu/apple-m3-ultra), 96 GB+ | 819 GB/s | ~99 tok/s | ~10 tok/s | ~143 tok/s |

All are estimates from our calculator. Bandwidth is what you're paying for in the Ultra chips: about double the Max for generating text.

{{lineup apple-m4-max 128}}

## Other models worth keeping around

- **Gemma 3 27B** for images and screenshots, and for polished writing in many languages. About 18 tok/s on an M4 Max.
- **Qwen3 32B** for careful coding, though on a Mac it's slow (about 15 tok/s on an M4 Max) next to Qwen3 30B-A3B.
- With 128 GB or more, you can keep gpt-oss 120B and a small fast model loaded together.

## The catch: long prompts

Macs are much slower than NVIDIA cards at *reading* a long prompt before they start answering. Chat feels fine. Pasting a 50-page document into gpt-oss 120B can mean a long wait before the first word. If that's your main use, a multi-GPU PC is faster; see [32 GB and up](/learn/best-local-llm-for-32gb-and-up).

## Which Mac to buy

A used Mac Studio with an M1 or M2 Max and 64 GB is our "Quiet" build, about **$1,500 to $2,100** on the [builds page](/builds). It's silent, draws about 100 W, and runs Qwen3 30B-A3B well. If gpt-oss 120B is the goal, skip 64 GB and go straight to 96 GB or more, preferably on an Ultra chip.

For setup and the memory rules in detail, see [Macs for local LLMs](/learn/mac-for-local-llms). For mixture of experts, see [mixture of experts explained](/learn/mixture-of-experts-explained).
