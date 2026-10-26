---
title: "What is a system prompt, and how to set one in Ollama and other local tools"
description: What a system prompt does, what to put in one, and how to set it in Ollama, a Modelfile, Open WebUI, LM Studio and the API.
track: basics
order: 14
date: 2026-10-26
models: qwen3-8b, gemma-3-12b, gpt-oss-20b
---
**A system prompt is a set of standing instructions the model reads before every conversation.** It's where you tell it who it's talking to, how to answer, and what to avoid, once, instead of repeating it in every message. With a local model you control it completely.

## What it does

Every chat is sent to the model as a list of messages with roles: *system*, *user* and *assistant*. The system message comes first. Models are trained to treat it as the ground rules for everything after it.

Cloud chat apps have long, hidden system prompts. A local model, by default, has a short one or none at all. That's why a fresh local model can feel generic: nobody has told it anything about you.

## What to put in one

Keep it short and specific. A few lines beat a page. Good things to include:

- **Who you are and what you're doing.** "I'm a backend developer working mostly in Go and Postgres."
- **How to answer.** "Answer briefly. Use bullet points for steps. Use metric units."
- **What to avoid.** "Don't apologize. Don't repeat my question back to me."
- **Output format,** for scripts. "Reply with JSON only, matching this shape: ..."

An example for everyday use:

> You are a helpful assistant running locally on my computer. Be concise and direct. If you're not sure of something, say so. Use British spelling.

Things that don't work well: very long lists of rules (small models forget them), contradictions, and trying to give the model facts it doesn't have. For that, attach documents instead; see [chat with your documents](/learn/chat-with-your-documents-locally).

## Set it in Ollama, for one session

Inside `ollama run`, type:

```sh
/set system "Answer briefly. Use metric units."
```

It lasts until you exit. Use `/save mymodel` afterwards if you want to keep it as a new model.

## Set it permanently with a Modelfile

Make a file called `Modelfile`:

```
FROM qwen3:8b
SYSTEM """You are a concise assistant. Answer in plain English. Use metric units."""
```

Then create your own model from it:

```sh
ollama create my-assistant -f Modelfile
```

Now `ollama run my-assistant` starts with your system prompt every time. It shares the same weights on disk as `qwen3:8b`, so it costs no extra space. You can set other defaults the same way, like temperature; see [temperature and sampling](/learn/temperature-and-sampling).

## Set it in Open WebUI

Open WebUI has a system prompt in your user settings that applies to every chat, and you can also set one per chat or per custom model in the Workspace section. See [Open WebUI setup](/learn/open-webui-setup).

## Set it in LM Studio

LM Studio has a system prompt box in the chat sidebar, alongside the model's other settings. You can save it as a preset to reuse.

## Set it through the API

Ollama's OpenAI-compatible API at `http://localhost:11434/v1` takes the system prompt as the first message, with `"role": "system"`. That's how coding tools and scripts set theirs. See [the Ollama API guide](/learn/ollama-api-guide).

## Model quirks worth knowing

- **Gemma 3** has no separate system role. Its chat template folds your system prompt into the first user message. It mostly works the same, but instructions may be followed a little less strictly.
- **gpt-oss** reads a reasoning level from the system prompt: add `Reasoning: low`, `medium` or `high`. See [thinking models explained](/learn/thinking-models-explained).
- **Qwen3** respects `/no_think` and `/think`. Putting `/no_think` in the system prompt is a common way to turn thinking off for a whole chat.

## It costs a little context

The system prompt is sent with every request, so it takes up part of the context window and has to be read before each answer. Engines keep it in the cache between messages, so a short system prompt costs almost nothing after the first reply. A multi-page one eats into the memory you have for conversation; see [context length and the KV cache](/learn/context-length-and-kv-cache).

## Try it

[Qwen3 8B](/model/qwen3-8b) follows system prompts well and runs on an 8 GB card. Here's what it and the others run at on a common one:

{{lineup rtx-3060}}
