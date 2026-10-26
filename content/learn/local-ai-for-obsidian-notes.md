---
title: "Local AI for Obsidian: chat with your notes privately"
description: How to connect Obsidian to a model running on your own machine with Ollama, which plugins and models to use, and how to keep your vault private.
track: use
order: 3
date: 2026-10-26
models: qwen3-4b, qwen3-8b, gemma-3-12b
---
**Run Ollama on your computer, install an Obsidian community plugin that supports Ollama, and point it at `http://localhost:11434`.** Your notes then get searched, summarized and questioned by a model on your own machine. Nothing is uploaded.

That matters more for notes than for most things. A vault is often years of journals, work notes and half-formed ideas. It's exactly what you don't want to send to a cloud service.

## What you can do with it

- **Ask questions across your vault.** "What did I decide about the kitchen quote?" pulls the relevant notes and answers from them.
- **Find related notes.** Embeddings link notes by meaning, not just shared words, so you rediscover things you'd forgotten writing.
- **Summarize and rewrite.** Turn a messy meeting note into a clean summary, or a long note into bullet points.
- **Draft from your own material.** Outline a post using only what's in your notes.

## Step 1: Ollama and two models

[Install Ollama](/learn/how-to-run-ai-locally), then pull a chat model and an embedding model. The embedding model turns notes into vectors for search; it's small and fast.

```sh
ollama pull qwen3:8b
```

```sh
ollama pull nomic-embed-text
```

## Step 2: Pick a plugin

Obsidian's community plugins include several that work with local models. They fall into a few kinds:

- **Chat plugins** that open a side panel and talk to the model, often with the current note or selected notes as context.
- **Semantic search plugins** that embed your vault and show related notes or answer questions across it.
- **Text tools** that run a prompt on your selection, like "summarize" or "fix grammar".

Open Settings, then Community plugins, and search for "Ollama" or "local LLM". Check that a plugin lists Ollama or local models as a supported provider, that it has been updated recently, and read what it does with your data. Most let you choose a provider in their settings; pick Ollama and enter the address above.

If a plugin can't connect even though Ollama is running, the usual cause is Ollama refusing requests from the Obsidian app. Ollama has an `OLLAMA_ORIGINS` setting for this; the plugin's own docs normally say exactly what to set.

## Step 3: Let it index your vault

Semantic search plugins embed every note once, then update notes as they change. On a GPU this is quick even for thousands of notes. On a laptop without one, expect the first pass to take a while, and leave it running.

## Which model to use

Notes questions are mostly retrieval and summarizing, so you don't need a big model.

| Your machine | Pick | Why |
|---|---|---|
| Laptop, 8 to 16 GB | [Qwen3 4B](/model/qwen3-4b) | Fast enough to feel instant |
| 8 GB GPU or 16 GB Mac | [Qwen3 8B](/model/qwen3-8b) | The sweet spot for summaries and answers |
| 12 GB and up | [Gemma 3 12B](/model/gemma-3-12b) | Long context, reads images pasted into notes |

A lot of Obsidian users are on Macs. Here's a 16 GB base M4 from our calculator:

{{lineup apple-m4 16}}

At around 13 tok/s for Qwen3 8B, that's comfortable for reading answers as they appear. Qwen3 4B at about 26 tok/s feels snappier for quick rewrites.

## Make the answers good

1. **Write notes the search can find.** Clear titles and headings help retrieval more than any setting.
2. **Ask it to cite notes.** "Answer only from my notes, and name the note you used" cuts invented answers.
3. **Raise the context length** if the plugin sends several notes at once. See [how much VRAM you need](/learn/how-much-vram-do-you-need).
4. **Turn off thinking for quick tasks.** With Qwen3, add `/no_think` to a rewrite prompt and it answers straight away.

## Without a plugin

Your vault is a folder of plain Markdown files, which makes it easy to use with other local tools. You can upload it to a Knowledge collection in [Open WebUI](/learn/open-webui-setup), or run a script over every note, like tagging or summarizing a whole folder; see [batch jobs with a local model](/learn/batch-jobs-with-a-local-model). For how search-then-answer works under the hood, read [chat with your documents](/learn/chat-with-your-documents-locally).

## Privacy check

Plugins can call any service they're built for, so check each one's settings point only at your local address. Then switch off Wi-Fi and ask a question. If it still answers, nothing is leaving your machine. See [what stays on your machine](/learn/local-ai-privacy-what-stays-on-your-machine).
