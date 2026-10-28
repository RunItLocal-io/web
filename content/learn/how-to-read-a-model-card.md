---
title: "How to read a model card: what matters for running it locally"
description: Parameters, active parameters, context, license, quant files and benchmarks. Which parts of a model card tell you if it will run on your hardware.
track: models
order: 22
date: 2026-10-26
models: gpt-oss-120b, qwen3-30b-a3b, gemma-3-12b
---
**A model card is the page that comes with a model, usually on Hugging Face or the maker's site. For running it at home, five lines matter: total parameters, active parameters, context length, license, and which file formats exist.** Most of the rest is marketing or research detail you can skip.

## Parameters: how much memory

The headline number, like 8B or 70B, is the total parameter count in billions. It sets how much memory the model needs.

At the 4-bit size most people run, budget about **0.6 GB per billion parameters**, plus 1 to 2 GB for context. So:

| Parameters | Rough memory at 4-bit | Example |
|---|---|---|
| 8B | ~6 GB | [Qwen3 8B](/model/qwen3-8b) |
| 14B | ~10 GB | [Qwen3 14B](/model/qwen3-14b) |
| 32B | ~22 GB | [Qwen3 32B](/model/qwen3-32b) |
| 70B | ~45 GB | [Llama 3.3 70B](/model/llama-3-3-70b) |

The full method is in [how much VRAM you need](/learn/how-much-vram-do-you-need).

## Active parameters: how fast

Mixture-of-experts models list two numbers. gpt-oss 120B, for example, is **117B total and 5.1B active**. Qwen3 30B-A3B is 30B total, 3B active, and the "A3B" in the name means exactly that.

Total sets memory. Active sets speed, because generating a token reads only the active weights. That's why on a 128 GB M4 Max our calculator puts [gpt-oss 120B](/model/gpt-oss-120b) at about 66 tok/s while dense Llama 3.3 70B gets about 7. See [mixture of experts explained](/learn/mixture-of-experts-explained).

If the card shows only one number, it's dense: every parameter is active.

## Context length

The longest input the model was trained to handle, in tokens. 32K is about a long report; 128K is a short book. Two things to know:

- **Your runtime may use less by default.** Ollama starts with a shorter context to save memory. See [increase Ollama context length](/learn/increase-ollama-context-length).
- **Some cards list an extended figure.** Qwen3 says "32K, 128K with YaRN", meaning 32K natively and 128K with a setting switched on.

## License

Look for a license name near the top or in the file list. Apache 2.0 and MIT are simple. Names like "Community License" or "Terms of Use" mean custom terms you should read before using it in a product. See [open model licenses explained](/learn/open-model-licenses-explained).

## Modalities

Does it take images, audio or only text? [Gemma 3 12B](/model/gemma-3-12b) reads images; gpt-oss is text only. Cards often say "multimodal" or "vision". Check your runtime supports that part too.

## Base, instruct or chat

Many releases come in two versions. **Base** models just continue text and are mostly for fine-tuning. **Instruct** or **chat** versions answer questions. For chat, you want instruct. Ollama's default tags are already the instruct versions.

## File formats and quants

The official files are usually full-precision **safetensors**, often two to four times bigger than what you'd run. For Ollama, llama.cpp and LM Studio you want a **GGUF**, often from a community uploader, in sizes like Q4_K_M or Q8_0. Mac users may also see **MLX** versions. See [quantization explained](/learn/quantization-explained).

Watch for hardware notes, but read them as what the maker supports, not always what runs. NVIDIA's model card for Nemotron 3.5 Bolt lists only Ada and Blackwell GPUs, yet llama.cpp ran the same GGUF file on our older Pascal and Volta cards ([our results](/learn/nemotron-3-5-bolt-74b-on-two-mining-cards)).

## Recommended settings

Good cards list a suggested temperature and other sampling settings, and sometimes different ones for thinking mode. If a model rambles or repeats, check these first.

## Benchmarks: read with care

Every card has a table where the new model wins. Treat it as a rough guide:

- The maker picks which tests to show and which rivals to compare against.
- Scores are often for the full-precision model, not the 4-bit file you'll run.
- Benchmark questions can leak into training data.

A few prompts from your own work tell you more. Our [new model checklist](/learn/new-model-checklist) shows how in an evening.

## The short checklist

1. Total parameters × 0.6: does it fit your memory?
2. Active parameters: how fast will it be?
3. License: can you use it the way you want?
4. Is there a GGUF or an Ollama tag?
5. Text only, or images too?

Then check your card's page for the models we track: [every GPU](/gpu).
