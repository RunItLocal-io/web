---
title: "Tokens per second explained: what's a good speed for a local LLM?"
description: What tok/s means, how fast is fast enough for chat, coding and thinking models, and how to measure your own speed in Ollama.
track: basics
order: 7
date: 2026-10-26
models: qwen3-8b, qwen3-14b, qwen3-32b, qwen3-30b-a3b
---
**For chat, 10 tok/s is usable and 30 tok/s feels fast.** Above 30, the text appears faster than you can read it. For coding and thinking models you want more, because you're waiting for long answers, not reading along.

## What a token is

Models don't read words, they read tokens: common words are one token, longer or rarer words are split into pieces. In English, a token is roughly three quarters of a word, so **100 tokens is about 75 words**. Code, other languages and numbers usually take more tokens per word.

"Tokens per second" (tok/s) is how many of those the model writes each second.

## How fast is fast enough

These are the bands our calculator uses on every [GPU page](/gpu):

| Speed | Our label | What it feels like |
|---|---|---|
| 30 tok/s or more | Runs great | Faster than you can read |
| 10 to 30 tok/s | Usable | About reading speed |
| Under 10 tok/s | Slow | Works, but you wait |

People read about four to five words a second, which is around 6 tok/s. That's why even 10 tok/s keeps up with you in a chat. The trouble starts when you don't read along.

## Why you might want much more

A 500-word answer is about 650 tokens. How long you wait for the whole thing:

| Speed | 650-token answer |
|---|---|
| 10 tok/s | about 65 seconds |
| 30 tok/s | about 22 seconds |
| 100 tok/s | about 7 seconds |

That matters for:

- **Coding.** Answers are long and you regenerate often. Below about 20 tok/s it starts to drag. See [the best local LLM for coding](/learn/best-local-llm-for-coding).
- **Thinking models.** They can write hundreds or thousands of hidden reasoning tokens before the answer starts. At 15 tok/s, 1,500 thinking tokens is over a minute of silence. See [thinking models explained](/learn/thinking-models-explained).
- **Scripts and batch jobs.** Nobody is reading; total time is all that counts.

## Two speeds, not one

Every run has two speeds, and they're very different:

- **Prompt processing** (or prefill): how fast the model reads your input. On a GPU this is often hundreds or thousands of tok/s.
- **Generation** (or decode): how fast it writes. This is the number people quote, and the one our calculator estimates.

If you paste a long document, prompt processing decides how long you wait for the first word. Details in [prompt processing vs generation speed](/learn/prompt-processing-vs-generation-speed).

## What sets the speed

Generation speed is mostly **memory bandwidth ÷ the size of the model's active weights**. A bigger model or a slower card means fewer tok/s; a smaller quant or a mixture-of-experts model means more. The formula is in [why memory bandwidth sets LLM speed](/learn/memory-bandwidth-and-llm-speed).

Here's what that looks like on a 12 GB RTX 3060, from our calculator:

{{lineup rtx-3060}}

Qwen3 8B lands at about 38 tok/s (estimate), in the "runs great" band. Qwen3 14B is about 21 tok/s: smarter, still usable for chat, a bit slow for heavy coding. That's the usual trade, and it's why people with 24 GB cards keep both [Qwen3 30B-A3B](/model/qwen3-30b-a3b) (fast) and [Qwen3 32B](/model/qwen3-32b) (careful) around.

## Measure your own

In Ollama, add `--verbose` and it prints the timings after each answer:

```sh
ollama run qwen3:8b --verbose
```

Look for two lines: **prompt eval rate** (prompt processing) and **eval rate** (generation). Run the same question two or three times; the first run can include loading time. LM Studio shows tokens per second under each reply.

Your number will rarely match an estimate exactly. Long conversations get slower as the context grows, other programs using the GPU slow it down, and a model that spills onto the CPU slows down a lot. If your speed is far below what we estimate for your card, check [Ollama isn't using the CPU instead of the GPU](/learn/fix-ollama-using-cpu-instead-of-gpu).

## Where to go next

- Put your real number on the [leaderboard](/leaderboard), measured the same way as everyone else's.
- Check what your card should do on [every GPU](/gpu).
