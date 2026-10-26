---
title: "CPU offloading explained: running a model bigger than your VRAM"
description: What happens when a model doesn't fit in GPU memory, how partial offload works in Ollama and llama.cpp, how slow it gets, and when it's worth it.
track: basics
order: 9
date: 2026-10-26
models: llama-3-3-70b, gpt-oss-120b, qwen3-30b-a3b
---
**Yes, you can run a model bigger than your graphics card. Part of it goes in system RAM and runs on the CPU.** It works, but for a normal dense model it's slow, often five to ten times slower than fitting it all on the GPU. Mixture-of-experts models are the big exception.

## How it works

A model is a stack of layers. With partial offload, some layers live in VRAM and run on the GPU, and the rest live in system RAM and run on the CPU. Each token passes through all of them in order.

Ollama does this automatically. If a model doesn't fit, it puts as many layers on the GPU as it can and the rest on the CPU, without telling you unless you look. LM Studio has a GPU offload slider when you load a model. In llama.cpp you choose with `-ngl` (number of GPU layers); `-ngl 99` means "all of them".

## Why it gets so slow

Writing each token means reading every active weight once, so speed follows memory bandwidth (see [why memory bandwidth sets LLM speed](/learn/memory-bandwidth-and-llm-speed)). The two kinds of memory are very different:

| Memory | Typical bandwidth |
|---|---|
| RTX 3090 VRAM | 936 GB/s |
| Dual-channel DDR5 desktop RAM | roughly 70 to 100 GB/s |
| Dual-channel DDR4 desktop RAM | roughly 40 to 50 GB/s |

The slow part dominates. Take Llama 3.3 70B at 4-bit, about 43 GB, on a single 24 GB RTX 3090. About half goes on the card and half in RAM. Using the same formula as our calculator, the GPU half takes about 0.02 seconds per token and the RAM half about ten times longer. That works out to **roughly 2 tok/s**, a rough estimate. On two 3090s, with all of it in VRAM, our calculator estimates about **12 tok/s**.

So the speed isn't "a bit less than the GPU". It's close to the CPU's speed, even when most of the model is on the GPU.

## Check whether you're offloading

```sh
ollama ps
```

The PROCESSOR column says `100% GPU` when everything fits. A split like `30%/70% CPU/GPU` means part of the model is in system RAM. If a model you expected to be fast is crawling, this is the first thing to check. More in [fixing Ollama using the CPU instead of the GPU](/learn/fix-ollama-using-cpu-instead-of-gpu).

Remember the context counts too. A model that fits at a short context can start offloading when you raise the context length, because the KV cache needs room. See [context length and the KV cache](/learn/context-length-and-kv-cache).

## The exception: mixture of experts

MoE models only use a few experts per token, and the experts are most of the model's size. llama.cpp can keep the attention layers and shared parts on the GPU and put just the expert weights in RAM, with its `--n-cpu-moe` option. Since only a small slice of the experts is read per token, the CPU side has far less to do.

This is how people run [gpt-oss 120B](/model/gpt-oss-120b), a 65 GB model with only about 5B active parameters, on a single 24 GB card plus 64 GB of system RAM, at speeds that are usable for chat. A dense 70B on the same machine is much slower. See [mixture of experts explained](/learn/mixture-of-experts-explained).

## When offloading is worth it

- **Worth it:** MoE models that are a little too big; trying out a model before buying hardware; batch jobs where nobody's waiting; a model that's only a GB or two over.
- **Not worth it:** a dense model that's mostly in RAM, for daily chat. You'll stop using it.

Usually the better move is a smaller model or a smaller quant that fits fully. A 32B model that fits beats a 70B model that crawls, for almost everything. See [quantization explained](/learn/quantization-explained).

## Make offloading as fast as it can be

- **Fill both memory channels.** Two or four matching sticks, not one. Bandwidth roughly doubles.
- **Faster RAM helps directly,** because RAM speed is the limit.
- **Close other programs** that use VRAM, like browsers with hardware acceleration, so more layers fit on the card.
- **Have enough RAM.** The offloaded part has to fit in system memory with room left for your OS. See [system RAM for local AI](/learn/system-ram-for-local-ai).

## The real fix

More VRAM. A second card pools memory for models; see [multi-GPU explained](/learn/multi-gpu-explained). Our "Best value" build gets you 32 GB across two used Tesla P100s for about $450 to $650 all in, on the [builds page](/builds).

Here's what fits on one 24 GB card with no offloading at all:

{{lineup rtx-3090}}
