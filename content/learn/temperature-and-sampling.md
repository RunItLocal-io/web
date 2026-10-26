---
title: "Temperature, top-p and min-p: the sampling settings that matter"
description: What temperature and the other sampling settings do, which ones are worth changing for local models, and how to set them in Ollama.
track: basics
order: 15
date: 2026-10-26
models: qwen3-8b, qwen3-14b, gpt-oss-20b
---
**Most of the time, leave the sampling settings at what the model's makers recommend.** The one worth knowing is temperature: lower for facts, code and scripts; a bit higher for brainstorming and creative writing. The rest are fine-tuning, and the wrong values do more harm than good.

## What sampling is

For each new token, the model scores every token in its vocabulary. Sampling is how one of them gets picked. Always taking the top choice sounds sensible but tends to make text repetitive and loopy. Picking with a bit of randomness reads more naturally. The settings control how much randomness, and which candidates are allowed.

## The settings

| Setting | What it does | Typical range |
|---|---|---|
| Temperature | How adventurous the choice is. Lower is more predictable | 0 to 1.0 |
| Top-p | Only consider the most likely tokens that together add up to this share of the probability | 0.8 to 1.0 |
| Top-k | Only consider this many of the most likely tokens | 20 to 40 |
| Min-p | Drop tokens much less likely than the top choice | 0 to 0.1 |
| Repeat penalty | Push the model away from repeating recent text | 1.0 (off) to 1.1 |
| Seed | Fixes the randomness so the same prompt gives the same answer | Any number |

**Temperature** is the big one. At 0, the model always picks its top choice: consistent, sometimes repetitive. Around 0.6 to 0.8 is normal chat. Above 1, answers get looser and, eventually, less coherent.

**Top-p, top-k and min-p** trim off unlikely tokens before picking, so a higher temperature doesn't wander into nonsense. You rarely need more than one of them doing serious work.

**Repeat penalty** helps older or smaller models that loop. On current models it's often best left off or very low, because code and structured text repeat on purpose.

## What the makers recommend

Labs publish settings their models were tuned for. A few we know well:

| Model | Recommended |
|---|---|
| Qwen3, thinking on | temperature 0.6, top-p 0.95, top-k 20 |
| Qwen3, thinking off | temperature 0.7, top-p 0.8, top-k 20 |
| gpt-oss | temperature 1.0, top-p 1.0 |

The Qwen team also advises against temperature 0 in thinking mode, because it can make the model repeat itself endlessly. For other models, check the model card. See [how to read a model card](/learn/how-to-read-a-model-card).

Ollama usually ships a model's recommended defaults with it. To see what yours uses:

```sh
ollama show qwen3:8b --parameters
```

## When to change them

- **Scripts, extraction, JSON, classification:** lower the temperature (around 0 to 0.3, within what the model tolerates) and set a seed, so runs are repeatable. See [structured output with Ollama](/learn/structured-output-json-with-ollama).
- **Code:** stay at the recommended values or slightly lower. Very low temperature doesn't make code more correct, just more repetitive.
- **Brainstorming and fiction:** raise temperature a little, around 0.8 to 1.0, with min-p around 0.05 to keep it coherent.
- **The model loops or repeats a phrase:** first check it's using the recommended settings and has enough context (see [context length and the KV cache](/learn/context-length-and-kv-cache)). A short context is a common cause. Only then add a small repeat penalty.

## Setting them in Ollama

In a chat session:

```sh
/set parameter temperature 0.6
```

The same works for `top_p`, `top_k`, `min_p`, `repeat_penalty` and `seed`. To make them permanent, put them in a Modelfile:

```
FROM qwen3:8b
PARAMETER temperature 0.6
PARAMETER top_p 0.95
PARAMETER top_k 20
```

Then `ollama create my-qwen -f Modelfile`. The Modelfile is the same one you'd use for a system prompt; see [what a system prompt is](/learn/what-is-a-system-prompt).

Through the API, pass them in the request's `options`. In Open WebUI and LM Studio they're in each model's advanced settings.

## What sampling doesn't change

Sampling picks between the words the model already considers likely. It can't make a model smarter, give it facts it doesn't know, or make it faster. Speed is set by your hardware and the model's size; see [tokens per second explained](/learn/tokens-per-second-explained). If answers are consistently weak, the fix is a bigger model, not a different temperature.

Here's what bigger models cost in speed on a 16 GB card, from our calculator:

{{lineup rtx-4060-ti 16}}

On that card, [Qwen3 14B](/model/qwen3-14b) is about 17 tok/s and [gpt-oss 20B](/model/gpt-oss-20b) about 50 tok/s (estimates). Both will help more than any sampling setting.
