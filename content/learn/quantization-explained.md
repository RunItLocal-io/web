---
title: "Quantization explained: Q4_K_M vs Q8 vs FP16"
description: What the letters and numbers in model file names mean, how much quality you lose at each size, and which one to download.
track: basics
order: 2
date: 2026-10-26
models: qwen3-8b, qwen3-32b
---
Open models are released in 16-bit precision: every parameter takes two bytes. **Quantization** stores them in fewer bits, so the model gets smaller and faster with surprisingly little loss in quality. It's the reason a 32B model fits on a gaming card at all.

## What the names mean

You'll see files named like `Qwen3-32B-Q4_K_M.gguf`. The important part is the end:

| Name | Bits per weight | 8B model | 32B model | Quality |
|---|---|---|---|---|
| FP16 / BF16 | 16 | 16 GB | 64 GB | The original |
| Q8_0 | 8.5 | 8.5 GB | 34 GB | Practically identical |
| Q6_K | 6.6 | 6.6 GB | 26 GB | Very hard to tell apart |
| Q5_K_M | 5.7 | 5.7 GB | 23 GB | Excellent |
| **Q4_K_M** | **4.8** | **4.9 GB** | **20 GB** | **The sweet spot** |
| Q3_K_M | 3.9 | 4 GB | 16 GB | Noticeably worse |
| Q2_K | 3.4 | 3.4 GB | 13 GB | Only if nothing else fits |

- **The number** is roughly the bits per weight.
- **K** means a smarter scheme that gives important parts of the model more precision.
- **S, M, L** (small, medium, large) is how much extra precision those parts get.

Sizes are approximate. Real files vary a little by model.

## Which one to download

**Q4_K_M, unless you have room to spare.** It's what Ollama downloads by default, and for most uses you won't notice a difference from the original.

- **Spare memory?** Go up to Q5_K_M or Q6_K. Coding and math benefit a little.
- **Squeezed?** A bigger model at Q3 usually beats a smaller model at Q8. A 32B model at Q3 is generally smarter than a 14B at Q8.
- **Below Q3,** quality falls off quickly, unless the model was trained for it. Some new releases are trained to run at 2 bits and hold up far better than a regular model squeezed that small.

## Why smaller is also faster

Generating each token means reading the whole model from memory once. Half the bytes means roughly twice the speed. That's why quantization is the biggest speed lever you have, more than a faster processor. See [why memory bandwidth sets LLM speed](/learn/memory-bandwidth-and-llm-speed).

## Picking a quant in Ollama

The plain tag gets the default:

```sh
ollama run qwen3:8b
```

Most models also have tags for other sizes, listed on their page at ollama.com. For example:

```sh
ollama run qwen3:8b-q8_0
```

## Other formats you'll see

- **GGUF** is the format llama.cpp, Ollama and LM Studio use. The Q-names above are GGUF quants.
- **MLX** is Apple's format for Macs, sold as 4-bit or 8-bit.
- **AWQ, GPTQ, FP8** are for server engines like vLLM on newer NVIDIA cards.

If you're starting out, stick with GGUF through Ollama.
