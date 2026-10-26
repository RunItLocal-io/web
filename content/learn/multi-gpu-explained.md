---
title: "Two GPUs for local LLMs: layer split vs tensor parallel explained"
description: What a second GPU gets you, why two cards usually run at one card's speed, when tensor parallel is faster, and what we measured on two-card rigs.
track: basics
order: 10
date: 2026-10-26
models: llama-3-3-70b, qwen3-32b, qwen3-30b-a3b
---
**A second GPU mostly buys you memory, not speed.** With the default setup, two 24 GB cards act like one 48 GB card running at about one card's speed. That's still a big deal: it's how people run 70B models at home. If you want the extra speed too, you need tensor parallel, which takes more effort.

## Layer split: the default

The model's layers are divided between the cards. Card one holds, say, the first half; card two the second half. Each token goes through card one, then card two, in turn.

- **Memory adds up.** Two 24 GB cards hold a 43 GB model.
- **Speed doesn't.** Only one card works at a time, so you get roughly one card's speed, minus a little for the hand-off.
- **Cards don't have to match.** You can mix a 24 GB and a 12 GB card, or different generations. The slower card sets more of the pace.
- **It's what you get for free.** llama.cpp, Ollama and LM Studio all do this automatically when a model doesn't fit on one card.

In llama.cpp it's `--split-mode layer`, the default, and `--tensor-split` sets how much goes on each card, for example `--tensor-split 24,12` for a 24 GB and a 12 GB card.

## Tensor parallel: both cards on every token

Instead of splitting by layers, every layer is split across both cards, and they work on each token at the same time, swapping results after each step.

- **Faster.** Both cards' bandwidth is used at once, so decode speed can go well beyond one card.
- **Needs matching cards,** usually in pairs or groups of four.
- **Needs more talking between cards.** Results are swapped many times per token, so the PCIe link between them matters far more than with layer split. See [does PCIe bandwidth matter](/learn/does-pcie-bandwidth-matter-for-llms).
- **Needs server software.** vLLM is the usual choice (`--tensor-parallel-size 2`). It wants recent NVIDIA cards and safetensors-style files, not GGUF. llama.cpp has a `--split-mode row` option along similar lines, with mixed results.

For one person chatting, layer split is fine. Tensor parallel earns its setup cost when you serve several people or want the most speed from a big dense model. See [vLLM for a team](/learn/vllm-for-a-team).

## What two cards get you

Two RTX 3090s, layer split, from our calculator (one card's bandwidth, 48 GB of memory):

{{lineup rtx-3090 48}}

[Llama 3.3 70B](/model/llama-3-3-70b) goes from "doesn't fit" to about **12 tok/s** (estimate). Everything that already fit on one card runs at the same speed as before. That's the layer-split trade in one table.

## What we measured

On our rack of 90 used GPUs, two-card setups running Qwen3.6-35B-A3B, a 35B mixture-of-experts model, measured:

| Rig | Generation speed, measured |
|---|---|
| 2× Tesla P100 (16 GB each, 2016) | 53 tok/s |
| 2× RTX A4500 (20 GB each) | 110 tok/s |

Neither card could hold the model alone with room for context. Two of them can, and both run it comfortably faster than you can read.

## The other way to use two cards

If your model fits on one card, you can run **two copies**, one per card, and send different requests to each. For one person that's no faster. For a household, a team or a batch job it doubles throughput. Our "rack in a box" build, ten P100s in a Dell DSS 8440, measured **498 tok/s across 5 lanes** this way. Details on the [builds page](/builds).

To pin a program to one card on NVIDIA, set `CUDA_VISIBLE_DEVICES` (for example `CUDA_VISIBLE_DEVICES=1`) before starting it.

## What a second card costs you

- **Power and heat.** Our 2× RTX 3090 build draws about 750 W under load and wants a 1,200 W supply and a dedicated circuit. See [power and heat of local AI](/learn/power-and-heat-of-local-ai).
- **Space.** Two thick cards need real spacing, riser cables or an open frame.
- **Slots.** You need a board with two usable slots. They don't both need x16 for layer split.

The 2× 3090 "Serious" build is about $1,900 to $2,500 used, with a full parts list on the [builds page](/builds). For one fast card versus two, see [RTX 4090 vs two 3090s](/learn/rtx-4090-vs-two-3090s).
