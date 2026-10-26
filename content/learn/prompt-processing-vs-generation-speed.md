---
title: "Prompt processing vs generation speed: prefill and decode explained"
description: Why a local model can take ages to start answering a long prompt and then write quickly, what limits each speed, and which hardware helps.
track: basics
order: 8
date: 2026-10-26
models: qwen3-30b-a3b, qwen3-32b
---
**A model works in two phases with two different speed limits.** First it reads your whole prompt (prompt processing, or prefill). Then it writes the answer one token at a time (generation, or decode). Prefill is limited by compute. Decode is limited by memory bandwidth. That's why a card can be great at one and poor at the other.

## The two phases

**Prefill** happens once per message. The model takes every token you sent, plus anything it hasn't seen yet in the conversation, and processes them all together, in parallel. That's a lot of math on a lot of tokens at once, so it's limited by how much raw compute the chip has. On a GPU it usually runs at hundreds to thousands of tokens per second.

**Decode** is the answer. Each new token depends on the one before it, so the model can only make one at a time, and for each one it reads all of its active weights from memory. The math is light; waiting for memory is the slow part. So decode speed tracks memory bandwidth, as explained in [why memory bandwidth sets LLM speed](/learn/memory-bandwidth-and-llm-speed).

## What you actually feel

- **Time to first token** is mostly prefill: prompt length ÷ prefill speed. A one-line question starts instantly. A 30,000-token document can take a noticeable while.
- **The rest of the answer** is decode: answer length ÷ decode speed.

For normal chat, prefill is so quick you never notice it, and decode is all that matters. For pasting long documents, big codebases, or agents that send huge prompts on every step, prefill can be most of your wait.

## Which hardware is good at which

| Hardware | Prefill | Decode |
|---|---|---|
| Recent NVIDIA cards (tensor cores) | Very fast | Set by bandwidth |
| Older data-center cards like the Tesla P100 | Much slower: no tensor cores | Fast for the price: 732 GB/s |
| Apple silicon Macs | Slower than a comparable NVIDIA card | Good, with big memory |
| CPU only | Slow | Slow, set by RAM bandwidth |

We see this on our own rack. The 2016 Tesla P100s are quick at writing (two of them run Qwen3.6-35B-A3B at **53 tok/s**, measured), but they're slow to read a long prompt compared with RTX cards. Chat feels fine. A 50-page document takes a while before the first word. See [the P100 for local LLMs](/learn/tesla-p100-for-local-llms).

Our calculator's estimates are for decode only. Here's the P100:

{{lineup tesla-p100}}

## Why the second message is faster

Engines like llama.cpp and Ollama keep the conversation in the KV cache (see [context length and the KV cache](/learn/context-length-and-kv-cache)). When you send a follow-up, they only need to prefill the new part, not the whole chat again. So the slow start after pasting a document usually happens once, and follow-up questions about it start quickly.

This breaks if something changes the start of the conversation, like editing the system prompt or a tool that rewrites earlier messages. Then the engine has to read everything in again.

## Things that slow prefill down

- **Spilling onto the CPU.** Layers in system RAM are slow at both phases. See [CPU offloading explained](/learn/cpu-offloading-explained).
- **Very long prompts.** Prefill gets slower per token as the context grows, because each token attends to everything before it.
- **Small batch settings.** Engines process the prompt in chunks. Defaults are sensible; leave them unless you know why you're changing them.

## How to measure both

In Ollama, run with `--verbose`:

```sh
ollama run qwen3:30b --verbose
```

**Prompt eval rate** is prefill. **Eval rate** is decode. For a fair prefill number, paste in something long; a one-line prompt is too short to measure.

With llama.cpp, `llama-bench` measures them separately. Our [leaderboard](/leaderboard) test uses it to record prefill at 512, 4,096 and 16,384 tokens, and decode on 128 new tokens, so you can see how a rig handles both. The method is in [what the leaderboard measures](/learn/what-the-leaderboard-measures).

## Which number to care about

- **Chat, writing, short questions:** decode. Use the estimates on [every GPU](/gpu).
- **Long documents, coding agents, RAG:** both. Favor cards with tensor cores, and keep prompts tight.
- **Batch jobs with short inputs:** decode, and how many jobs you can run at once.
