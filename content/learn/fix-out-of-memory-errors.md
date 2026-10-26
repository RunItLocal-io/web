---
title: "Fix CUDA out of memory errors in Ollama and llama.cpp"
description: Why local models run out of GPU memory, and the fixes in order - smaller quant, shorter context, a quantized KV cache, fewer parallel slots, partial offload.
track: serve
order: 16
date: 2026-10-26
models: qwen3-8b, qwen3-14b, qwen3-32b
---
**An out-of-memory error means the model plus its context didn't fit in your graphics memory.** The memory goes to two things: the model's weights, roughly its file size, and the KV cache, which grows with context length and with the number of requests served at once. Fix it by shrinking one of those. The quickest wins, in order: a shorter context, a smaller quant, a quantized KV cache, fewer parallel slots.

Errors look like `CUDA error: out of memory`, `failed to allocate`, or in Ollama, a message that the model requires more memory than is available. Sometimes there's no error at all, just a model that's very slow because it spilled onto the CPU; see [fixing Ollama using the CPU](/learn/fix-ollama-using-cpu-instead-of-gpu).

## Step 1: Do the math

Memory needed ≈ the model file's size + 1 to 2 GB for a modest context. Long contexts need more. Our calculator uses file size + 1.2 GB. Here's what it says fits on a 12 GB RTX 3060:

{{lineup rtx-3060 12}}

If your model is marked "does not fit" for your card, no setting will save it. Go to Step 3. For the full rule of thumb, see [how much VRAM you need](/learn/how-much-vram-do-you-need).

## Step 2: Free what's already in use

```sh
nvidia-smi
```

Look at memory used before you load anything. Browsers, games, other AI apps and a second loaded model all take a share. In Ollama, `ollama ps` lists loaded models, and `ollama stop` followed by a model's name unloads one. On a server, `OLLAMA_MAX_LOADED_MODELS=1` stops Ollama keeping several in memory at once.

On Windows, the desktop itself uses some graphics memory, so a 12 GB card has a bit less than 12 GB free.

## Step 3: Shrink the model

| Change | Memory saved | Cost |
|---|---|---|
| Q8 to Q4_K_M | Nearly half | Small quality drop |
| Q4_K_M to a 3-bit quant | About a fifth | Noticeable on small models |
| 14B to 8B | About 40% | A less capable model |
| Dense 32B to Qwen3 30B-A3B | A little | Different strengths, much faster |

For most people the answer is the next size down: [Qwen3 8B](/model/qwen3-8b) instead of [Qwen3 14B](/model/qwen3-14b) on 8 GB, or Qwen3 14B instead of [Qwen3 32B](/model/qwen3-32b) on 16 GB. See [quantization explained](/learn/quantization-explained).

## Step 4: Shrink the context

The KV cache is often the surprise. For a Llama 3 8B-class model it's about 128 KB per token, so 32K tokens of context adds around 4 GB.

- **Ollama:** lower `OLLAMA_CONTEXT_LENGTH`, or `num_ctx` in a Modelfile or API call. See [increasing context length](/learn/increase-ollama-context-length), and do the opposite.
- **llama.cpp:** lower `-c`.
- **vLLM:** lower `--max-model-len`.

## Step 5: Quantize the KV cache

Storing the cache at 8-bit roughly halves its size, with little quality loss.

In Ollama, set both of these where the server runs, then restart it:

```sh
OLLAMA_FLASH_ATTENTION=1 OLLAMA_KV_CACHE_TYPE=q8_0 ollama serve
```

In llama.cpp, add `-ctk q8_0 -ctv q8_0`. Quantizing the V half of the cache needs flash attention turned on; check `llama-server --help` for the flash attention option in your version.

## Step 6: Fewer parallel requests

Each request served at the same time needs its own context.

- **Ollama:** set `OLLAMA_NUM_PARALLEL=1` on a machine with little memory.
- **llama.cpp:** with `-np 4`, the context set by `-c` is shared among four slots. Lower `-np`, or accept a shorter context per slot.

## Step 7: Offload part of the model

As a last resort, put some layers on the CPU. It works, but expect a big slowdown. In llama.cpp, lower `-ngl` from 99 until the model loads. Ollama does this automatically when the model doesn't fit. See [CPU offloading explained](/learn/cpu-offloading-explained).

## Or add memory

If you keep hitting the limit, the fix is hardware. A second card pools memory for models; two used 24 GB cards run 70B-class models. Our "Best value" build, a used workstation with two Tesla P100s, gets you 32 GB for $450 to $650. Every option with a parts list is on the [builds page](/builds), and each card's [GPU page](/gpu) shows what fits.

## Quick checklist

1. Does the model file plus 1.2 GB fit your card?
2. Is anything else using the GPU?
3. Is the context longer than you need?
4. Is the KV cache quantized?
5. Is the server running several requests at once?
