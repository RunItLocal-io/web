---
title: "Intel Arc for local AI: can the B580 and A770 run LLMs?"
description: How Intel Arc cards run local LLMs, which tools support them, estimated speeds for the B580 and A770 16 GB, and the software catches to know first.
track: hardware
order: 9
date: 2026-10-26
models: qwen3-8b, qwen3-14b, gpt-oss-20b
---
**Intel Arc cards can run local LLMs, and on paper they're good value.** The A770 16 GB and the B580 12 GB have more memory or bandwidth than NVIDIA's entry-level cards, like the RTX 4060 with 8 GB. The trade-off is software: fewer tools support Arc, setup takes more effort, and real speeds often trail what the hardware should manage.

## What the hardware offers

| Card | Memory | Bandwidth | Qwen3 14B, estimated |
|---|---|---|---|
| [Arc A770](/gpu/arc-a770) | 16 GB (8 GB version exists) | 560 GB/s | ~33 tok/s |
| [Arc B580](/gpu/arc-b580) | 12 GB | 456 GB/s | ~27 tok/s |
| [Arc B570](/gpu/arc-b570) | 10 GB | 380 GB/s | doesn't fit |
| [Arc A750](/gpu/arc-a750) | 8 GB | 512 GB/s | doesn't fit |
| [RTX 3060 12 GB](/gpu/rtx-3060) | 12 GB | 360 GB/s | ~21 tok/s |

Those estimates come from our calculator, which assumes the software uses the card's memory bandwidth well. On Arc that's less certain than on NVIDIA, so treat them as a ceiling.

The **A770 16 GB** is the interesting one: 16 GB fits gpt-oss 20B, which our calculator puts at about 98 tok/s.

{{lineup arc-a770 16}}

## How to run models on Arc

There are a few routes, and which is best changes as drivers and tools improve:

- **Vulkan.** llama.cpp's Vulkan backend works on Arc, and LM Studio offers a Vulkan runtime. This is the simplest way to start, on Windows or Linux.
- **SYCL.** llama.cpp also has a SYCL backend, built on Intel's oneAPI toolkit. It can be faster than Vulkan but takes more setup.
- **Intel's own builds.** Intel has published optimized builds and containers of popular tools for its GPUs. Check Intel's current documentation for what's maintained.

Ollama's support for Intel GPUs has varied between versions. **Check the current Ollama documentation for Arc support before you rely on it.** If it isn't there, LM Studio with Vulkan is the easy fallback. See [Ollama vs llama.cpp vs LM Studio](/learn/ollama-vs-llama-cpp-vs-lm-studio).

## The catches

- **Software support is the narrowest of the three GPU brands.** Many AI tools assume NVIDIA's CUDA. Some have Intel support, some don't.
- **Speeds vary by backend and driver.** The same card can be much faster on one setup than another. Update drivers before judging it.
- **Resizable BAR matters.** Arc cards perform poorly without it. Make sure it's enabled in your motherboard's settings. Older PCs, including many used workstations, may not support it, which makes Arc a poor fit for an old Xeon box.
- **The 8 GB A770.** Check listings carefully: the 16 GB version is the one you want.
- **Multi-GPU** with Arc is less well trodden than with NVIDIA.

## Should you buy one for AI?

- **Yes, if** you want a new card with warranty, on a budget, and you're comfortable trying a couple of backends. The B580 with 12 GB runs the same models as an RTX 3060 12 GB, with more bandwidth on paper.
- **Maybe, if** you want 16 GB cheaply: compare the A770 16 GB against a [Tesla P100](/learn/tesla-p100-for-local-llms), which has much faster memory but needs a shroud, and against 16 GB cards from NVIDIA and AMD.
- **No, if** you want everything to just work, or plan to use tools beyond chat. The [RTX 3060 12 GB](/learn/rtx-3060-12gb-for-ai) is the safe starter, and a [used RTX 3090](/learn/used-rtx-3090-buying-guide) is the safe step up.

Already own an Arc card? Start with [Qwen3 8B](/model/qwen3-8b) or [Qwen3 14B](/model/qwen3-14b) in LM Studio, then [send us your numbers](/articles#share). Real results help others decide.
