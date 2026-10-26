---
title: "LM Studio guide: download, run and serve local models"
description: How to use LM Studio to find a model that fits your GPU or Mac, set GPU offload and context, and run its local OpenAI-compatible server.
track: serve
order: 4
date: 2026-10-26
models: qwen3-8b, qwen3-14b, gemma-3-12b
---
**LM Studio is the easiest way to run local models without a terminal.** It's a free desktop app for Windows, Mac and Linux. You search for a model inside it, it tells you whether the file fits your memory, and you chat in a clean window. It can also run a local server so other apps can use the model. It's built on llama.cpp, and on Apple silicon it also runs MLX models.

Not sure it's the right tool? [Ollama vs llama.cpp vs LM Studio](/learn/ollama-vs-llama-cpp-vs-lm-studio) compares all three.

## Step 1: Install and pick a model

Download LM Studio from its website and open it. Go to the search (Discover) section and type a model name, for example "Qwen3 8B".

You'll see several files for the same model. They're different quantizations: smaller files lose a little quality. LM Studio marks which ones fit your hardware. Good defaults:

- **Q4_K_M** for most people. The best balance of size and quality.
- **Q5_K_M or Q6_K** if you have memory to spare.
- **MLX 4-bit** on a Mac, which is often a little faster than GGUF there.

[Quantization explained](/learn/quantization-explained) covers the tradeoffs.

## Step 2: Pick by memory

The model file plus about 1.2 GB for context has to fit in your graphics memory. A quick guide:

| Your memory | Start with | Why |
|---|---|---|
| 8 GB GPU | [Qwen3 8B](/model/qwen3-8b) | Fits with room for context |
| 12 GB GPU | [Qwen3 14B](/model/qwen3-14b) or [Gemma 3 12B](/model/gemma-3-12b) | Gemma reads images too |
| 16 GB GPU | gpt-oss 20B | Mixture of experts, so it's fast |
| 24 GB GPU | Qwen3 30B-A3B or Qwen3 32B | The sweet spot for one card |
| Mac, 32 GB+ | Qwen3 30B-A3B | About two thirds of memory is usable |

Here's what our calculator estimates for a 12 GB RTX 3060, the card in our "Starter" build:

{{lineup rtx-3060 12}}

## Step 3: Load it with the right settings

When you load a model, LM Studio shows a few settings. Two matter:

- **GPU offload.** How many of the model's layers go on the GPU. Set it to the maximum if the model fits. If it doesn't load, lower it; the rest runs on the CPU, which is much slower.
- **Context length.** How much text the model can see at once. Longer costs memory. 8K is fine for chat; raise it for long documents. See [how much VRAM you need](/learn/how-much-vram-do-you-need).

If a model loads but runs slowly, check the offload setting first. Partial offload is the usual reason.

## Step 4: Chat

Pick the loaded model at the top of the chat window and type. You can set a system prompt for standing instructions, and drop in images if the model supports them, like Gemma 3.

## Step 5: Run the local server

This is what makes LM Studio useful beyond its own window. Open the Developer section, load a model, and start the server. It serves an OpenAI-compatible API at `http://localhost:1234/v1`.

Test it from a terminal:

```sh
curl http://localhost:1234/v1/models
```

That lists the models it can serve. Then point any OpenAI-compatible app, like a coding extension or a script, at `http://localhost:1234/v1`. Use the model name from that list.

There's also a command-line tool, `lms`, that ships with the app. It's handy for scripting:

```sh
lms server start
```

`lms ls` lists the models you've downloaded.

## Using it from other devices

By default the server only answers on your own computer. The server settings have an option to serve on your local network. Turn it on only on a network you trust, and don't forward the port to the internet. For phones and laptops away from home, use a private network instead; see [remote access with Tailscale or Cloudflare](/learn/remote-access-with-tailscale-or-cloudflare).

## When to switch

LM Studio is great for trying models and for one person. Move on when:

- **You want a background service other apps rely on.** Ollama is built for that; start with the [Ollama API guide](/learn/ollama-api-guide).
- **You want every setting, or to tune a multi-GPU rig.** Use the [llama.cpp server](/learn/llama-cpp-server-guide) directly.

Models you download in LM Studio are ordinary GGUF files, so you can [import them into Ollama](/learn/import-gguf-into-ollama) without downloading again.
