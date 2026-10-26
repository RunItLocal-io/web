---
title: "How to increase Ollama's context length (num_ctx)"
description: Ollama's default context is short and it cuts off long prompts quietly. Three ways to raise num_ctx, and how much memory a longer context costs.
track: serve
order: 7
date: 2026-10-26
models: qwen3-8b, qwen3-14b, gemma-3-12b, gpt-oss-20b
---
**Ollama starts models with a short context window, and when a prompt is longer it quietly drops the start of it.** If a model "forgets" the beginning of a document you pasted, or ignores your instructions halfway through a long chat, this is usually why. You can raise it three ways: for everything with an environment variable, for one session in the chat, or permanently for one model.

The setting is called `num_ctx`, measured in tokens. A token is roughly three quarters of an English word.

## Option 1: For every model (environment variable)

Set `OLLAMA_CONTEXT_LENGTH` where the Ollama server runs, then restart Ollama:

```sh
OLLAMA_CONTEXT_LENGTH=16384 ollama serve
```

That's the quick test. To make it stick, set it the same way you'd set `OLLAMA_HOST`: in the systemd service on Linux, with `launchctl setenv` on a Mac, or in the system environment variables on Windows. [Ollama on your network](/learn/ollama-on-your-network) has the steps for each. Recent versions of the desktop app also have a context length setting in Settings.

This is the best option if you use Ollama through other apps, including ones that use the OpenAI-compatible `/v1` endpoint, which can't set context per request.

## Option 2: For one chat (in the REPL)

Inside `ollama run`, type:

```
/set parameter num_ctx 16384
```

It applies until you exit. To keep it, save a copy of the model under a new name with `/save qwen3-16k`, then `ollama run qwen3-16k` next time.

## Option 3: For one model (Modelfile or API)

Make a variant with a longer context baked in. Create a file named `Modelfile`:

```
FROM qwen3:14b
PARAMETER num_ctx 32768
```

Then build it:

```sh
ollama create qwen3-14b-32k -f Modelfile
```

This doesn't download or copy the model again; it just stores the new settings. More on Modelfiles in [importing a GGUF into Ollama](/learn/import-gguf-into-ollama).

From the API, pass it per request on the native endpoints:

```sh
curl http://localhost:11434/api/chat -d '{"model":"qwen3:14b","messages":[{"role":"user","content":"Hello"}],"stream":false,"options":{"num_ctx":32768}}'
```

See the [Ollama API guide](/learn/ollama-api-guide) for the rest.

## Check it worked

Load the model, then run:

```sh
ollama ps
```

Recent versions show the context each loaded model is using. Also watch the processor column. If it changed from "100% GPU" to a CPU/GPU split after you raised the context, the extra memory pushed part of the model off your card, and it will be much slower.

## What it costs

Context lives in the KV cache, which sits in graphics memory next to the model. For a model like Llama 3 8B it's about **128 KB per token**: 8K tokens adds about 1 GB, and 32K adds about 4 GB. Bigger models need more per token.

| Context | Rough extra memory, 8B-class model | Good for |
|---|---|---|
| 4K | 0.5 GB | Short chats |
| 8K | 1 GB | Everyday chat, code snippets |
| 16K | 2 GB | Long documents, coding sessions |
| 32K | 4 GB | Whole reports, big files |

Don't go past what the model was trained for. From our model pages: [Qwen3 8B](/model/qwen3-8b) and [Qwen3 14B](/model/qwen3-14b) handle 32K natively, [Gemma 3 12B](/model/gemma-3-12b) and [gpt-oss 20B](/model/gpt-oss-20b) handle 128K.

## Leave room on your card

Our calculator's fit check assumes about 1.2 GB for context on top of the model file. Here's a 16 GB RTX 4060 Ti:

{{lineup rtx-4060-ti 16}}

On that card, Qwen3 14B leaves about 5 GB spare, so 16K or even 32K of context fits. gpt-oss 20B leaves very little. If you need lots of context, pick a model a size down rather than spilling onto the CPU.

## Tips

- **Raise it only as far as you need.** A bigger window costs memory even when it's empty, and prompt processing slows as it fills.
- **Running several requests at once multiplies it.** With `OLLAMA_NUM_PARALLEL` above 1, each slot gets its own context.
- **Short on memory?** Setting `OLLAMA_FLASH_ATTENTION=1` and `OLLAMA_KV_CACHE_TYPE=q8_0` roughly halves the cache's size with little quality loss. See [fixing out-of-memory errors](/learn/fix-out-of-memory-errors).

For the theory behind all this, read [context length and the KV cache](/learn/context-length-and-kv-cache).
