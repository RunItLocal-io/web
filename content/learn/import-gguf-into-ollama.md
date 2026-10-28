---
title: "Import a GGUF file into Ollama with a Modelfile"
description: Run any GGUF model in Ollama. Pull straight from Hugging Face, or write a three-line Modelfile for a local file, with templates, context and system prompts.
track: serve
order: 8
date: 2026-10-26
models: qwen3-8b, qwen3-30b-a3b
---
**Ollama can run almost any GGUF file, not just the ones in its library.** There are two ways. If the file is on Hugging Face, Ollama can pull it directly. If it's already on your disk, write a short text file called a Modelfile and run `ollama create`.

## The fastest way: pull from Hugging Face

```sh
ollama run hf.co/unsloth/Qwen3-8B-GGUF:Q4_K_M
```

The format is `hf.co/` plus the repository name, then a colon and the quantization you want. Leave off the colon part and Ollama picks a default file from the repo. It downloads once and then shows up in `ollama list` like any other model.

This is the way to try a fine-tune, a new quant, or a model that isn't in Ollama's library yet. A good example from our rack: NVIDIA Nemotron 3.5 Bolt, a 74B mixture-of-experts model with 9B active, trained to run at 2-bit, about 24 GB. Its model card lists only Ada and Blackwell GPUs, but llama.cpp ran its GGUF on our older P100s ([results](/learn/nemotron-3-5-bolt-74b-on-two-mining-cards)). Whether a brand-new architecture works in Ollama depends on whether your Ollama version supports it yet, so update first.

## A local file: write a Modelfile

Say you downloaded `Qwen3-8B-Q4_K_M.gguf` in LM Studio or from a browser. Put this in a file named `Modelfile` in the same folder:

```
FROM ./Qwen3-8B-Q4_K_M.gguf
PARAMETER num_ctx 16384
SYSTEM """You are a concise assistant. Answer in plain English."""
```

Then build and run it:

```sh
ollama create my-qwen3 -f Modelfile
```

```sh
ollama run my-qwen3
```

`ollama create` copies the file into Ollama's own storage, so you can delete the original afterwards if you need the disk space.

## What goes in a Modelfile

| Line | What it does | Example |
|---|---|---|
| `FROM` | The model: a GGUF path or an existing Ollama model | `FROM ./model.gguf` |
| `PARAMETER` | A setting | `PARAMETER num_ctx 16384` |
| `SYSTEM` | A standing system prompt | `SYSTEM """Be brief."""` |
| `TEMPLATE` | How messages are wrapped for this model | Copy from a similar model |

Only `FROM` is required. Useful parameters: `num_ctx` for context length (see [increasing context length](/learn/increase-ollama-context-length)), `temperature` for how creative it gets, and `stop` for extra stop words.

## When the output is garbage

If the model rambles, answers its own questions, or prints odd tags like `<|im_start|>`, the chat template is wrong. Modern GGUF files carry their template inside, and Ollama usually reads it. Older or hand-made files may not.

The easy fix is to borrow the template from the same family in Ollama's library:

```sh
ollama show --modelfile qwen3:8b
```

That prints the full Modelfile, including the `TEMPLATE` block. Copy that block into yours and run `ollama create` again. Use the template from the model's own family; a Qwen template won't work for a Gemma model.

## Customizing a library model

`FROM` also takes a model you already have. This makes a version of [Qwen3 30B-A3B](/model/qwen3-30b-a3b) with a long context and a house style, without a second download:

```
FROM qwen3:30b
PARAMETER num_ctx 32768
SYSTEM """You are our team's coding assistant. Prefer short answers with code."""
```

## Does it fit?

A GGUF file's size is close to what it needs in memory, plus about 1.2 GB for context. Compare the file size with your card's memory before downloading. Here's what our calculator estimates for a 24 GB RTX 3090:

{{lineup rtx-3090}}

If a file is a few GB bigger than your card, pick the next quant down rather than letting it spill onto the CPU. [Quantization explained](/learn/quantization-explained) covers which quants are worth it.

## Things that trip people up

- **Split files.** Some big models come as several GGUF parts. If Ollama won't take them, merge them into one file with llama.cpp's gguf-split tool, or run them in the [llama.cpp server](/learn/llama-cpp-server-guide), which loads split files directly.
- **Paths with spaces.** Use a relative path from the Modelfile's folder, or put the file somewhere without spaces.
- **Docker.** If Ollama runs in a container, the GGUF has to be inside the container. See [running Ollama in Docker](/learn/run-ollama-in-docker).

Next, connect your new model to a chat window with [Open WebUI](/learn/open-webui-setup), or call it from code with the [Ollama API](/learn/ollama-api-guide).
