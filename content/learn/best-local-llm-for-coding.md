---
title: The best local LLM for coding, by how much memory you have
description: Which open models are worth using for code on 8, 12, 16, 24 GB and up, what they're good and bad at, and how to wire them into your editor.
track: models
order: 3
date: 2026-10-26
models: qwen3-8b, qwen3-14b, gpt-oss-20b, qwen3-32b, gpt-oss-120b
---
A local model won't replace a frontier cloud model for long, autonomous coding sessions. It's very good at the everyday part: explaining code, writing functions and tests, reviewing a diff, and answering "how do I do X in Y". And your code never leaves your machine.

## Picks by memory

| Memory | Pick | Command | Good for |
|---|---|---|---|
| 8 GB | [Qwen3 8B](/model/qwen3-8b) | `ollama run qwen3:8b` | Explaining code, small functions, shell one-liners |
| 12 GB | [Qwen3 14B](/model/qwen3-14b) | `ollama run qwen3:14b` | Real help with functions and reviews |
| 16 GB | [gpt-oss 20B](/model/gpt-oss-20b) | `ollama run gpt-oss:20b` | Reasoning through bugs, tool use |
| 24 GB | [Qwen3 32B](/model/qwen3-32b) | `ollama run qwen3:32b` | The strongest single-card coder here |
| 64 GB+ | [gpt-oss 120B](/model/gpt-oss-120b) | `ollama run gpt-oss:120b` | Close to cloud quality on hard problems |

Dedicated coding models are released often, and many are worth trying at the same sizes. These general models are a reliable starting point.

## Speed matters more for code

Code answers are long, and you often regenerate. Below about **20 tok/s** it starts to feel slow. That's why on a 24 GB card many people keep two models:

- **Qwen3 30B-A3B** (`qwen3:30b`) for fast back-and-forth, at around 160 tok/s on a 3090.
- **Qwen3 32B** for the hard ones, at around 26 tok/s.

## Give it enough context

Code eats context. A few files plus the conversation is easily 16,000 tokens, and Ollama's default is shorter, so the model quietly forgets the start. Raise it for coding:

```sh
OLLAMA_CONTEXT_LENGTH=16384 ollama serve
```

That's for Linux, where Ollama runs as a server you start. On Mac and Windows, set the context length in the Ollama app's settings instead. Longer context needs more memory; see [how much VRAM you need](/learn/how-much-vram-do-you-need).

## Use thinking mode for bugs

Qwen3 and gpt-oss can reason before answering. It's slower but catches more on real bugs. With Qwen3 add `/think` to your message; gpt-oss lets you set a reasoning effort of low, medium or high.

## Wire it into your editor

Most coding tools can talk to Ollama, because it serves an OpenAI-compatible API at `http://localhost:11434/v1`. In VS Code, extensions like Continue and Cline let you pick an Ollama model for chat and edits. Point them at that address and pick your model.

Agent-style tools that edit many files on their own work best with the bigger models. On 8 to 14B models, keep them to one file at a time.

## What to expect

- **Good:** explaining unfamiliar code, writing tests, regex and SQL, converting between languages, reviewing a diff.
- **Mixed:** large refactors, unfamiliar libraries released after the model was trained.
- **Weak:** long autonomous sessions across a big codebase. That's where cloud models still earn their price.

Not sure what your machine runs? Check [every GPU](/gpu) or the [homepage](/).
