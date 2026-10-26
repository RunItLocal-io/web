---
title: The best local LLM for reasoning and math
description: Which open models reason best through math, logic and multi-step problems on 8 GB to 64 GB+, how thinking mode works, and why speed matters more than you'd expect.
track: models
order: 10
date: 2026-10-26
models: gpt-oss-20b, gpt-oss-120b, qwen3-14b, qwen3-32b, qwen3-8b
---
For math, logic puzzles and multi-step problems, the models to use are the ones that **think before they answer**. Qwen3 and gpt-oss both write out their working first, then give the answer. That makes them much more accurate on hard problems, and much slower, because the thinking is extra text the model has to generate.

## Picks by memory

| Memory | Pick | Command | Notes |
|---|---|---|---|
| 8 GB | [Qwen3 8B](/model/qwen3-8b) | `ollama run qwen3:8b` | Thinking mode on a small card |
| 12 GB | [Qwen3 14B](/model/qwen3-14b) | `ollama run qwen3:14b` | A clear step up in reasoning |
| 16 GB | [gpt-oss 20B](/model/gpt-oss-20b) | `ollama run gpt-oss:20b` | Strong reasoning, and fast |
| 24 GB | [Qwen3 32B](/model/qwen3-32b) or gpt-oss 20B | `ollama run qwen3:32b` | 32B for careful work, 20B for speed |
| 64 GB+ | [gpt-oss 120B](/model/gpt-oss-120b) | `ollama run gpt-oss:120b` | The strongest reasoning you can run at home |

Gemma 3 and Llama 3.3 don't have a thinking mode. They're good at writing and knowledge, but for math and logic, Qwen3 and gpt-oss do better at the same size.

## How to turn thinking on

- **Qwen3:** the model thinks by default. Add `/no_think` to a message to skip it for simple questions, and `/think` to turn it back on.
- **gpt-oss:** always reasons, with an effort level of low, medium or high. Higher effort means longer thinking and better answers on hard problems. Many apps expose this as a setting; you can also ask for it in the system prompt.

More on how this works in [thinking models explained](/learn/thinking-models-explained).

## Why speed matters more here

A thinking model can write a thousand or more tokens of working before it starts the answer. At reading speed that's fine for chat, but for reasoning it's the difference between waiting seconds and waiting minutes.

Some arithmetic using our calculator's estimates on a 24 GB RTX 3090, for a problem that takes 2,000 tokens of thinking:

| Model | Estimated speed | Time to think 2,000 tokens |
|---|---|---|
| gpt-oss 20B | ~164 tok/s | about 12 seconds |
| Qwen3 30B-A3B | ~164 tok/s | about 12 seconds |
| Qwen3 32B | ~26 tok/s | about 77 seconds |

That's why gpt-oss 20B is such a good reasoning pick on 16 to 24 GB: it's a [mixture-of-experts](/learn/mixture-of-experts-explained) model that only works a few billion parameters per token, so it can afford to think. Use Qwen3 32B when you'd rather wait for a more careful answer.

{{lineup rtx-3090}}

## Give it room to think

- **Raise the context length.** Thinking uses context. If the conversation plus the model's working goes past the context limit, it forgets the start of the problem. Ollama's default is short; see [increase Ollama's context length](/learn/increase-ollama-context-length).
- **Ask for the steps.** "Show your working, then give the final answer on its own line" makes the result easier to check.
- **Ask it to check.** "Substitute your answer back into the original equation" catches a surprising number of mistakes.

## Know the limits

- **Arithmetic on big numbers is unreliable.** Models predict text, they don't calculate. For exact numbers, ask it to write a short Python script and run that instead.
- **Long chains drift.** On very long problems, small models lose track. Break the problem into parts.
- **It will sound sure when it's wrong.** Check anything that matters, especially from 8B and 14B models.

## Good uses

- Working through homework-style math and physics problems step by step, and explaining each step.
- Logic puzzles, scheduling constraints, and "what am I missing" checks on a plan.
- Reviewing a spreadsheet formula or a proof for errors.
- Debugging code, where reasoning catches more than a quick answer. See [the best local LLM for coding](/learn/best-local-llm-for-coding).

Want to know what your own machine can run? Check [every GPU](/gpu), or for the big models, see [32 GB and up](/learn/best-local-llm-for-32gb-and-up) and [64 GB+ Macs](/learn/best-local-llm-for-mac-64gb-and-up).
