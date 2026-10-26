---
title: The best local LLM for 32 GB, 48 GB and more (multi-GPU included)
description: What to run with 32 GB, 48 GB or 64 GB+ of GPU memory, from an RTX 5090 to two 3090s to a server full of P100s. Picks, estimated speeds and our rack data.
track: models
order: 6
date: 2026-10-26
models: qwen3-32b, qwen3-30b-a3b, llama-3-3-70b, gpt-oss-120b
---
Past 24 GB, the question changes. It's no longer "what fits?" but "which big model is worth the hardware?" Here's what each step up buys you, whether it's one big card or several used ones.

## The short answer

| GPU memory | Pick | Command | Example hardware |
|---|---|---|---|
| 32 GB | [Qwen3 32B](/model/qwen3-32b) with long context | `ollama run qwen3:32b` | RTX 5090, two Tesla P100s |
| 48 GB | [Llama 3.3 70B](/model/llama-3-3-70b) | `ollama run llama3.3:70b` | Two RTX 3090s, RTX A6000 |
| 72 GB+ | [gpt-oss 120B](/model/gpt-oss-120b) | `ollama run gpt-oss:120b` | Three or more 24 GB cards, a P100 server |

## 32 GB: the 30B class with room to breathe

32 GB doesn't unlock a new class of model on our list. The next one up, Llama 3.3 70B, needs about 45 GB. What 32 GB gives you is the 30B class with lots of context: **Qwen3 32B** for careful work, **Qwen3 30B-A3B** for speed, and **Gemma 3 27B** for images, all with room for long documents.

Two very different ways to get there:

- **RTX 5090.** One card, 1,792 GB/s. We estimate about **49 tok/s** on Qwen3 32B and over 300 on Qwen3 30B-A3B. Fast and simple, and expensive.
- **Two used Tesla P100s.** 32 GB of HBM2 for about **$450 to $650** all in, our "Best value" build. On our rack this pair measured **53 tok/s on Qwen3.6-35B-A3B**, a 35B mixture-of-experts model split across both cards. See the [Tesla P100 guide](/learn/tesla-p100-for-local-llms).

## 48 GB: 70B models

48 GB is where **Llama 3.3 70B** fits at 4-bit, with a few gigabytes for context. It's Meta's big model, strong at general knowledge, writing and following detailed instructions.

{{lineup rtx-3090 48}}

That's two 3090s' worth of memory at one 3090's bandwidth, which is roughly how a two-card setup behaves. About **12 tok/s** on Llama 3.3 70B is usable, not fast. Our "Serious" build is a workstation with two used RTX 3090s for about **$1,900 to $2,500**. It needs a 1,200 W supply, real spacing between the cards, and ideally its own circuit. A single [RTX A6000](/gpu/rtx-a6000) also has 48 GB, at about 10 tok/s estimated on the same model, in one quieter card.

## 72 GB and up: gpt-oss 120B

**gpt-oss 120B** needs about 67 GB to load. Once loaded it's quick, because only about 5.1B of its 117B parameters work on each token. It's the strongest reasoning model you can run at home and is good at tool calling and agents.

The cheapest way to that much memory is a stack of used data-center cards. Our "rack in a box" is a Dell DSS 8440 server with ten Tesla P100s: **160 GB of GPU memory for about $2,500 to $4,000**. Our calculator estimates about **88 tok/s** for gpt-oss 120B on it. Split into five lanes serving requests in parallel, one of these on our rack measured **498 tok/s in total**. It draws about 2 kW and is loud, so it needs a rack, power and cooling.

## How multi-GPU actually behaves

- **Memory adds up, speed doesn't.** Tools like Ollama and llama.cpp split a model's layers across cards. Each token passes through the cards in turn, so you get roughly one card's speed with all cards' memory.
- **Expect less than the estimate.** Our two-P100 measurement on a 35B MoE came in below what a single-card estimate suggests. Splitting adds overhead.
- **Mix with care.** Different cards work together, but the slowest one sets the pace.
- **Serving many users is where it shines.** Running several copies, or batching requests, is how our 90-GPU rack ran a billion tokens of Qwen3.6-35B-A3B in 2.9 days for about 6 to 8 cents of power per million tokens.

More on layer split versus tensor parallel in [multi-GPU explained](/learn/multi-gpu-explained).

## Is the jump worth it?

For most people, a single 24 GB card and Qwen3 30B-A3B or Qwen3 32B covers nearly everything. See [the best local LLM for 24 GB](/learn/best-local-llm-for-24gb-vram). Go bigger when you want 70B-class knowledge and writing, the strongest local reasoning from gpt-oss 120B, or to serve a team.

If you'd rather have a silent box than a hot one, a Mac with 64 GB or more runs the same big models more slowly: see [the best local LLM for a 64 GB+ Mac](/learn/best-local-llm-for-mac-64gb-and-up). Full parts lists for every build are on the [builds page](/builds).
