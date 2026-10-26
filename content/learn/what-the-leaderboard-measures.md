---
title: "How we benchmark: what the RunItLocal.io leaderboard measures"
description: The exact test behind our leaderboard, from the two tiers and the llama-bench command to the power numbers, what we keep, and how rigs are ranked.
track: basics
order: 17
date: 2026-10-26
models: qwen3-8b
---
**The [leaderboard](/leaderboard) ranks real rigs by how fast they generate text on one fixed model, run the same way on every machine.** Your own AI agent runs the test on your hardware, shows you the result, and sends it only when you say yes. This page explains exactly what it does.

## The two tests

Results are only ranked against runs of the same test:

| Tier | Model | File | Who it's for |
|---|---|---|---|
| S | Qwen3-8B | Q4_K_M GGUF | Any GPU with 8 GB or more |
| M | Qwen3.6-35B-A3B | Unsloth UD-Q4_K_M GGUF | 24 GB or more in total |

You pick a tier, or let your agent pick the largest one that fits your total GPU memory (or unified memory on a Mac). Tier S uses [Qwen3 8B](/model/qwen3-8b), a dense model. Tier M is a 35B mixture-of-experts model, the same one our own rack ran a billion tokens of. When a new model is worth tracking, we add it as a new test.

## How you take part

1. On the leaderboard page, pick a test and a name or handle for the board, plus what you use the rig for, if you like.
2. You get a prompt with your own one-time submit link in it. The link works once and expires after 24 hours.
3. Paste the prompt into an agent that runs on your machine, like Claude Code or Codex.
4. The agent runs the test, shows you the JSON result, and posts it once you agree. The page waits and shows where you landed.

If your agent can't send it, paste the JSON into the box on the same page. There's also a plain-text version of the prompt at `runitlocal.io/bench.txt`, for agents that read instructions from a URL; that one ends by asking you to paste the result in.

## What the agent does

**Step 1: hardware and software.** Using only read-only commands, it records your OS, CPU, RAM, motherboard, each GPU (model, VRAM, driver, CUDA, ROCm or Metal version, power limit, and PCIe generation and width under load) and your inference engine and version. The prompt tells it not to install, download or change anything, or use sudo, without asking you first.

**Step 2: the model.** If the model file isn't already on disk, it tells you the file name and size and asks before downloading.

**Step 3: the test.** It runs llama.cpp's benchmark tool with every layer on the GPU and flash attention on:

`llama-bench -m <model> -ngl 99 -fa 1 -p 512,4096,16384 -n 128 -r 3 -o json`

That measures **prompt processing** at 512, 4,096 and 16,384 tokens and **generation** over 128 new tokens, each repeated three times. If the model needs more than one GPU, it uses llama.cpp's default layer split and records how many cards it used (see [multi-GPU explained](/learn/multi-gpu-explained)).

While it runs, the agent samples the GPUs every second and keeps the minimum, maximum and average of power draw, temperature, clock speed, VRAM used and throttle reasons. It also records 10 seconds of idle power first.

If llama-bench isn't available but Ollama is, the agent runs the model with `ollama run --verbose` on a fixed 500-word prompt three times and reports Ollama's prompt eval and eval rates instead. The board shows the engine for every run, so you can tell them apart.

**Step 4: the result.** One JSON block with null for anything it couldn't detect. The prompt tells it not to invent or estimate numbers and to mark anything inferred.

## The power numbers

**Joules per token** is average GPU power during generation divided by generation tok/s. Lower is more efficient. It's GPU power only, not the whole machine at the wall. More in [power and heat of local AI](/learn/power-and-heat-of-local-ai).

## Privacy

The prompt tells the agent never to include hostnames, usernames, IP or MAC addresses, serial numbers, UUIDs, paths under your home folder, or environment variables. On our side, the submission is rebuilt field by field from the schema, so anything outside it is dropped. We keep: OS, CPU model, cores and threads, total RAM, each GPU's model, VRAM, driver, runtime, power limit and PCIe link, the engine name and version, the test results, average and peak power, idle power, peak temperature, peak VRAM used, whether it throttled, and joules per token. Kernel, motherboard, RAM speed and the notes field are not kept.

## How rigs are ranked

Each tier has its own table, **ranked by generation speed**, fastest first. It also shows prompt processing at 4K context, average watts and joules per token. Generation speed is what you feel in chat; prompt speed is what you feel pasting in long documents. See [prompt processing vs generation speed](/learn/prompt-processing-vs-generation-speed).

## What we check, and what we can't

Before a run is accepted, it has to use our result format, name at least one GPU, and report a generation speed above 0 and no more than 5,000 tok/s. That catches broken and mistyped results. It can't prove a run is honest: the numbers are self-reported by your agent on your machine. Treat the board as real-world reports, and look at several rigs with the same card rather than one.

Every run on the board is also public as JSON at `runitlocal.io/api/rigs`, for anyone who wants to analyze it.

## The leaderboard vs our calculator

The speeds on our [GPU pages](/gpu) are **estimates** from a formula, calibrated against our rack (two RTX A4500s measured 110 tok/s on a 3B-active MoE). The leaderboard is **measurements** from people's actual machines. If they disagree for your card, trust the measurements from rigs like yours.

{{lineup rtx-a4500 40}}
