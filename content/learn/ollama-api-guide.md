---
title: "Ollama API guide: curl examples and the OpenAI-compatible endpoint"
description: Use Ollama from code. Working curl examples for /api/generate, /api/chat and the OpenAI-compatible /v1/chat/completions, plus the options that matter.
track: serve
order: 5
date: 2026-10-26
models: qwen3-8b
---
**Ollama runs a web API on `http://localhost:11434` the whole time it's running.** It has two flavors: Ollama's own API under `/api/`, and an OpenAI-compatible one under `/v1/`. Use the OpenAI one when an app or library already speaks OpenAI. Use the native one when you need Ollama-specific options like context length.

All examples below use [Qwen3 8B](/model/qwen3-8b). Pull it first with `ollama pull qwen3:8b`.

## Check it's running

```sh
curl http://localhost:11434
```

It answers "Ollama is running". To list the models you have:

```sh
curl http://localhost:11434/api/tags
```

## /api/generate: one prompt, one answer

```sh
curl http://localhost:11434/api/generate -d '{"model":"qwen3:8b","prompt":"Why is the sky blue? One sentence.","stream":false}'
```

The answer is in the `response` field. Without `"stream":false`, Ollama streams the reply as one JSON object per line, which is what you want for a chat interface but awkward in a script.

## /api/chat: a conversation

```sh
curl http://localhost:11434/api/chat -d '{"model":"qwen3:8b","messages":[{"role":"system","content":"Answer briefly."},{"role":"user","content":"What is a GPU?"}],"stream":false}'
```

The API keeps no memory between calls. To continue a conversation, send the whole message list again with the model's last reply added as `{"role":"assistant","content":"..."}`. The reply is in `message.content`.

## /v1/chat/completions: the OpenAI-compatible endpoint

```sh
curl http://localhost:11434/v1/chat/completions -H "Content-Type: application/json" -d '{"model":"qwen3:8b","messages":[{"role":"user","content":"Write a haiku about memory bandwidth."}]}'
```

The reply looks exactly like OpenAI's: the text is in `choices[0].message.content`. That means most OpenAI client libraries work unchanged. Set the base URL to `http://localhost:11434/v1` and the API key to any non-empty string, like `ollama`. The key is required by the libraries, but Ollama ignores it.

There's also `/v1/models` for listing models and `/v1/embeddings` for embeddings.

## Options worth knowing

On the native endpoints, put model settings in an `options` object:

```sh
curl http://localhost:11434/api/chat -d '{"model":"qwen3:8b","messages":[{"role":"user","content":"Summarize this."}],"stream":false,"options":{"num_ctx":16384,"temperature":0.2}}'
```

| Field | Where | What it does |
|---|---|---|
| `options.num_ctx` | `/api/` | Context length in tokens. The default is short. |
| `options.temperature` | `/api/` | Lower is more focused and repeatable |
| `format` | `/api/` | `"json"` forces valid JSON output |
| `keep_alive` | `/api/` | How long the model stays loaded, like `"10m"`, or `-1` for always |
| `stream` | both | `false` returns one complete reply |

The OpenAI endpoint doesn't take `num_ctx`. If you use `/v1/` with long prompts, raise the context on the server side instead; see [increasing Ollama's context length](/learn/increase-ollama-context-length). Long prompts that don't fit get cut off without an error, so this matters for document work.

## Speed numbers come free

A non-streamed reply from `/api/generate` or `/api/chat` includes timing fields. `eval_count` is tokens generated and `eval_duration` is the time in nanoseconds, so tokens per second is `eval_count / eval_duration * 1e9`. That's an easy way to check your card against our calculator. Here's what it estimates for an RTX 3090:

{{lineup rtx-3090}}

If your measured number is far below the estimate, the model may be partly on the CPU. Run `ollama ps` and see [fixing Ollama using the CPU](/learn/fix-ollama-using-cpu-instead-of-gpu).

## Calling it from another machine

By default the API only listens on your own computer. To reach it from a phone or another PC, see [Ollama on your network](/learn/ollama-on-your-network). Ollama has no logins or API keys of its own, so read [securing your local AI server](/learn/secure-your-local-ai-server) before you open it up.

## Where to go next

- Want JSON you can rely on? See [structured output with Ollama](/learn/structured-output-json-with-ollama).
- Want a chat window instead of curl? Set up [Open WebUI](/learn/open-webui-setup).
- Processing a folder of files? Read [batch jobs with a local model](/learn/batch-jobs-with-a-local-model).
