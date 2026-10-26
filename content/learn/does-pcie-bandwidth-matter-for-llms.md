---
title: "Does PCIe bandwidth matter for LLMs? x1 risers, x4 slots and x16"
description: When a narrow PCIe link slows a local model down and when it doesn't, from loading time to multi-GPU and CPU offload, and how to check your link.
track: basics
order: 11
date: 2026-10-26
models: qwen3-32b, llama-3-3-70b
---
**For generating text with the whole model on the GPU, PCIe barely matters.** Once the model is loaded, almost nothing crosses the slot. A card on an x4 slot, or even an x1 mining riser, writes at nearly the same speed as one on x16. PCIe starts to matter for loading, for tensor parallel, and for CPU offload.

## Why it usually doesn't matter

The slow part of generating text is the GPU reading its own memory, hundreds of GB per second over the card's own memory bus (see [why memory bandwidth sets LLM speed](/learn/memory-bandwidth-and-llm-speed)). PCIe isn't involved. The only things crossing the slot per token are your input, the output token, and a little bookkeeping. That's bytes, not gigabytes.

## Where it does matter

| Situation | Does PCIe width matter? |
|---|---|
| One GPU, model fully in VRAM, generating | Barely |
| Loading the model | Yes, but only once |
| Two or more GPUs, layer split | A little |
| Two or more GPUs, tensor parallel | Yes, a lot |
| Partial CPU offload | Some, mostly for long prompts |

**Loading.** The model has to get from disk to VRAM through the slot. Rough link speeds:

| Link | Approximate speed |
|---|---|
| PCIe 3.0 x16 | ~16 GB/s |
| PCIe 3.0 x4 | ~4 GB/s |
| PCIe 3.0 x1 | ~1 GB/s |
| PCIe 4.0 | double the 3.0 figure at the same width |

A 20 GB model like [Qwen3 32B](/model/qwen3-32b) loads in a few seconds over x16 and around 20 seconds over a 3.0 x1 riser, if your disk keeps up. Annoying if you swap models often, irrelevant if you load once and leave it running.

**Layer split across cards.** Between layers, the cards hand over a small set of numbers for each token. That's light traffic, which is why multi-GPU rigs built on x1 and x4 links work for generation. Prompt processing sends more across, so long prompts feel a narrow link more than chat does.

**Tensor parallel.** Every layer is split across cards, and they swap results many times per token. Here a narrow link becomes the bottleneck. If you plan to use vLLM with tensor parallel, give each card at least x8, ideally x16. See [multi-GPU explained](/learn/multi-gpu-explained).

**CPU offload.** The CPU runs its own layers from RAM, so generation isn't held up by PCIe. But for big prompts, llama.cpp may send offloaded weights to the GPU to process them faster, and that does cross the slot. A narrow link makes long prompts slower when you're offloading. See [CPU offloading explained](/learn/cpu-offloading-explained).

## Old mining hardware

This is why ex-mining hardware is interesting for LLMs. Mining rigs ran cards on x1 risers because mining, like generation, barely uses the bus. Our rack includes ex-mining NVIDIA CMP cards alongside Tesla P100s and RTX A4500s. Some mining-only cards were sold with deliberately cut-down PCIe links, so check the link before you buy, and expect slow model loading and slow prompt processing on them. See [mining cards for AI](/learn/mining-cards-for-ai).

## Check your link

On NVIDIA:

```sh
nvidia-smi --query-gpu=name,pcie.link.gen.current,pcie.link.width.current --format=csv
```

Run it while a model is generating. Cards drop to a lower PCIe generation at idle to save power, so an idle reading can look worse than it is. Our [leaderboard](/leaderboard) test records PCIe generation and width under load for the same reason.

If the width is lower than the slot should give, the card may be in a slot that shares lanes with another device, or a riser may be forcing a lower speed.

## What to buy

- **One GPU:** any x16 slot is fine, and so is x4 if that's what you have.
- **Two GPUs, layer split (Ollama, LM Studio, llama.cpp):** x8 and x8, or x16 and x4, is fine. Workstation boards with lots of lanes make life easier.
- **Tensor parallel with vLLM:** x8 per card or better, ideally on a workstation or server board.
- **Many cards on risers:** fine for generation and serving separate copies, slow for loading and long prompts.

The used workstations in our builds, like the Dell T7810 and HP Z840, have plenty of PCIe slots, and our two-3090 build calls for a board with two x16 slots. Parts lists are on the [builds page](/builds).

Here's how a 48 GB pair of 3090s does with layer split, which works fine at x8 each:

{{lineup rtx-3090 48}}
