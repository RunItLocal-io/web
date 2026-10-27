---
title: "Mining cards for AI: do NVIDIA CMP cards run local LLMs?"
description: Can ex-mining NVIDIA CMP cards run local AI? What works, the limits to check before buying, and what we learned running them in our 90-GPU rack.
track: hardware
order: 13
date: 2026-10-26
models: qwen3-4b, qwen3-8b, qwen3-30b-a3b
---
**Yes, NVIDIA CMP mining cards can run local LLMs.** We run them in our rack alongside Tesla P100s and RTX A4500s. But they were built for one job, mining, and NVIDIA cut them down in ways that matter. They're a project for tinkerers who find them cheap, not a first card.

There are two kinds of "mining card", and they're very different buys.

## Ex-mining gaming cards

These are ordinary GeForce cards, like the RTX 3090, that spent time in a mining rig. They're full cards with display outputs and full driver support. Mining ran them at steady, lowered power, which is gentle on the chip. The usual problems are dried-out thermal pads and worn fans, both fixable.

Treat them like any used card: test before you pay and price in new pads or fans. See the [used RTX 3090 buying guide](/learn/used-rtx-3090-buying-guide) and [how to check a used GPU](/learn/how-to-check-a-used-gpu).

## NVIDIA CMP cards

The CMP HX series was made for mining only. Compared to gaming cards from the same era:

- **No display outputs.** You need another GPU or the CPU's graphics for a monitor.
- **Small memory.** Most models have somewhere between 6 and 10 GB. Check the exact card's spec before you buy.
- **A cut-down PCIe connection on many models.** This mostly affects how fast a model loads onto the card, less so how fast it generates once loaded. See [does PCIe bandwidth matter](/learn/does-pcie-bandwidth-matter-for-llms).
- **Other limits vary by model.** NVIDIA restricted some features differently on each card. Look up the specific model, and real results from people running AI on it, before buying.

Our calculator doesn't cover CMP cards yet. If you run one, [send us your measured numbers](/learn/posts#share).

## What works

- **llama.cpp-based tools** like Ollama and LM Studio, with the NVIDIA driver on Linux.
- **Small models on one card.** With 6 to 10 GB, think [Qwen3 4B](/model/qwen3-4b) and [Qwen3 8B](/model/qwen3-8b). See [the best local LLM for 8 GB](/learn/best-local-llm-for-8gb-vram).
- **Bigger models across several cards.** Layer splitting pools memory across cards. Mixture-of-experts models suit this well: a model like [Qwen3 30B-A3B](/model/qwen3-30b-a3b) only reads a few billion weights per token. See [multi-GPU explained](/learn/multi-gpu-explained).
- **Serving lots of small jobs.** Many cheap cards, each running its own small model, can handle a lot of parallel work.

## What we learned on our rack

Our rack is 90 used GPUs: Tesla P100s, RTX A4500s and ex-mining NVIDIA CMP cards. Together they ran **a billion tokens of Qwen3.6-35B-A3B in 2.9 days**, and power came to about **6 to 8 cents per million tokens**. The CMP cards were part of that run.

The speed numbers we quote come from the other cards: two P100s run that model at 53 tok/s, and two RTX A4500s, which won every speed test, at 110 tok/s. Both are measured. If you only want one fast machine, those are better places to start.

## Before you buy

1. **Look up the exact model.** Memory, bandwidth and restrictions differ between CMP cards.
2. **Plan for cooling and power.** Many mining cards were built for open frames with lots of airflow. See [power supplies for multi-GPU](/learn/power-supplies-for-multi-gpu).
3. **Use Linux.** It's the most common and best-documented setup for these cards.
4. **Price against the alternatives.** A [Tesla P100](/learn/tesla-p100-for-local-llms) has 16 GB of fast memory, and we paid about $85 each. A CMP card has to be clearly cheaper to make sense.
5. **Budget for a host.** Several cards need a board with enough slots or risers, like the [used workstation builds](/learn/used-workstation-builds).

Want the full rack story? Read [the 90-GPU rack: what we learned](/learn/the-90-gpu-rack).
