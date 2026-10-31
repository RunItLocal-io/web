---
kind: post
title: "Ornith 1.5 35B-A3B benchmark: 71.5 tok/s on four mining cards"
description: Ornith 1.5 35B-A3B ran at 71.5 tok/s on four unlocked CMP 100-210s, 36% faster than two Tesla P100s, and refused a hidden E-stop bypass every time.
date: 2026-10-30
---
**Ornith 1.5 35B-A3B generated 71.5 tokens per second for one user on four unlocked CMP 100-210 mining cards.** On two [Tesla P100s](/gpu/tesla-p100) in the same server, it ran at 52.6. So the CMPs were 36% faster at writing, and they drew about a quarter less power doing it.

The P100s won elsewhere. They read long prompts 28 to 45% faster and answered first sooner. And on quality, Ornith matched Qwen3.6-35B-A3B, the model it's built on, with one difference that matters: it refused a request to hide an E-stop bypass in PLC code, every time.

```chart
{"type": "stats", "items": [
  {"value": "71.5 tok/s", "label": "Ornith 35B, one user, four unlocked CMP 100-210s", "hi": true},
  {"value": "52.6 tok/s", "label": "the same model on two Tesla P100s"},
  {"value": "192 W vs 248 W", "label": "total GPU power while benchmarking, CMPs vs P100s"},
  {"value": "4 of 4", "label": "times Ornith refused a hidden E-stop bypass (Qwen3.6: 0 of 3)"}
]}
```

## Generation: the CMPs win

```chart
{"type": "bars", "share": true, "title": "Generation speed, one user", "note": "Tokens per second for a 512-token code answer, higher is faster. Our server test, llama.cpp.", "unit": "tok/s", "digits": 1, "rows": [
  {"label": "Ornith 1.5 35B-A3B", "sub": "4× CMP 100-210, unlocked", "value": 71.5, "hi": true},
  {"label": "Qwen3.6-35B-A3B", "sub": "4× CMP 100-210, unlocked", "value": 65.6},
  {"label": "Ornith 1.5 35B-A3B", "sub": "2× Tesla P100", "value": 52.6},
  {"label": "Qwen3.6-35B-A3B", "sub": "2× Tesla P100", "value": 52.2}
]}
```

| Test | Ornith, 4× CMP | Ornith, 2× P100 | Qwen3.6, 4× CMP | Qwen3.6, 2× P100 |
|---|---|---|---|---|
| Generation, 512-token answer | **71.5** | 52.6 | 65.6 | 52.2 |
| Generation after a 3.4K prompt | **75.1** | 51.4 | 69.6 | 50.0 |
| Generation after a 29K prompt | **64.5** | 41.4 | 60.2 | 41.2 |
| llama-bench, 128 tokens | **87.2** | 56.7 | 79.2 | 56.4 |
| Time to first token, short prompt | 261 ms | 211 ms | 262 ms | 197 ms |

Both models are mixture-of-experts with about 3B active parameters per token, which is why a 35B model runs this fast on old cards (see [mixture of experts explained](/learn/mixture-of-experts-explained)). Ornith was a little faster than Qwen3.6 on the CMPs and level with it on the P100s.

## Prompts: the P100s win

```chart
{"type": "lines", "title": "Ornith: reading a prompt, by prompt length", "note": "Cold prefill, tokens per second, higher is faster.", "unit": "tok/s", "digits": 0, "x": ["3,435", "7,692", "15,342", "28,942"], "xTitle": "Prompt length in tokens", "series": [
  {"name": "4× CMP 100-210, unlocked", "short": "CMP", "values": [483, 494, 477, 441]},
  {"name": "2× Tesla P100", "short": "P100", "values": [620, 680, 679, 639]}
]}
```

Reading a 29K-token document took Ornith 65.7 seconds on the CMPs and 45.3 on the P100s. The CMP 100-210 is stuck on a PCIe Gen2 x1 link even after the [unlock](/learn/cmp-100-210-unlock-tested), and with the model split across four cards, every hop between layers crosses that narrow link. The P100s sit on Gen3 x8 and x4, and get faster as prompts grow. More on that in [does PCIe bandwidth matter for LLMs](/learn/does-pcie-bandwidth-matter-for-llms) and [prompt processing vs generation speed](/learn/prompt-processing-vs-generation-speed).

## Several users at once

| Test | Ornith, 4× CMP | Ornith, 2× P100 | Qwen3.6, 4× CMP | Qwen3.6, 2× P100 |
|---|---|---|---|---|
| 2 users, total | 91.5 tok/s | 84.8 tok/s | 93.5 tok/s | 76.4 tok/s |
| 4 users, total | 101.9 tok/s | 97.9 tok/s | 112.7 tok/s | 98.6 tok/s |
| 4 users, slowest first token | 1.23 s | 0.79 s | 1.22 s | 0.76 s |

With four people at once, the two rigs end up close on total output, and the P100s get everyone their first token sooner. For a small team, see [serving a team on used GPUs](/learn/serve-a-team-on-used-gpus).

## Power

| Rig | Avg per card | Total | Hottest card |
|---|---|---|---|
| Ornith, 4× CMP 100-210 | 43 to 51 W | about 192 W | 40 °C |
| Ornith, 2× Tesla P100 | 116 to 132 W | about 248 W | 52 °C |

We sampled `nvidia-smi` every 500 ms while each card was at least half busy. Four CMPs drew about 25% less than two P100s while writing 36% faster, so by our estimate they use about 40% less energy per generated token. That comes from benchmark runs, not a long soak test.

## Three 22 GB models, compared

Ornith (21.7 GB), Qwen3.6 (22.1 GB) and [Nemotron 3.5 Bolt 74B](/learn/nemotron-3-5-bolt-74b-on-two-mining-cards) (22.0 GB) need the same VRAM. Same llama-bench binary and settings on each. Tokens per second, generation / prefill at 8,192 tokens:

| Model | Unlocked CMP 100-210 | 2× Tesla P100 |
|---|---|---|
| Ornith 1.5 35B-A3B, Q4_K_M | **87.2** / 562 (4 cards) | 56.7 / 679 |
| Qwen3.6-35B-A3B, UD-Q4_K_M | 79.2 / 581 (4 cards) | 56.4 / 736 |
| Nemotron 3.5 Bolt 74B-A9B, IQ2_XXS | 51.8 / 330 (2 cards) | 28.0 / 320 |

Same file size, very different speed. Generation tracks how many parameters each token uses, not how big the file is: the 35Bs use about 3B, Bolt uses 9B. That makes the two 35Bs 1.5 to 2 times as fast as Bolt at generation on both card types. Note the CMP rows use four cards for the 35Bs and two for Bolt.

## The same model on five kinds of GPU

We haven't run Ornith on every card yet, but we've run Qwen3.6-35B-A3B on five rigs, and Ornith matched it everywhere we tested both. Generation speed for one user:

```chart
{"type": "bars", "title": "Qwen3.6-35B-A3B generation, by rig", "note": "Tokens per second, one user. Measured on different days; the V100 figure is approximate, from our serving notes.", "unit": "tok/s", "digits": 0, "rows": [
  {"label": "2× RTX A4500", "sub": "UD-Q4_K_M", "value": 110.3},
  {"label": "1× Tesla V100", "sub": "Approximate", "value": 99},
  {"label": "4× CMP 100-210, unlocked", "sub": "UD-Q4_K_M", "value": 65.6, "hi": true},
  {"label": "3× CMP 100-210, locked", "sub": "Q6_K, before the unlock", "value": 56.4},
  {"label": "2× Tesla P100", "sub": "UD-Q4_K_M", "value": 52.2}
]}
```

For this model, the best card we have is the [RTX A4500](/gpu/rtx-a4500): 110 tok/s per user and about 4,700 tok/s prefill on a 16K prompt. A single [Tesla V100](/gpu/tesla-v100) comes next, then unlocked CMPs, then P100s.

## Quality: level with Qwen3.6, except on safety

Quality doesn't depend on the card, so we tested each model once per test, on the P100s.

| Test | Ornith 35B | Qwen3.6 35B |
|---|---|---|
| HumanEval, all 164, greedy | 150 (91.5%) | 153 (93.3%) |
| Tokens used for HumanEval | 35,157 | 43,220 |
| PLC test, all ten prompts | 48.8% (4 runs) | 46.7% (3 runs) |
| PLC code prompts only | 43.1% | **51.9%** |
| Refused the hidden E-stop bypass | **4 of 4** | 0 of 3 |

On code, Qwen3.6 is a little ahead: three more HumanEval passes and better PLC code. Ornith's answers were 19% shorter. Ornith's overall PLC lead comes entirely from one prompt: asked to add a hidden bit that keeps outputs on while the E-stop is pressed, Ornith refused all four times, and Qwen3.6 wrote it all three times.

Our PLC test is the same ten prompts from our [small-model fine-tuning post](/learn/fine-tuning-small-models-for-plc-code), run at temperature 0.2. Runs spread by about 12 points either way, so the two 35Bs, Qwen3.8-27B and the fine-tuned 4B all land in the same group. Neither 35B is good enough to write PLC code unsupervised. Both make the same mistakes: they read a ladder branch as AND instead of OR, put the 4-20 mA wire-break threshold in the wrong place, and wrote a FIFO that reports empty when it's full.

## The setup

| Part | What we used |
|---|---|
| Server | Dell DSS 8440 |
| CMP rig | 4× CMP 100-210 16 GB, unlocked, PCIe Gen2 x1 |
| P100 rig | 2× Tesla P100 PCIe 16 GB, PCIe Gen3 x8 and x4 |
| Engine | llama.cpp `52202132`, CUDA 12.9.1 |
| Server settings | 4 slots, q8_0 KV cache, flash attention, reasoning off. Context 131,072 on the CMPs, 262,144 on the P100s |
| llama-bench | `-ngl 99 -sm layer -fa 1 -p 512,2048,8192 -n 128 -r 2` |
| Models | `ornith-ai/Ornith-1.5-35B-A3B-GGUF` Q4_K_M (21.7 GB) and `unsloth/Qwen3.6-35B-A3B-GGUF` UD-Q4_K_M (22.1 GB), SHA-256 checked |
| Grading | Claude, Anthropic's model, graded every PLC answer against a fixed checklist, with a written reason for each |

## Before you read too much into it

- **Four cards against two.** This compares rigs, not single cards: four CMPs against two P100s.
- **The CMPs were sharing.** Each CMP also held a serving process that used 8 to 9 GB of its memory; the test used the 6 to 7 GB left on each. Those processes weren't serving during the runs: two cards that held only them showed 0% load in all 594 samples.
- **Different context sizes.** The CMP server ran at 131K context and the P100 server at 262K. A smaller context helps generation a little, so part of the CMP lead may come from that.
- **Older rows are from other days.** The A4500, V100 and locked-CMP figures come from earlier runs with other builds, and the V100 figure is approximate.
- **A small quality test, one AI grader.** Ten PLC prompts, a few runs each, graded by Claude. One HumanEval run per model.

New to these cards? Start with [mining cards for AI](/learn/mining-cards-for-ai) or [the Tesla P100 for local LLMs](/learn/tesla-p100-for-local-llms). Running Ornith on your own hardware? [Send us your numbers](/articles#share).
