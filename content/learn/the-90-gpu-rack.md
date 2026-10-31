---
title: "The 90-GPU rack: what we learned running a billion tokens on used cards"
description: A lab note from our rack of 90 used GPUs. What it's made of, what we measured, what it cost to power, and the lessons for anyone building with used cards.
track: hardware
order: 20
date: 2026-10-26
models: qwen3-30b-a3b
---
We run a rack of **90 used GPUs**: Tesla P100s, RTX A4500s and ex-mining NVIDIA CMP cards. None of them are new, and the oldest are 2016 data-center cards. Together they ran **a billion tokens of Qwen3.6-35B-A3B in 2.9 days**. This note covers what we measured and the lessons we'd pass on.

## What we measured

| Result | Number |
|---|---|
| Tokens generated | 1 billion |
| Time | 2.9 days |
| Average across the rack | About 4,000 tok/s |
| 2× Tesla P100 | 53 tok/s |
| 2× RTX A4500 | 110 tok/s |
| Dell DSS 8440 with 10× P100 | 498 tok/s across 5 lanes |
| Power cost | About 6 to 8 cents per million tokens |

The rack average is simple arithmetic: a billion tokens over 2.9 days. At 6 to 8 cents per million tokens, the whole billion cost roughly **$60 to $80 in power**.

Two things stood out:

- **The 2016 P100s never throttled** through the run.
- **The RTX A4500s won every speed test while sitting on their power cap.**

## What the rack is made of

- **Tesla P100 16 GB.** 2016 data-center cards with fast HBM2 memory and no fans. We paid about $85 each.
- **RTX A4500 20 GB.** Workstation cards with their own blower fans.
- **NVIDIA CMP cards.** Ex-mining cards with no display outputs. See [mining cards for AI](/learn/mining-cards-for-ai).

Part of it is a Dell DSS 8440 GPU server with ten P100s, our "rack in a box" build. Its parts list on the [builds page](/builds): the server ($1,500 to $3,000), ten P100s ($850 to $1,200) and ten 14-pin to EPS 8-pin power cables ($100 to $200). It draws about 2 kW under load and is loud: plan a rack, power and cooling before buying one.

## Lessons for your own build

These are general lessons, framed as advice for anyone building with used cards.

**1. Buy bandwidth, not compute.** Generating text is limited by how fast a card reads its memory. That's why a 2016 card with HBM2 is still useful. See [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed).

**2. Mixture-of-experts models suit old cards.** Qwen3.6-35B-A3B reads only about 3B weights per token, so cheap cards run it at useful speed if they have the memory to hold it. See [mixture of experts explained](/learn/mixture-of-experts-explained).

**3. More cards add capacity and throughput, not single-user speed.** Splitting one model across two cards gives you their combined memory at roughly one card's speed. To serve more work, run more copies, or "lanes", side by side. See [multi-GPU explained](/learn/multi-gpu-explained).

**4. Cap power.** Since text generation is limited by memory, a power cap costs little speed and saves heat, noise and money. See [power supplies for multi-GPU](/learn/power-supplies-for-multi-gpu).

**5. Cooling decides whether old cards last.** Passive cards need air forced through them. Get that right and old cards can run continuous work. See [cooling passive data-center cards](/learn/cooling-passive-data-center-cards).

**6. Check software support per architecture.** Older cards work with llama.cpp-based tools but not with every server engine, and newer model releases sometimes target newer cards only. Check before you buy.

**7. Treat estimates as a ceiling and measure.** Our calculator puts two P100s at about 128 tok/s on the similar Qwen3 30B-A3B; we measured 53 tok/s on Qwen3.6-35B-A3B. Estimates are useful for comparing cards, but your own measurement is the real number.

{{lineup tesla-p100 32}}

## What's next

First off the queue: **NVIDIA Nemotron 3.5 Bolt**, a 74B mixture-of-experts model with 9B active parameters, trained to run at 2-bit, about 24 GB, with vision built in. Its model card lists only Ada and Blackwell GPUs, but llama.cpp ran its GGUF on two of our P100s at 28.0 tok/s and on two unlocked CMP 100-210s at 51.8 tok/s. [Full results](/learn/nemotron-3-5-bolt-74b-on-two-mining-cards).

## Build a small version

You don't need 90 cards. Two P100s in a used workstation are our "Best value" build at $450 to $650, and two P100s are what measured 53 tok/s on our rack. Start with the [Tesla P100 guide](/learn/tesla-p100-for-local-llms) and [used workstation builds](/learn/used-workstation-builds), and [send us your own results](/articles#share).
