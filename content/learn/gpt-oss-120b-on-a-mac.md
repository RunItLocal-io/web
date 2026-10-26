---
title: "Running gpt-oss 120B on a Mac: how much memory and how fast"
description: gpt-oss 120B needs about 67 GB for the GPU, so a 96 or 128 GB Mac. Which chips run it well, estimated speeds, and how to set it up.
track: models
order: 19
date: 2026-10-26
models: gpt-oss-120b, gpt-oss-20b
---
**You need a Mac with 96 GB of unified memory or more.** gpt-oss 120B is about a 65 GB download and needs roughly 67 GB for the GPU, and macOS gives the GPU about three quarters of memory on big Macs. A 64 GB Mac falls short. On a 96 or 128 GB Max or Ultra chip it runs surprisingly fast.

## Why it suits Macs

gpt-oss 120B is a [mixture-of-experts](/learn/mixture-of-experts-explained) model: 117B parameters in total, but only about 5.1B work on each token. That means it needs a lot of memory, which Macs have, but reads only a few gigabytes per token, so it doesn't need a GPU's bandwidth to be quick.

Compare it with Llama 3.3 70B, a dense model, on the same 128 GB M4 Max. Our calculator estimates **about 66 tok/s for gpt-oss 120B and about 7 tok/s for Llama 3.3 70B.** The bigger model is nearly ten times faster.

## Which Macs run it

| Mac | Usable for GPU | gpt-oss 120B, estimated |
|---|---|---|
| Any chip, 64 GB | ~48 GB | does not fit |
| [M2 Max](/gpu/apple-m2-max), 96 GB | ~72 GB | ~48 tok/s |
| [M3 Ultra](/gpu/apple-m3-ultra), 96 GB | ~72 GB | ~99 tok/s |
| [M5 Max](/gpu/apple-m5-max), 128 GB | ~96 GB | ~56 tok/s |
| [M4 Max](/gpu/apple-m4-max), 128 GB | ~96 GB | ~66 tok/s |
| [M2 Ultra](/gpu/apple-m2-ultra), 128 GB | ~96 GB | ~97 tok/s |

Speed follows memory bandwidth, so Ultra chips are roughly twice as fast as Max chips. Pro chips top out at 64 GB, so they're out.

96 GB works but is tight: about 5 GB left for context once the model loads. **128 GB is the comfortable size**, with room for long conversations and other apps.

{{lineup apple-m4-max 128}}

## Setting it up

Install [Ollama](/learn/how-to-run-ai-locally), then:

```sh
ollama run gpt-oss:120b
```

The first run downloads about 65 GB, so allow time. Loading into memory takes a little while too; after that it stays loaded until it's been idle for a while.

LM Studio is the other easy option. It can run MLX builds, Apple's own format, which are often a little faster on Macs. See [Ollama vs llama.cpp vs LM Studio](/learn/ollama-vs-llama-cpp-vs-lm-studio).

## Things to know

**Close other big apps.** The model and macOS share the same memory. A browser with fifty tabs is memory the model can't use.

**Long prompts are slow to read.** Macs generate quickly but process long prompts much more slowly than an NVIDIA card. Chatting is fine. Pasting a long document means a noticeable wait before the first word.

**Context costs memory.** On 96 GB, keep the context length modest. See [how much VRAM you need](/learn/how-much-vram-do-you-need).

**Set the reasoning effort.** gpt-oss lets you choose low, medium or high effort. Low is quick for everyday questions; high is for hard problems and takes longer before it answers.

**It's text only.** For images you need a different model, such as [Gemma 3 27B](/model/gemma-3-27b).

## Only have 64 GB?

You can raise macOS's GPU memory limit (see [Macs for local LLMs](/learn/mac-for-local-llms)), but squeezing a 65 GB model into a 64 GB machine isn't realistic. Good options instead:

- [gpt-oss 20B](/model/gpt-oss-20b), the smaller sibling, at about 70 tok/s on an M1 Max. Fast, with the same reasoning style.
- [Qwen3 30B-A3B](/model/qwen3-30b-a3b), at a similar speed and with more general knowledge.

Both leave plenty of room. Our "Quiet" build, a used 64 GB Mac Studio for about $1,500 to $2,100, runs them well; see the [builds page](/builds).

## Mac or PC for this model?

To fit gpt-oss 120B on graphics cards you need about 67 GB across several of them, which means three or more 24 GB cards, a big power supply and a loud case. A 128 GB Mac does it silently at about 100 W. For this model, the Mac is the easy choice. For anything that fits in 24 GB, a PC with a [used RTX 3090](/learn/used-rtx-3090-buying-guide) is faster for the money.
