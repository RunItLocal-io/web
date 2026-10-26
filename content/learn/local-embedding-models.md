---
title: "Local embedding models: nomic-embed-text and friends"
description: What embedding models do, why they power search over your documents, how to run nomic-embed-text with Ollama, and how to choose one.
track: models
order: 24
date: 2026-10-26
models: qwen3-8b, qwen3-14b
---
**An embedding model turns text into a list of numbers that captures its meaning. It's the engine behind "chat with your documents" and any search that finds results by meaning instead of exact words.** For local use, start with `nomic-embed-text` in Ollama. It's small, fast, and good enough for most personal and small-team projects.

## What embeddings are for

A chat model writes text. An embedding model only reads it. You give it a sentence or a paragraph and it returns a vector, a few hundred to a few thousand numbers. Texts with similar meanings get similar vectors, so "how do I reset my password" lands near "forgot login credentials", even with no words in common.

That's what makes these work:

- **Document chat (RAG).** Your files are split into chunks and each chunk is embedded once. When you ask a question, it's embedded too, the closest chunks are found, and they're handed to a chat model to answer from. See [chat with your documents](/learn/chat-with-your-documents-locally).
- **Semantic search** over notes, tickets or email.
- **Grouping and de-duplicating** similar items.
- **Classifying** text by comparing it to examples.

## Run one with Ollama

Embedding models are tiny next to chat models, typically a few hundred megabytes up to a couple of gigabytes. They run fine on a CPU and fly on any GPU.

```sh
ollama pull nomic-embed-text
```

You don't chat with it. Your tools call it through Ollama's API. To see what it returns:

```sh
curl http://localhost:11434/api/embed -d '{"model": "nomic-embed-text", "input": "How much VRAM do I need?"}'
```

You'll get back a long list of numbers. Open WebUI, Continue, many note apps and most RAG libraries can be pointed at Ollama to use it. See the [Ollama API guide](/learn/ollama-api-guide).

## Choosing an embedding model

Ollama's library has several embedding models, and Hugging Face has many more. What to compare:

| What | Why it matters |
|---|---|
| Size | Bigger models usually capture meaning better, but embed more slowly. That matters when you index thousands of files. |
| Max input length | Text longer than this is cut off. Keep your chunks under it. |
| Languages | Some are English-focused; others are trained for many languages. Pick a multilingual one if your documents need it. |
| Dimensions | Longer vectors take more storage in your database. Rarely a problem at home scale. |
| License | Check it like any other model. See [open model licenses explained](/learn/open-model-licenses-explained). |

`nomic-embed-text` is a good default for English. If your documents are in several languages or results seem off, try a multilingual model and compare on your own questions.

## Rules that save headaches

**Use the same model for indexing and searching.** Vectors from different models aren't comparable. If you switch embedding models, re-embed everything.

**Some models want a prefix.** A few embedding models expect a short label in front of the text, one for documents and another for queries. It's on the model card, and skipping it quietly hurts results. See [how to read a model card](/learn/how-to-read-a-model-card).

**Chunking matters more than the model.** Chunks that are too big blur several topics together; too small and they lose context. A few hundred words with some overlap is a common starting point. See [local RAG that actually works](/learn/local-rag-that-actually-works).

**Embeddings find; the chat model answers.** If answers are wrong but the right chunks were found, upgrade the chat model. If the right chunks weren't found, fix the embedding side.

## Pairing it with a chat model

The embedding model barely needs memory, so the chat model sets your hardware. On a 12 GB card, the embedding model plus [Qwen3 14B](/model/qwen3-14b) fits comfortably. On 8 GB, pair it with [Qwen3 8B](/model/qwen3-8b). Here's what a 12 GB RTX 3060 runs, from our calculator:

{{lineup rtx-3060 12}}

## When embedding speed matters

For a few hundred documents, indexing takes minutes on almost anything. For tens of thousands, a GPU helps a lot, and the first index is the slow part; after that you only embed new files and each question. If you're indexing a big archive, run it overnight.

Ready to build it? Start with [chat with your documents](/learn/chat-with-your-documents-locally), then check [every GPU](/gpu) for the chat model your card can run.
