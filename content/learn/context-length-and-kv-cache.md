---
title: "Context length and the KV cache: why long chats use more VRAM"
description: Why a model that fits can still run out of memory on a long document, how to work out the KV cache size, and three ways to shrink it.
track: basics
order: 5
date: 2026-10-26
models: qwen3-32b, llama-3-3-70b, gemma-3-27b
---
**Every token in the conversation costs memory, on top of the model itself.** That memory is the KV cache. It's why a model that loads fine can crash or slow down when you paste in a long document: the weights fit, but the weights plus the conversation don't.

## What the KV cache is

To write the next word, the model looks back at every earlier token. Recomputing all of that each time would be far too slow, so it keeps two small vectors (a "key" and a "value") for every token, in every layer, and reuses them. That store is the KV cache.

It grows by the same amount for every token, whether the token came from you, a pasted file, or the model's own answer. **Context length** is the most tokens the cache is allowed to hold.

## How big it gets

The size per token depends on the model's shape:

> **KV cache per token = 2 × layers × KV heads × head size × bytes per number**

At the usual 16-bit cache:

- **Qwen3 32B** (64 layers, 8 KV heads, head size 128): about **256 KB per token**.
- **Llama 3.3 70B** (80 layers, 8 KV heads, head size 128): about **320 KB per token**.

That adds up quickly:

| Context | Qwen3 32B cache | Llama 3.3 70B cache |
|---|---|---|
| 4,000 tokens | ~1 GB | ~1.3 GB |
| 16,000 tokens | ~4 GB | ~5 GB |
| 32,000 tokens | ~8 GB | ~10 GB |
| 128,000 tokens | ~32 GB | ~40 GB |

At 128,000 tokens, the cache for Llama 3.3 70B is almost as big as the model. A long context is not free just because the model supports it.

Some models are cheaper than this. Gemma 3 uses a short sliding window on most of its layers, so only a few layers keep the whole conversation, and its cache grows much more slowly. The model card or the engine's load log tells you what you're dealing with.

## A worked example on 24 GB

Qwen3 32B at 4-bit is about 20 GB. Our calculator adds 1.2 GB for context and runtime overhead and calls it a fit on a 24 GB card, at about 26 tok/s on an RTX 3090 (estimate). That leaves roughly 3 to 4 GB for the cache, which is somewhere around 12,000 to 16,000 tokens. Fine for chat. Not enough for a 100-page PDF.

{{lineup rtx-3090}}

## Three ways to fit more context

**1. Quantize the cache.** The cache can be stored at 8 bits instead of 16, which halves it with very little quality loss. In llama.cpp use `--cache-type-k q8_0 --cache-type-v q8_0` (the V cache needs flash attention on). In Ollama, set both of these before starting the server:

```sh
OLLAMA_FLASH_ATTENTION=1 OLLAMA_KV_CACHE_TYPE=q8_0 ollama serve
```

**2. Use a smaller weight quant.** Dropping Qwen3 32B from Q4_K_M toward Q3 frees a few GB for context. See [quantization explained](/learn/quantization-explained) for the trade-off.

**3. Pick a smaller model for long-document jobs.** Qwen3 14B with 32,000 tokens of context often beats Qwen3 32B squeezed to 8,000, because it can actually see the whole document.

## Setting the context length

Ollama starts with a short context to save memory, and it quietly drops the oldest tokens when you go past it. That looks like the model "forgetting" the start of your document. To raise it inside a chat:

```sh
/set parameter num_ctx 16384
```

Or for every model, on Linux:

```sh
OLLAMA_CONTEXT_LENGTH=16384 ollama serve
```

On Mac and Windows the Ollama app has a context length setting. In LM Studio it's set when you load a model. The full how-to is in [increasing Ollama's context length](/learn/increase-ollama-context-length).

## Long context is slower too

The cache costs time as well as memory. Every new token reads the whole cache, so generation slows as the conversation grows. And the first answer after pasting a long document waits while the model reads it all in, which is a separate, compute-bound step. See [prompt processing vs generation speed](/learn/prompt-processing-vs-generation-speed).

## Where to go next

- [How much VRAM you need](/learn/how-much-vram-do-you-need) for the weights themselves.
- [Fixing out-of-memory errors](/learn/fix-out-of-memory-errors) when a long chat tips you over.
- The [Qwen3 32B](/model/qwen3-32b) page for what it runs on.
