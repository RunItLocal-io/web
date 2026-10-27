---
title: "How we benchmark: the RunItLocal.io test, step by step"
description: The exact test behind our benchmark prompt, from the two tiers and the llama-bench commands to the power numbers, what we keep when you send a result in, and what we can't check.
nav: How we benchmark
track: basics
order: 17
date: 2026-10-26
models: qwen3-8b
---
**Our benchmark prompt measures how fast a rig generates text on one fixed model, run the same way on every machine, so two results can be compared.** Your own AI agent runs the test on your hardware and shows you the result. Nothing is sent anywhere unless you choose to [send it to us](/learn/posts#share). This page explains exactly what it does.

## The two tests

Results only compare with runs of the same test:

| Tier | Model | File | Who it's for |
|---|---|---|---|
| S | Qwen3-8B | Q4_K_M GGUF | Any GPU with 8 GB or more |
| M | Qwen3.6-35B-A3B | Unsloth UD-Q4_K_M GGUF | 24 GB or more in total |

You pick a tier, or let your agent pick the largest one that fits your total GPU memory (or unified memory on a Mac). Tier S uses [Qwen3 8B](/model/qwen3-8b), a dense model. Tier M is a 35B mixture-of-experts model, the same one our own rack ran a billion tokens of. When a new model is worth tracking, we add it as a new test.

## How to run it

1. Copy the prompt from the share form on the [Posts page](/learn/posts#share), or point your agent at the plain-text version at `runitlocal.io/bench.txt`.
2. Paste it into an agent that runs on your machine, like Claude Code or Codex.
3. The agent runs the test and prints one JSON result. It's yours to keep.
4. If you want, paste the JSON into the same form with a note about your setup. We read every one, and the interesting ones become [posts](/learn/posts), credited to you.

## What the agent does

**Step 1: hardware and software.** Using only read-only commands, it records your OS, CPU, RAM, motherboard, each GPU (model, VRAM, driver, CUDA, ROCm or Metal version, power limit, and PCIe generation and width under load) and your inference engine and version. The prompt tells it not to install, download or change anything, or use sudo, without asking you first.

**Step 2: the model.** If the model file isn't already on disk, it tells you the file name and size and asks before downloading.

**Step 3: the test.** It runs llama.cpp's benchmark tool twice, with every layer on the GPU and flash attention on:

`llama-bench -m <model> -ngl 99 -fa 1 -p 512,4096,16384 -n 0 -r 3 -o json`

`llama-bench -m <model> -ngl 99 -fa 1 -p 0 -n 128 -r 3 -o json`

Together they measure **prompt processing** at 512, 4,096 and 16,384 tokens and **generation** over 128 new tokens, each repeated three times. If the model needs more than one GPU, it uses llama.cpp's default layer split and records how many cards it used (see [multi-GPU explained](/learn/multi-gpu-explained)).

While it runs, the agent samples the GPUs every second and keeps the minimum, maximum and average of power draw, temperature, clock speed, VRAM used and throttle reasons. It also records 10 seconds of idle power first.

If llama-bench isn't available but Ollama is, the agent runs the model with `ollama run --verbose` on a fixed prompt of about 512 tokens three times and reports Ollama's prompt eval and eval rates instead. The result names the engine, so you can tell them apart.

**Step 4: the result.** One JSON block with null for anything it couldn't detect. The prompt tells it not to invent or estimate numbers and to mark anything inferred.

## The power numbers

**Joules per token** is average GPU power during generation divided by generation tok/s. Lower is more efficient. It's GPU power only, not the whole machine at the wall. More in [power and heat of local AI](/learn/power-and-heat-of-local-ai).

## Privacy

The prompt tells the agent never to include hostnames, usernames, IP or MAC addresses, serial numbers, UUIDs, paths under your home folder, or environment variables. If you send a result to us, it's rebuilt field by field from the schema, so anything outside it is dropped, and it goes to a private inbox, not straight onto the site. We keep: OS, CPU model, cores and threads, total RAM, each GPU's model, VRAM, driver, runtime, power limit and PCIe link, the engine name and version, the test results, average and peak power, idle power, peak temperature, peak VRAM used, whether it throttled, and joules per token. Kernel, motherboard, RAM speed and the notes field are not kept.

## Which number matters

**Generation speed** is the headline: it's what you feel in chat. Prompt processing at 4K context is what you feel pasting in long documents. Average watts and joules per token tell you what it costs to run. See [prompt processing vs generation speed](/learn/prompt-processing-vs-generation-speed).

## What we check, and what we can't

Before we accept a result, it has to use our result format, name at least one GPU, and report a generation speed above 0 and no more than 5,000 tok/s. That catches broken and mistyped results. It can't prove a run is honest: the numbers are self-reported by your agent on your machine. When we write one up, we say whose rig it was and that it's their measurement, not ours.

## Benchmarks vs our calculator

The speeds on our [GPU pages](/gpu) are **estimates** from a formula, calibrated against our rack (two RTX A4500s measured 110 tok/s on a 3B-active MoE). A benchmark result is a **measurement** from an actual machine. If they disagree for your card, trust measurements from rigs like yours, and tell us, because that's how the calculator gets better.

{{lineup rtx-a4500 40}}
