---
title: "Thinking models explained: reasoning mode, /think and effort levels"
description: What reasoning mode does, when it's worth the wait, how to turn it on and off in Qwen3 and gpt-oss, and what it costs in speed and context.
track: basics
order: 13
date: 2026-10-26
models: qwen3-8b, qwen3-14b, qwen3-32b, gpt-oss-20b, gpt-oss-120b
---
**A thinking model writes out its reasoning before it answers.** That makes it noticeably better at math, logic, code and multi-step questions, and slower at everything. The trick is to use thinking when the question is hard and switch it off when it isn't.

## What "thinking" actually is

There's no separate brain. The model generates a stretch of reasoning text first, usually hidden or collapsed in your chat app, working through the problem step by step. Then it writes the answer, using that reasoning as context. It was trained to do this, so the reasoning is genuinely useful, not just padding.

Because thinking is ordinary generated text, it costs exactly what generated text costs: **time, at your tok/s, and room in the context window.**

## Which models think

Of the models we track:

| Model | Thinking | How you control it |
|---|---|---|
| Qwen3 4B, 8B, 14B, 32B, 30B-A3B | On or off | Per message, or a setting in your tool |
| gpt-oss 20B, 120B | Always on | Effort level: low, medium or high |
| Gemma 3, Llama 3.3 70B | No thinking mode | Ask it to "think step by step" in the prompt |

## Turning it on and off

**Qwen3.** Qwen3 is a hybrid: it thinks by default, and you can switch per message by adding `/think` or `/no_think` to your message. Ollama also has a setting to turn thinking off for the whole session; from the command line:

```sh
ollama run qwen3:8b --think=false
```

In Open WebUI and LM Studio, look for a reasoning or thinking toggle in the chat or model settings; the label varies by version.

**gpt-oss.** It always reasons, but you choose how much: low, medium or high. Low is quick and fine for everyday questions; high is for hard problems and takes much longer. Apps that support gpt-oss expose this as a reasoning effort setting. Without one, you can put `Reasoning: high` in the system prompt, which is the format gpt-oss was trained to read. See [what a system prompt is](/learn/what-is-a-system-prompt).

## What it costs in time

A thinking model might write a few hundred reasoning tokens on an easy question and a few thousand on a hard one. Time to the first word of the answer is roughly:

> **thinking tokens ÷ tok/s**

Using our calculator's estimates for an RTX 3090:

| Model | Estimated speed | 1,500 thinking tokens |
|---|---|---|
| [Qwen3 32B](/model/qwen3-32b) | ~26 tok/s | about a minute |
| [Qwen3 14B](/model/qwen3-14b) | ~55 tok/s | about 27 seconds |
| [gpt-oss 20B](/model/gpt-oss-20b) | ~160 tok/s | about 9 seconds |

This is why fast mixture-of-experts models pair so well with thinking: gpt-oss 20B can think a lot and still feel responsive. A slow dense model with thinking on can feel stuck. See [tokens per second explained](/learn/tokens-per-second-explained).

{{lineup rtx-3090}}

## What it costs in context

The reasoning goes into the context window while the model writes. On a long, hard problem it can be thousands of tokens, which needs KV cache memory (see [context length and the KV cache](/learn/context-length-and-kv-cache)). If your context is short, the model can run out of room mid-thought and lose the start of your question. Give thinking models a bigger context than you'd give the same model without it.

Good chat tools drop the old reasoning from earlier turns, so it doesn't pile up over a long conversation.

## When to use it

**Turn it on for:**

- Math and logic problems
- Debugging, and code that has to be right
- Planning, comparisons, and anything with several steps
- Questions where you'd want a person to "show their work"

**Turn it off, or use low effort, for:**

- Chat, rewriting and summaries
- Quick facts and lookups
- Scripts and batch jobs where you need many fast answers
- Voice assistants, where a long pause feels broken

## Tips

- **Read the reasoning when an answer looks wrong.** It often shows exactly where the model went off track.
- **Use the sampling settings the model's makers recommend.** Qwen3 suggests different settings for thinking and non-thinking modes. See [temperature and sampling](/learn/temperature-and-sampling).
- **A small model that thinks can beat a bigger one that doesn't** on reasoning puzzles, but not on knowledge. Thinking doesn't add facts it never learned.

For picking a model by task, see [the best local LLM for reasoning and math](/learn/best-local-llm-for-reasoning-and-math).
