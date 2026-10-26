---
title: "Local RAG that actually works: chunking, embeddings and reranking"
description: Why local document search gives bad answers and how to fix it. Practical settings for chunking, embedding models, hybrid search and reranking on your own machine.
track: use
order: 14
date: 2026-10-26
models: qwen3-8b, qwen3-14b, gemma-3-12b
---
**When local RAG gives bad answers, the search is usually the problem, not the model.** If the right passage never reaches the model, no model can answer well. Fix it in this order: clean text, sensible chunks, a real embedding model, hybrid search, then a reranker.

If you just want to ask questions about some files, start with [chat with your documents](/learn/chat-with-your-documents-locally). This page is for when that's working but the answers aren't good enough.

## How the pipeline works

1. **Split** each document into chunks.
2. **Embed** each chunk: turn it into a list of numbers that captures its meaning.
3. **Search:** embed the question the same way and find the closest chunks.
4. **Rerank** (optional but powerful): score those candidates more carefully and keep the best few.
5. **Answer:** give the top chunks and the question to the chat model.

Each step can quietly lose the answer. Here's how to stop that.

## Step 0: Clean text in

Everything downstream sees only the text you extracted. Check it. PDFs often come out with headers and page numbers mid-sentence, columns mixed together, and tables flattened into nonsense. Scanned pages come out empty without text recognition (OCR). Open a few extracted files and read them before tuning anything else.

## Chunking

Chunks that are too big blur several topics into one vector. Too small, and a chunk loses the context that makes it make sense.

- **Start around 300 to 800 tokens per chunk,** with some overlap, like 10 to 20 percent, so a sentence split across a boundary still appears whole somewhere.
- **Split on structure, not just length.** Break at headings and paragraphs. A chunk that is one section of a contract beats one that starts mid-clause.
- **Add context to each chunk.** Prefix it with the document title and section heading. "Acme contract, Termination: Either party may..." searches far better than the clause alone.
- **Keep tables whole** where you can, and convert them to plain lines of text.

## Embeddings

Use a dedicated embedding model, not your chat model. They're small, fast and much better at this.

```sh
ollama pull nomic-embed-text
```

Ollama's embed endpoint takes a list of texts and returns one vector for each:

```
curl http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": ["first chunk of text", "second chunk of text"]
}'
```

Rules that matter:

- **Embed questions and chunks with the same model.** Change the model and you must re-embed everything.
- **Check the model card for prefixes.** Some embedding models, nomic-embed-text among them, were trained with short task prefixes that mark text as a document or a query. Using them helps.
- **Try more than one.** See [local embedding models](/learn/local-embedding-models). On your own documents, the ranking can differ from public leaderboards.

## Hybrid search

Vector search finds meaning but can miss exact terms: part numbers, names, error codes, clause numbers. Keyword search (BM25) finds those exactly. **Hybrid search runs both and merges the results**, and it's one of the biggest single improvements you can make. Open WebUI offers hybrid search in its document settings, and most RAG libraries support it.

## Reranking

Embedding search is fast because it compares precomputed vectors, but it's rough. A **reranker** reads the question and each candidate chunk together and scores how well they match. The usual pattern:

1. Retrieve 20 to 50 candidates with hybrid search.
2. Rerank them.
3. Give the top 3 to 8 to the chat model.

Reranker models are small and run fine next to your chat model. Open WebUI can use one alongside hybrid search. Without one, you can ask a small chat model to rate each chunk's relevance from 0 to 10; it's slower, but it works.

## The answer step

- **Raise the context length** so the chunks plus conversation fit; 8K is a minimum, 16K is better. See [context length and the KV cache](/learn/context-length-and-kv-cache).
- **Tell it to quote and cite.** "Answer only from the sources below. Quote the sentence you rely on. If it's not there, say so."
- **Pick a faithful model.** [Qwen3 14B](/model/qwen3-14b) sticks to sources noticeably better than [Qwen3 8B](/model/qwen3-8b). [Gemma 3 12B](/model/gemma-3-12b) has 128K context for many long chunks.

Here's a 12 GB RTX 3060 from our calculator, a common card for a home document server:

{{lineup rtx-3060 12}}

Qwen3 14B at about 21 tok/s is fine for answers you read as they stream. The wait you'll notice with RAG is the model reading 5,000 tokens of chunks first; see [prompt processing vs generation speed](/learn/prompt-processing-vs-generation-speed).

## Test it like you mean it

Write 20 real questions you know the answers to, with the document each answer lives in. After each change, check two things: did the right chunk come back in the top results, and was the answer right? Most people tune the wrong step because they only look at the final answer.

## Where to go next

Set up the easy version with [Open WebUI](/learn/open-webui-setup), or see what your card can run on [every GPU](/gpu).
