---
title: "A local coding assistant in VS Code: Continue, Cline and Ollama"
description: Set up a private AI coding assistant in VS Code with Ollama and Continue or Cline. Which model to pick for your card, and what to expect from it.
track: use
order: 2
date: 2026-10-26
models: qwen3-8b, qwen3-14b, gpt-oss-20b, qwen3-30b-a3b, qwen3-32b
---
**Install Ollama, pull a model, then add the Continue or Cline extension to VS Code and choose Ollama as the provider.** That's the whole setup. Your code stays on your machine, there's no subscription, and it works offline.

## Continue or Cline?

They do different jobs, and plenty of people run both.

| | Continue | Cline |
|---|---|---|
| What it is | Chat, inline edits and tab autocomplete | An agent that reads files, edits them and runs commands |
| How you use it | You ask, it suggests, you accept | You give it a task, it works through steps and asks before acting |
| Works on small models | Yes, well | Struggles below about 14B |
| Context it needs | Modest | A lot, often 16K tokens or more |

**Start with Continue** if you want a helper beside your code. **Try Cline** if you have a 24 GB card or more and want it to carry out multi-step tasks.

## Step 1: Get a model running

If you haven't yet, [install Ollama](/learn/how-to-run-ai-locally). Then pull a model that fits your card:

```sh
ollama pull qwen3:14b
```

Rough picks by memory, from our [coding model guide](/learn/best-local-llm-for-coding):

- **8 GB:** [Qwen3 8B](/model/qwen3-8b)
- **12 GB:** [Qwen3 14B](/model/qwen3-14b)
- **16 GB:** [gpt-oss 20B](/model/gpt-oss-20b)
- **24 GB:** [Qwen3 30B-A3B](/model/qwen3-30b-a3b) for speed, [Qwen3 32B](/model/qwen3-32b) for the hard problems

## Step 2: Raise the context length

This is the step people skip, and it's the main reason local assistants feel dumb. Coding tools send your open files, the conversation and their own instructions with every request. Ollama's default context is shorter than that, so the start gets cut off quietly.

On Linux, start the server with a bigger window:

```sh
OLLAMA_CONTEXT_LENGTH=16384 ollama serve
```

On Mac and Windows, set the context length in the Ollama app's settings. For Cline, go higher if your memory allows. Every extra token costs memory; see [context length and the KV cache](/learn/context-length-and-kv-cache).

## Step 3: Install the extension

Both are in the VS Code extensions marketplace. Search for the name and install.

**Continue:** open its panel, add a model, choose Ollama as the provider, and pick the model you pulled. Continue keeps its settings in a config file you can edit by hand; its docs show the current format, which has changed over time, so follow those rather than an old blog post.

**Cline:** open its settings, choose Ollama as the API provider, and pick your model. Ollama's default address is `http://localhost:11434`, which is what both extensions expect unless you've moved it.

If you run Ollama on another machine, point the extension at that machine's address instead. See [Ollama on your network](/learn/ollama-on-your-network).

## Autocomplete wants a different model

Tab autocomplete fires on every pause in your typing, so it has to answer in well under a second. Use a small, fast model trained for fill-in-the-middle, separate from your chat model. Continue's docs list current recommendations. A 1B to 3B coding model on the same card as your chat model is a common setup.

## How fast will it feel?

Speed matters more for code than for chat, because answers are long and you regenerate often. Below about 20 tok/s it starts to drag. Here's a 12 GB RTX 3060, the cheapest card we'd suggest for this, from our calculator:

{{lineup rtx-3060 12}}

On a 24 GB RTX 3090 the gap between models is wide: our estimates put Qwen3 30B-A3B at about 164 tok/s and Qwen3 32B at about 26 tok/s. That's why many people keep the fast one loaded for back-and-forth and switch to the dense one for a tricky bug.

## What works and what doesn't

- **Good:** explaining unfamiliar code, writing tests, small functions, regex and SQL, reviewing a diff you paste in.
- **Mixed:** edits across two or three files, newer libraries the model hasn't seen.
- **Weak on small models:** long agent runs in Cline. On 8B to 14B models, give it one file and one clear task at a time, and read every change before you approve it.

If Cline keeps looping or calling tools wrongly, it's almost always the model size or a context window that's too short, not the extension. For more on why, see [local AI agents](/learn/local-ai-agents).

## Where to go next

Check what your card runs on [every GPU](/gpu), or compare picks in [the best local LLM for coding](/learn/best-local-llm-for-coding).
