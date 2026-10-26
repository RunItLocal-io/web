---
title: The best local LLM for 16 GB of VRAM (4060 Ti, 5060 Ti, 5080)
description: What to run on a 16 GB card like the RTX 4060 Ti 16 GB, 5060 Ti, 5080, RX 9070 XT or a used Tesla P100, with estimated speeds and what doesn't fit.
track: models
order: 5
date: 2026-10-26
models: gpt-oss-20b, qwen3-14b, gemma-3-12b
---
16 GB is a sweet spot that's easy to underrate. It's the smallest size that fits **gpt-oss 20B**, a mixture-of-experts model that reasons well and runs fast, and it gives the 12B to 14B models plenty of room for long conversations.

## The pick: gpt-oss 20B

```sh
ollama run gpt-oss:20b
```

OpenAI's smaller open model is about 14 GB at the size Ollama downloads. It has 21B parameters but only about 3.6B work on each token (see [mixture of experts explained](/learn/mixture-of-experts-explained)), so it's much faster than a dense model of the same size. It's good at:

- step-by-step reasoning, with an adjustable effort level of low, medium or high,
- tool calling and simple agents,
- quick, direct answers to technical questions.

It's text only, and its creative writing can sound flat. It's also a tight fit: about 14 GB of weights leaves around 2 GB for context on a 16 GB card.

## For long context and code: Qwen3 14B

```sh
ollama run qwen3:14b
```

At about 9.3 GB, Qwen3 14B leaves 6 GB for the conversation, enough for long documents or several source files. It's a strong coder for its size and has its own thinking mode (`/think` and `/no_think`). Many people with 16 GB keep both this and gpt-oss 20B, and switch by task.

## For images: Gemma 3 12B

```sh
ollama run gemma3:12b
```

The pick if you want to ask questions about screenshots, photos and charts, or write in languages other than English. With 16 GB it has room to spare for its 128K context. See [the best local vision model](/learn/best-local-vision-model).

## Card by card

16 GB cards range from slow to very fast, because their memory bandwidth differs by more than three times:

| Card | Bandwidth | gpt-oss 20B | Qwen3 14B |
|---|---|---|---|
| [RTX 4060 Ti 16 GB](/gpu/rtx-4060-ti) | 288 GB/s | ~50 tok/s | ~17 tok/s |
| [RTX 5060 Ti 16 GB](/gpu/rtx-5060-ti) | 448 GB/s | ~78 tok/s | ~26 tok/s |
| [RX 7800 XT](/gpu/rx-7800-xt) | 624 GB/s | ~109 tok/s | ~37 tok/s |
| [RX 9070 XT](/gpu/rx-9070-xt) | 640 GB/s | ~112 tok/s | ~38 tok/s |
| [Tesla P100](/gpu/tesla-p100) | 732 GB/s | ~128 tok/s | ~43 tok/s |
| [RTX 5070 Ti](/gpu/rtx-5070-ti) | 896 GB/s | ~157 tok/s | ~53 tok/s |
| [RTX 5080](/gpu/rtx-5080) | 960 GB/s | ~168 tok/s | ~57 tok/s |

All are estimates from our calculator. Notice the 4060 Ti 16 GB: it fits the same models, but it's the slowest card here. A used Tesla P100, a 2016 data-center card that sells for under $100, is more than twice as fast at generating text. It has catches (no fans, older software support), covered in our [Tesla P100 guide](/learn/tesla-p100-for-local-llms).

## The RTX 5060 Ti 16 GB, by the numbers

{{lineup rtx-5060-ti 16}}

## What doesn't fit

The 30B class doesn't. **Gemma 3 27B** needs about 19 GB and **Qwen3 30B-A3B** about 21 GB. Qwen3 30B-A3B is tempting because it's fast, but all 30B of its weights have to be in memory even though only 3B are used per token. On 16 GB it spills onto the CPU.

## Tips for 16 GB

- **Give gpt-oss 20B a short context, or Qwen3 14B a long one.** If you need to paste in long documents, Qwen3 14B or Gemma 3 12B is the safer pick.
- **Check it's on the GPU.** Run `ollama ps`. If it doesn't say `100% GPU`, something spilled.
- **Laptops:** a laptop RTX 4090 also has 16 GB, but less bandwidth than the desktop cards above.

## When you outgrow 16 GB

The next step is 24 GB for the 30B class: see [the best local LLM for 24 GB](/learn/best-local-llm-for-24gb-vram). Or go sideways for less money: two used P100s give 32 GB for about $450 to $650 all in, our "Best value" build on the [builds page](/builds). On our rack that pair measured **53 tok/s** on Qwen3.6-35B-A3B. More on that in [32 GB and up](/learn/best-local-llm-for-32gb-and-up).
