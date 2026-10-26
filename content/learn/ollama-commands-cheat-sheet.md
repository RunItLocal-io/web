---
title: "Ollama commands cheat sheet: every command you'll actually use"
description: The Ollama commands for running, downloading, listing, stopping and deleting models, plus the in-chat slash commands and the settings worth knowing.
track: start
order: 3
date: 2026-10-26
models: qwen3-4b, qwen3-8b, qwen3-14b, gpt-oss-20b, qwen3-30b-a3b
---
Ollama has about a dozen commands, and you'll use five of them every day: `run`, `pull`, `list`, `ps` and `rm`. Here's the full set, with what each one is for. If you haven't installed Ollama yet, start with [your first model in ten minutes](/learn/how-to-run-ai-locally).

## The everyday commands

| Command | What it does |
|---|---|
| `ollama run qwen3:8b` | Download the model if needed, then chat with it |
| `ollama pull qwen3:8b` | Download or update a model without starting a chat |
| `ollama list` | Show every model on disk, with its size |
| `ollama ps` | Show loaded models and whether they're on the GPU |
| `ollama stop qwen3:8b` | Unload a model from memory now |
| `ollama rm qwen3:8b` | Delete a model from disk |
| `ollama show qwen3:8b` | Show a model's details: size, quant, context length |
| `ollama cp qwen3:8b my-model` | Copy a model under a new name |
| `ollama create my-model -f Modelfile` | Build a custom model from a Modelfile |
| `ollama serve` | Start the server by hand (the app normally does this) |
| `ollama --version` | Show which version you have |

Run `ollama help`, or add `--help` to any command, for the full options.

## Running models

Ask a single question without opening a chat:

```sh
ollama run qwen3:8b "Explain what VRAM is in two sentences"
```

See how fast it's going. `--verbose` prints timing after each answer, including the eval rate in tokens per second:

```sh
ollama run qwen3:8b --verbose
```

Compare that number with our calculator's estimate for your card on [every GPU](/gpu). If yours is far lower, check `ollama ps`.

## Checking the GPU

```sh
ollama ps
```

The `PROCESSOR` column is the most useful thing in Ollama. `100% GPU` is what you want. A split like `30%/70% CPU/GPU` means the model didn't fit in graphics memory and part of it runs on the processor, which is several times slower. Pick a smaller model or read [how much VRAM you need](/learn/how-much-vram-do-you-need).

## Inside a chat

Once you see the `>>>` prompt, these slash commands work:

- `/bye` quits the chat.
- `/?` lists every slash command.
- `/clear` wipes the conversation so far.
- `/show info` shows the model's details.
- `/set system "Answer briefly."` sets a system prompt for this chat.
- `/set parameter num_ctx 8192` raises the context length for this chat. More context uses more memory.

To paste several lines at once, start and end the text with three double quotes (`"""`).

## Model tags and sizes

The part after the colon is the tag. It picks the size, and sometimes the quant. With no tag you get `latest`, which is usually the default size. Here are the download sizes for the models we track:

| Tag | Download | Fits on |
|---|---|---|
| `qwen3:4b` | 2.5 GB | Almost anything, including CPU only |
| `qwen3:8b` | 5.2 GB | 8 GB cards |
| `gemma3:12b` | 8.1 GB | 12 GB cards |
| `qwen3:14b` | 9.3 GB | 12 GB cards |
| `gpt-oss:20b` | 14 GB | 16 GB cards |
| `qwen3:30b` | 19 GB | 24 GB cards |
| `qwen3:32b` | 20 GB | 24 GB cards |
| `llama3.3:70b` | 43 GB | Two 24 GB cards, or a 64 GB Mac |

Each model has a page with speeds on every GPU, for example [Qwen3 14B](/model/qwen3-14b) or [Qwen3 30B-A3B](/model/qwen3-30b-a3b). Browse them all on [models](/model).

## Settings worth knowing

Ollama is configured with environment variables, not a settings file. The ones people use most:

- `OLLAMA_HOST` sets the address the server listens on. The default is `127.0.0.1:11434`, this computer only.
- `OLLAMA_MODELS` moves where models are stored. See [where Ollama stores models](/learn/where-ollama-stores-models).
- `OLLAMA_KEEP_ALIVE` sets how long a model stays loaded after the last request. The default is five minutes.

How you set them depends on your system. The [Windows](/learn/run-ai-locally-on-windows), [Linux](/learn/run-ai-locally-on-linux) and [Mac](/learn/run-ai-locally-on-a-mac) guides each show how.

## The API

Everything the commands do is also available over HTTP at `http://localhost:11434`. A quick test:

```sh
curl http://localhost:11434/api/generate -d '{"model": "qwen3:8b", "prompt": "Say hello", "stream": false}'
```

That's how chat apps like [Open WebUI](/learn/open-webui-setup) and coding tools talk to Ollama.

## Where to go next

- **Running out of disk?** Read [how to update and delete models](/learn/how-to-update-and-delete-models).
- **Not sure what the words mean?** The [local AI glossary](/learn/local-ai-glossary) covers tokens, quants and context.
- **Want something to do with it?** Try our [first week with local AI](/learn/first-week-with-local-ai).
