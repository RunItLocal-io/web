---
title: "AMD GPUs for local AI: ROCm, Vulkan and what works in practice"
description: Can you run local LLMs on an AMD Radeon card? Which tools support it, ROCm vs Vulkan, the best AMD cards for AI, and the catches compared to NVIDIA.
track: hardware
order: 8
date: 2026-10-26
models: qwen3-14b, gpt-oss-20b, qwen3-32b, qwen3-30b-a3b
---
**Yes, AMD cards run local LLMs well, especially for chat.** llama.cpp, and the tools built on it like Ollama and LM Studio, support Radeon cards. Text generation speed depends mostly on memory bandwidth, and AMD's bigger cards have plenty. The catches are software: setup can take more effort than NVIDIA, support varies by card, and some tools are NVIDIA-only.

## Two ways to run on AMD

**ROCm** is AMD's compute platform, its answer to NVIDIA's CUDA. It's usually the fastest path where it's supported. Official support covers a limited list of cards and operating systems, mostly recent high-end Radeons and AMD's data-center cards, and that list changes between releases. **Check AMD's current ROCm support list for your exact card and OS before you buy.** Cards not on the list sometimes work anyway, with workarounds, but you're on your own.

**Vulkan** is a general graphics API that almost every AMD card supports, on Windows and Linux. llama.cpp has a Vulkan backend, and LM Studio offers it as a runtime. It's the "it just works" option: often a little slower than ROCm, sometimes close, and it covers older and mid-range cards that ROCm doesn't.

In practice:

- **LM Studio** is the easiest start on Windows. Pick a Vulkan or ROCm runtime in its settings.
- **Ollama** supports many Radeon cards through ROCm on Linux and Windows. Check its documentation for which cards are supported in the current version.
- **llama.cpp** gives you the most control, with both ROCm and Vulkan builds.

See [Ollama vs llama.cpp vs LM Studio](/learn/ollama-vs-llama-cpp-vs-lm-studio) for the differences between the three.

## The best AMD card for this: RX 7900 XTX

The **RX 7900 XTX** has 24 GB at 960 GB/s, on paper a match for an RTX 3090. Our calculator's estimates:

{{lineup rx-7900-xtx}}

That's Qwen3 32B at about 26 tok/s and Qwen3 30B-A3B at around 168 tok/s, in line with a 3090. Real-world speed depends on the backend and driver version, so treat these as a ceiling to compare against.

## Other AMD cards worth knowing

| Card | Memory | Bandwidth | Qwen3 14B, estimated |
|---|---|---|---|
| [RX 7900 XTX](/gpu/rx-7900-xtx) | 24 GB | 960 GB/s | ~57 tok/s |
| [RX 7900 XT](/gpu/rx-7900-xt) | 20 GB | 800 GB/s | ~47 tok/s |
| [RX 9070 XT](/gpu/rx-9070-xt) | 16 GB | 640 GB/s | ~38 tok/s |
| [RX 7600 XT](/gpu/rx-7600-xt) | 16 GB | 288 GB/s | ~17 tok/s |
| [RX 6800 XT](/gpu/rx-6800-xt) | 16 GB | 512 GB/s | ~30 tok/s |

The 16 GB cards fit gpt-oss 20B, which our calculator puts at about 112 tok/s on the 9070 XT and 50 tok/s on the 7600 XT. The 7600 XT is a cheap way to get 16 GB, but its narrow memory bus makes it slow for its size.

## The catches

- **Support lists move.** A card that's supported today might not be in a future ROCm release, and the reverse. Check before you buy and before you upgrade.
- **Linux is the smoother path for ROCm.** Windows support exists but lags.
- **Some tools are CUDA-first.** Many server engines, training scripts and image tools assume NVIDIA. They may work on ROCm with effort, or not at all. If you want to experiment widely, NVIDIA is still easier.
- **Prompt processing** is generally slower than on comparable NVIDIA cards, which matters for long documents. See [prompt processing vs generation speed](/learn/prompt-processing-vs-generation-speed).
- **Mixing AMD and NVIDIA** in one machine is possible with Vulkan, but more fiddly than sticking to one brand.

## AMD or a used 3090?

If you already own a Radeon card, use it: it'll run the same models at similar speeds for chat. If you're buying for AI from scratch, a [used RTX 3090](/learn/used-rtx-3090-buying-guide) is still the safer choice because everything supports it. The 7900 XTX is a fair alternative if you find a good price, mostly use llama.cpp-based tools, and are happy on Linux.

Check your own card on [every GPU](/gpu), or see AMD's integrated chips in [mini PCs and Strix Halo](/learn/mini-pc-and-strix-halo-for-ai).
