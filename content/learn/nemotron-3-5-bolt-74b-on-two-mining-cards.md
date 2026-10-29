---
kind: post
title: "Nemotron 3.5 Bolt 74B on two 16 GB mining cards: 52 tok/s"
description: NVIDIA's Nemotron 3.5 Bolt 74B-A9B ran at 51.8 tok/s on two unlocked CMP 100-210 mining cards, faster than a 27B on the same pair and 1.85x two Tesla P100s.
date: 2026-10-28
---
**A 74-billion-parameter model ran at 51.8 tokens per second on two 16 GB mining cards.** The model is NVIDIA's Nemotron 3.5 Bolt 74B-A9B. The cards are the same two CMP 100-210s from our [unlock test](/learn/cmp-100-210-unlock-tested), with the model split across their 32 GB by llama.cpp.

```chart
{"type": "stats", "items": [
  {"value": "74B", "label": "parameters, 9B active per token"},
  {"value": "22.0 GB", "label": "model file, about 2.4 bits per weight"},
  {"value": "2× 16 GB", "label": "CMP 100-210 mining cards"},
  {"value": "51.8 tok/s", "label": "a 74B model generating on two 16 GB mining cards", "hi": true}
]}
```

That same pair runs Qwen3.8-27B at 31.4 tok/s. So a model with nearly three times the parameters generated text 65% faster on the same hardware.

Two [Tesla P100s](/gpu/tesla-p100), which we paid about $85 each for, ran the same file at 28.0 tok/s. That's about reading speed, from $170 of used GPUs. And neither card is on NVIDIA's supported list for this model.

```chart
{"type": "bars", "share": true, "title": "Generation speed", "note": "Tokens per second, higher is faster. 128 generated tokens, llama-bench, two runs each.", "unit": "tok/s", "digits": 1, "rows": [
  {"label": "Nemotron 3.5 Bolt 74B", "sub": "2× CMP 100-210, unlocked", "value": 51.8, "hi": true},
  {"label": "Qwen3.8-27B", "sub": "Same 2× CMP 100-210", "value": 31.4},
  {"label": "Nemotron 3.5 Bolt 74B", "sub": "2× Tesla P100", "value": 28.0}
]}
```

## How a 74B model fits in 32 GB of VRAM

Two things make it fit.

- **It's a mixture-of-experts model.** It has 74B parameters in total, but only about 9B are used for each token. Bolt mixes Mamba-2 and Transformer layers, with the experts on top. See [mixture of experts explained](/learn/mixture-of-experts-explained).
- **NVIDIA ships it at about 2 bits per weight.** According to NVIDIA's model card, the experts use llama.cpp's 2-bit IQ2_XXS format and were trained with that in mind. The Mamba layers are NVFP4, and the embedding and output layers are Q8_0. The whole file is 22.0 GB, about 2.4 bits per weight on average. More on formats in [quantization explained](/learn/quantization-explained).

At 16 bits, the same weights would need about 148 GB:

```chart
{"type": "cards", "title": "How many 16 GB cards the weights need", "note": "Each box is one 16 GB card. Weights only, before any room for context.", "per": 16, "rows": [
  {"label": "At 16 bits", "value": 148, "text": "About 148 GB"},
  {"label": "At 8 bits", "value": 74, "text": "About 74 GB"},
  {"label": "NVIDIA's 2-bit file", "value": 22, "text": "22.0 GB", "hi": true}
]}
```

Two cards give 32 GB, so the 22 GB file fits with room left for context. We split it across both cards by layer. NVIDIA's quick-start guide suggests 32 GB or more of GPU memory for this file, so two 16 GB cards are right at that line.

## The results: CMP 100-210 vs Tesla P100

Same file, same llama.cpp binary, same settings on both pairs. Tokens per second:

| Test | 2× CMP 100-210, unlocked | 2× Tesla P100 | CMP ahead by |
|---|---|---|---|
| Prompt, 512 tokens | 333.9 | 192.6 | 1.73x |
| Prompt, 2,048 tokens | 333.5 | 286.3 | 1.17x |
| Prompt, 8,192 tokens | 329.9 | 320.5 | 1.03x |
| Generation, 128 tokens | **51.8** | 28.0 | **1.85x** |

**Generation is where the CMPs win.** They wrote text 1.85 times as fast as the P100s.

**On prompts, the P100s nearly catch up as prompts get longer.** The CMPs read prompts at about 330 tok/s whatever the length. The P100s start at 193 and climb to 321 by 8,192 tokens:

```chart
{"type": "lines", "title": "Prompt speed by prompt length", "note": "Tokens per second, higher is faster. At 8,192 tokens the two pairs are within 3%.", "unit": "tok/s", "digits": 1, "x": ["512", "2,048", "8,192"], "xTitle": "Prompt length in tokens", "series": [
  {"name": "2× CMP 100-210, unlocked", "short": "CMP", "values": [333.9, 333.5, 329.9]},
  {"name": "2× Tesla P100", "short": "P100", "values": [192.6, 286.3, 320.5]}
]}
```

So on long documents the two pairs are close. More on the two speeds in [prompt processing vs generation speed](/learn/prompt-processing-vs-generation-speed).

## Bigger model, faster than the 27B

These are the same two unlocked CMP cards running each model. Tokens per second:

| Test | Qwen3.8-27B, UD-Q4_K_M (16.5 GB) | Nemotron 3.5 Bolt 74B-A9B (22.0 GB) |
|---|---|---|
| Prompt, 512 tokens | 674.1 | 333.9 |
| Prompt, 2,048 tokens | 849.8 | 333.5 |
| Prompt, 8,192 tokens | 867.8 | 329.9 |
| Generation, 128 tokens | 31.4 | **51.8** |

Generation speed mostly depends on how much of the model the card has to read for each token (see [why memory bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed)). The 27B is dense, so it reads all 27B weights for every token. Bolt reads about 9B, at about half the bits each.

On paper, that's about six times less to read per token, but Bolt was 1.65 times faster, not six. So something else is slowing it down on these cards, probably the work of unpacking 2-bit weights. We haven't profiled it.

Prompts go the other way. Bolt read prompts at 40 to 50% of the 27B's speed. If you mostly chat, Bolt is the faster model on these cards. If you paste in long documents, the 27B gets through them quicker.

## It runs on cards NVIDIA doesn't list

NVIDIA's model card for this file lists two GPU generations: Ada Lovelace and Blackwell. Neither of ours is on it. The Tesla P100 is Pascal, from 2016, and the CMP 100-210 is Volta, a generation later.

Both ran it with llama.cpp built for their chips (sm_60 and sm_70), and neither logged a GPU error. So you don't need an RTX 40- or 50-series card to run Bolt, as long as you use llama.cpp and the GGUF file. See [GGUF vs safetensors vs MLX](/learn/gguf-vs-safetensors-vs-mlx) for why the file format decides which GPUs work.

Two limits on that. We measured speed, not answers, so we haven't checked that output on these older cards matches a newer card's. And Bolt also reads images and video through a separate vision file, which we didn't load, so this was text only.

## Why the CMPs beat the P100s

The CMP 100-210 uses the same GV100 chip as the [Tesla V100](/gpu/tesla-v100). The P100 is a generation older, and two things count against it here:

- **No tensor cores.** The unlocked CMPs have theirs back, and reading prompts is the matrix math that tensor cores speed up.
- **No fast path for this format.** The P100's chip lacks an 8-bit dot-product instruction (`dp4a`) that llama.cpp's quantized kernels use on newer cards. Without it, the P100 runs IQ2_XXS on a slower fallback. That's the most likely reason for the gap in generation. We only tested this one file, so a different format might narrow it.

## Power and heat

We sampled every 500 ms with `nvidia-smi` while each card was at least half busy:

```chart
{"type": "bars", "title": "Average power per card while busy", "note": "Watts, lower is better. Sampled every 500 ms while each card was at least half busy.", "unit": "W", "digits": 0, "rows": [
  {"label": "2× CMP 100-210, unlocked", "sub": "51.8 tok/s generation", "value": 93.4, "hi": true},
  {"label": "2× Tesla P100", "sub": "28.0 tok/s generation", "value": 149.0}
]}
```

| | Avg per card | Peak per card | Hottest card |
|---|---|---|---|
| 2× CMP 100-210, unlocked | 88 to 99 W | 170 to 181 W | 51 °C |
| 2× Tesla P100 | 144 to 154 W | 176 to 191 W | 61 °C |

The CMPs were faster and drew about 37% less power per card on average. Neither pair logged a GPU error (Xid). More on watts and running costs in [power and heat of local AI](/learn/power-and-heat-of-local-ai).

## The setup

| Part | CMP pair | P100 pair |
|---|---|---|
| Server | Dell DSS 8440, 2× Xeon Gold 6226 | Dell DSS 8440, 2× Xeon Silver 4114 |
| Cards | 2× CMP 100-210 16 GB, stock VBIOS 88.00.9D.00.00 | 2× Tesla P100 PCIe 16 GB, VBIOS 86.00.41.00.06 |
| Mods | Unlocked with [cmp100-unlock](https://github.com/mintoriakamoto/cmp100-unlock) `8abaad2f` | None |
| PCIe link | Gen2 x1 | Gen3 x8 and Gen3 x4 |
| Power limit | 250 W | 250 W |
| Driver | NVIDIA 580.196.07 | NVIDIA 580.178.04 |
| Kernel | 7.0.2 | 7.0.14 |

Both pairs shared the rest:

| Part | What we used |
|---|---|
| OS | Proxmox VE (Debian 13) |
| CUDA | 12.9.1 |
| Engine | llama.cpp `52202132`, built once for both chips (sm_60 and sm_70) and copied to both servers |
| Model | `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF` revision `e0fecb69`, SHA-256 checked |
| Benchmark | `llama-bench -ngl 99 -sm layer -fa 1 -p 512,2048,8192 -n 128 -r 2` |

Before the run we checked that the unlock was still active. Both CMPs measured 36.8-cycle tensor latency and 73.7 to 73.8 TFLOP/s of FP16, the same as in our [unlock test](/learn/cmp-100-210-unlock-tested).

That's `llama-bench`, not our [benchmark prompt](/learn/how-we-benchmark), so compare these numbers with each other, not with results from that.

## Before you read too much into it

- **It's a short run.** Each test ran twice. This isn't a full suite.
- **The two pairs didn't run at the same time.** We started both in the same second, but the P100 server had four llama.cpp servers running on its CPU, using about 9 of its 40 threads. The P100s' 512-token prompt speed came back at 153.3 tok/s. We stopped those servers and reran 45 minutes later, and got 192.6. Generation barely moved (27.9 to 28.0). The tables use the rerun. If your short-prompt speed looks low, check what else your CPU is doing.
- **Different servers.** The CPUs and driver builds differ. The llama.cpp binary, model file and settings were identical.
- **The P100s weren't in full-width slots.** One ran at x8 and one at x4, not x16.
- **We didn't test Bolt on stock CMPs.** On the 27B, the unlock made prompts 6x faster and generation 10% faster, so we'd expect locked cards to lose most of their prompt speed here and keep most of their generation speed.
- **We measured speed only.** Prompts went up to 8,192 tokens, with 128 tokens generated. We haven't tested answer quality at 2 bits or speed at long context. Bolt supports up to 256K tokens.
- **We used the default f16 KV cache.** NVIDIA recommends q8_0, which uses less memory per token of context.
- **The 27B numbers come from our unlock test.** They used an older llama.cpp build (`19cce691`) and one pass each.

New to these cards? Start with [mining cards for AI](/learn/mining-cards-for-ai) or [the Tesla P100 for local LLMs](/learn/tesla-p100-for-local-llms). Running Bolt on your own hardware? [Send us your numbers](/learn/posts#share).
