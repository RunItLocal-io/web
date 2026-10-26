---
title: How to run AI locally: your first model in ten minutes
description: Install Ollama, run one command, and chat with an open model on the computer you already own. No account, no cloud, no monthly bill.
track: start
order: 1
date: 2026-10-26
models: qwen3-8b, qwen3-4b
---
Running an AI model on your own computer takes one download and one command. Nothing you type leaves your machine, there's no subscription, and it keeps working with the internet off.

This guide gets you from nothing to a working chat in about ten minutes. Most of that is the model downloading.

## What you need

- **A computer from the last six or seven years.** A gaming PC, a Mac with Apple silicon (M1 or newer), or a laptop with 16 GB of memory all work.
- **About 5 GB of free disk space** for your first model.
- **A graphics card helps but isn't required.** With one, answers come faster than you can read. Without one, small models still run on the processor, just slower.

Not sure what your machine can handle? The [homepage](/) reads your GPU in the browser and shows which models fit.

## Step 1: Install Ollama

[Ollama](https://ollama.com/download) is a free app that downloads models and runs them for you. It handles the hard parts: picking a file size that fits, using your graphics card, and keeping the model loaded between questions.

- **Mac and Windows:** download the installer from ollama.com and run it.
- **Linux:** paste this into a terminal.

```sh
curl -fsSL https://ollama.com/install.sh | sh
```

## Step 2: Run your first model

Open a terminal (Terminal on Mac, PowerShell on Windows) and run:

```sh
ollama run qwen3:8b
```

The first run downloads about 5 GB. After that it starts in seconds. When you see a `>>>` prompt, type a question and press Enter. Type `/bye` to quit.

**Qwen3 8B** is our default first model: good at writing, chat and light coding, and small enough to run fast on an 8 GB graphics card. If your machine has less memory, or no graphics card, start smaller:

```sh
ollama run qwen3:4b
```

## Step 3: Check it's using your GPU

While a model is loaded, run this in a second terminal:

```sh
ollama ps
```

The `PROCESSOR` column should say `100% GPU`. If it says something like `48%/52% CPU/GPU`, the model is too big for your graphics memory and part of it runs on the much slower processor. Pick a smaller model, or read [how much VRAM you need](/learn/how-much-vram-do-you-need).

## What to expect

Speed is measured in tokens per second. A token is about three quarters of a word. Around **10 tok/s** is reading speed; **30 tok/s and up** feels instant.

Here's what a common starter card, the RTX 3060 with 12 GB, can run, from our calculator:

{{lineup rtx-3060 12}}

Every GPU we track has its own page like this one. Start at [every GPU](/gpu).

## Where to go next

- **Want a ChatGPT-style window instead of a terminal?** [Set up Open WebUI](/learn/open-webui-setup) in ten more minutes.
- **Want a smarter model?** It mostly comes down to memory. Read [how much VRAM you need](/learn/how-much-vram-do-you-need).
- **Deciding whether it's worth it?** Read [local AI vs the cloud](/learn/is-local-ai-worth-it).
- **No GPU, or just curious?** Try a small model right in your browser in the [Studio](/studio).
