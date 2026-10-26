---
title: "GGUF vs safetensors vs MLX: which model file format do you need?"
description: What the three common model file formats are, which tools read each one, and which to download for an NVIDIA card, an older GPU, or a Mac.
track: basics
order: 6
date: 2026-10-26
models: qwen3-8b, qwen3-30b-a3b
---
**Short answer: on a PC, download GGUF. On a Mac, GGUF or MLX. Safetensors is for server engines and for people who make the other two.** The format you need is decided by the software you run, and the software is decided by your hardware.

## The three formats

| Format | What it is | Who reads it | Typical sizes |
|---|---|---|---|
| GGUF | One self-contained file: weights, tokenizer and settings | llama.cpp, Ollama, LM Studio, and most desktop apps | Quantized, Q2 to Q8, plus 16-bit |
| Safetensors | Hugging Face's standard for raw weights, usually split into several files with config files next to them | Transformers, vLLM, SGLang and other server engines | Usually the original 16-bit, or AWQ, GPTQ and FP8 versions |
| MLX | Apple's machine-learning framework; MLX models are safetensors files laid out for it | LM Studio on Mac, the mlx-lm tools | Usually 4-bit, 8-bit, or 16-bit |

## GGUF: the one most people want

GGUF was made for llama.cpp, and almost every home tool is built on llama.cpp. Its big advantage is that it's **one file with everything in it**. You can copy it to another machine and it just works.

It's also where the Q-names come from: `Q4_K_M`, `Q8_0` and so on. Those are GGUF quantizations, explained in [quantization explained](/learn/quantization-explained).

When you run `ollama run qwen3:8b`, Ollama downloads a GGUF into its own store. You don't see the file, but that's what it is. You can also bring your own GGUF from Hugging Face; see [importing a GGUF into Ollama](/learn/import-gguf-into-ollama).

GGUF runs on the widest range of hardware: NVIDIA back to old Pascal cards, AMD, Intel, Apple, and plain CPUs.

## Safetensors: the source

When a lab releases a model, the official files are almost always safetensors in 16-bit. That's the master copy. Quantizers download it and turn it into GGUF or MLX.

You'd download safetensors directly if you run a server engine like vLLM, which wants them (or its own quantized versions, like AWQ or FP8). These engines are built for serving many users on recent NVIDIA cards. For one person on a desktop, they're more setup for little gain.

> Safetensors at 16-bit is big: about 2 GB per billion parameters. A 32B model is around 64 GB before anyone quantizes it.

## MLX: Apple's own

MLX is Apple's framework for its own chips. MLX versions of popular models usually appear on Hugging Face soon after release, at 4-bit and 8-bit. On a Mac, they're often a little faster than the same model as GGUF, though it depends on the model and the version of each tool.

LM Studio on a Mac shows both GGUF and MLX downloads, so it's easy to try both and keep the faster one. See [Macs for local LLMs](/learn/mac-for-local-llms).

## Which file to download

| Your setup | Download | Run it with |
|---|---|---|
| NVIDIA, AMD or Intel GPU at home | GGUF, Q4_K_M | Ollama or LM Studio |
| Older NVIDIA cards (Pascal, like the P100) | GGUF | llama.cpp-based tools only |
| Mac with Apple silicon | GGUF or MLX | Ollama, or LM Studio for MLX |
| Recent NVIDIA cards serving a team | Safetensors (16-bit, AWQ or FP8) | vLLM |
| No GPU at all | GGUF, small quant | Ollama or llama.cpp |

## Formats can lock you out of hardware

This matters more on used hardware than people expect. On our rack, the next model queued for testing is NVIDIA's Nemotron 3.5 Bolt, a 74B mixture-of-experts model trained to run at 2-bit, about 24 GB. **NVIDIA's own release needs an Ada or Blackwell card.** The Unsloth GGUF of the same model runs on older cards like our P100s. Same model, different file, completely different list of GPUs it works on.

So if a new model says it needs a recent GPU, check whether a GGUF exists before you give up.

## Two smaller formats you might meet

- **Browser models.** Tools that run in a web page, like our [Studio](/studio), use their own pre-compiled format, downloaded automatically. You never handle the file.
- **Adapters (LoRA).** Small add-on files that change a base model's style or skills. They only work with the exact base model they were made for.

## Where to go next

- [Ollama vs llama.cpp vs LM Studio](/learn/ollama-vs-llama-cpp-vs-lm-studio) to pick the tool.
- [How much VRAM you need](/learn/how-much-vram-do-you-need) to pick the size.
- [Qwen3 30B-A3B](/model/qwen3-30b-a3b), a good first GGUF if you have 24 GB.
