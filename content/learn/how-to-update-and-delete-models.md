---
title: "Free up disk space in Ollama: how to update and delete models"
description: See how much space your Ollama models use, delete the ones you don't need, update the rest, and clean up after LM Studio and Hugging Face too.
track: start
order: 10
date: 2026-10-26
models: qwen3-8b, qwen3-32b, llama-3-3-70b
---
Models are big, and after a few weeks of trying things it's easy to have 100 GB of them. **`ollama list` shows what you have and how big each one is. `ollama rm` deletes one.** That's most of it. Here's the rest.

## See what's using space

```sh
ollama list
```

You get each model's name, ID, size on disk, and when it was last changed. For reference, here's what the models we track take up at Ollama's default 4-bit size:

| Model | On disk |
|---|---|
| `qwen3:4b` | 2.5 GB |
| `qwen3:8b` | 5.2 GB |
| `gemma3:12b` | 8.1 GB |
| `qwen3:14b` | 9.3 GB |
| `gpt-oss:20b` | 14 GB |
| `gemma3:27b` | 17 GB |
| `qwen3:30b` | 19 GB |
| `qwen3:32b` | 20 GB |
| `llama3.3:70b` | 43 GB |
| `gpt-oss:120b` | 65 GB |

If you pulled other quants, like a `q8_0` tag, those are roughly twice as big. See [quantization explained](/learn/quantization-explained).

## Delete a model

```sh
ollama rm qwen3:32b
```

It's gone from disk right away. If the model is loaded, stop it first with `ollama stop qwen3:32b`. You can always pull it again later. Nothing about your chats is stored in the model, so deleting it doesn't delete any history. Apps like Open WebUI keep chats separately.

Two models can share files. If you copied a model with `ollama cp`, or built a custom one from a Modelfile, both point at the same weights. The space only comes back once every name using them is removed.

## Update a model

Model publishers sometimes fix a chat template or re-upload weights. To get the latest version, pull it again:

```sh
ollama pull qwen3:8b
```

Ollama downloads only the parts that changed. If nothing changed, it finishes in a second.

To update everything you have at once, on Mac or Linux:

```sh
ollama list | awk 'NR>1 {print $1}' | xargs -n1 ollama pull
```

That skips the header line of `ollama list`, then pulls each model in turn.

## Update Ollama itself

This is separate from updating models. On Mac and Windows, the app checks for updates and tells you from its menu bar or tray icon. On Linux, run the install script again; it upgrades in place and keeps your models:

```sh
curl -fsSL https://ollama.com/install.sh | sh
```

## Still short on space?

**Move the models instead of deleting them.** A big second drive is cheaper than re-downloading. The [builds](/builds) we recommend all include a 1 TB SSD for this reason. See [where Ollama stores models](/learn/where-ollama-stores-models) to move them.

**Check other apps.** If you've tried more than one tool, you may have the same model several times:

- **LM Studio** keeps its own copies. Delete them from the app's models view.
- **Hugging Face downloads**, from Python tools and some apps, go in a cache folder in your home directory, `.cache/huggingface`. It can get very large without you noticing.
- **Open WebUI** in Docker keeps chats and uploaded files in its Docker volume, not your models folder.
- **The browser.** Models you load in our [Studio](/studio) are cached by your browser. The Studio can remove them, or clearing the site's data does it.

## What to keep

A practical set for most people is one small fast model and one bigger, smarter one that fits your card. On an 8 GB card that's `qwen3:4b` plus `qwen3:8b`, under 8 GB of disk in total. On a 24 GB card, `qwen3:8b` plus [Qwen3 30B-A3B](/model/qwen3-30b-a3b) for speed or [Qwen3 32B](/model/qwen3-32b) for careful answers.

Don't keep a model your card can't fit. A [Llama 3.3 70B](/model/llama-3-3-70b) download is 43 GB, and on a single 24 GB card it spills onto the processor and crawls. Our calculator shows what fits on each card on [every GPU](/gpu). Here's a 16 GB RTX 4060 Ti, for example:

{{lineup rtx-4060-ti 16}}

## Where to go next

- **Every Ollama command:** the [cheat sheet](/learn/ollama-commands-cheat-sheet).
- **Which models are worth keeping on your card?** See [how much VRAM you need](/learn/how-much-vram-do-you-need).
