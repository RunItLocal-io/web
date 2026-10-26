---
title: "Ollama on a Mac: setup for Apple silicon, step by step"
description: Install Ollama on an M-series Mac, pick a model that fits your memory, check it's using the GPU, and change the settings that matter.
track: start
order: 7
date: 2026-10-26
models: qwen3-4b, qwen3-8b, gpt-oss-20b, qwen3-30b-a3b
---
A Mac with Apple silicon (M1 or newer) is the easiest computer to run local AI on. There are no drivers to install. Ollama uses the GPU through Metal automatically, and the GPU shares the Mac's unified memory, so a 32 GB Mac can load models a 16 GB graphics card can't.

If you're choosing which Mac to buy, read [Macs for local LLMs](/learn/mac-for-local-llms). This guide is about setting up the one you have.

## Step 1: Install Ollama

Download Ollama for macOS from [ollama.com](https://ollama.com/download), open it, and drag it to Applications. Start it once. It adds an icon to the menu bar and runs a small server in the background, and it offers to install the `ollama` command for Terminal.

## Step 2: Pick a model for your memory

macOS lets the GPU use about two thirds of memory on Macs up to 36 GB, and about three quarters above that. Leave room for your other apps too.

| Your Mac's memory | Start with | Download |
|---|---|---|
| 8 GB | `qwen3:4b` | 2.5 GB |
| 16 GB | `qwen3:8b` | 5.2 GB |
| 24 to 32 GB | `gpt-oss:20b` | 14 GB |
| 36 to 48 GB | `qwen3:30b` | 19 GB |
| 64 GB and up | `llama3.3:70b` | 43 GB |

## Step 3: Run it

Open Terminal and run the model for your memory, for example:

```sh
ollama run qwen3:8b
```

Type a question at the `>>>` prompt. Type `/bye` to quit. The [Ollama cheat sheet](/learn/ollama-commands-cheat-sheet) has the rest of the commands.

## Step 4: Check it's on the GPU

```sh
ollama ps
```

`100% GPU` is what you want. A split like `20%/80% CPU/GPU` means the model is too big for the share of memory macOS gives the GPU. Drop to a smaller one.

You can also open Activity Monitor and look at the GPU History window while it answers.

## How fast it will be

On a Mac, the chip matters more than the memory size for speed. A base M4 with 16 GB, from our calculator:

{{lineup apple-m4 16}}

And an M4 Pro with 48 GB, which has more than twice the bandwidth:

{{lineup apple-m4-pro 48}}

On the M4 Pro, [gpt-oss 20B](/model/gpt-oss-20b) and [Qwen3 30B-A3B](/model/qwen3-30b-a3b) are estimated at about 48 tok/s, while the dense Qwen3 32B is about 8. Mixture-of-experts models read only a small part of their weights per token, which suits Macs well. See [mixture of experts explained](/learn/mixture-of-experts-explained).

## Settings worth changing

Ollama on a Mac reads its settings from environment variables set with `launchctl`. For example, to move models to an external drive:

```sh
launchctl setenv OLLAMA_MODELS /Volumes/External/ollama-models
```

Then quit Ollama from the menu bar and open it again. The same pattern works for `OLLAMA_HOST` and `OLLAMA_KEEP_ALIVE`. Settings made with `launchctl setenv` are lost on restart, so you'll need to run it again after a reboot. See [where Ollama stores models](/learn/where-ollama-stores-models).

**Giving the GPU more memory.** On recent macOS versions you can raise the share of memory the GPU may use with `sudo sysctl iogpu.wired_limit_mb=<megabytes>`. It resets on reboot. Leave several GB for macOS itself, or the whole machine slows down.

## Other good Mac apps

- **LM Studio** has a model browser and chat window, and can run models in Apple's MLX format, which is often a little faster on Macs than GGUF. See [Ollama vs llama.cpp vs LM Studio](/learn/ollama-vs-llama-cpp-vs-lm-studio).
- **Open WebUI** gives Ollama a ChatGPT-style window. See [set up Open WebUI](/learn/open-webui-setup).

## Intel Macs

Older Intel Macs run Ollama on the processor only. Stick to `qwen3:4b`, and read [running AI without a GPU](/learn/run-ai-on-a-laptop-without-a-gpu) for what to expect.

## Where to go next

- **New to this?** Try [your first week with local AI](/learn/first-week-with-local-ai).
- **Words like quant and context confusing?** See the [local AI glossary](/learn/local-ai-glossary).
- **Compare Macs:** the [M4 Max](/gpu/apple-m4-max) and other chips each have their own page.
