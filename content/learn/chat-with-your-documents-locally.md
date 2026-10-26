---
title: Chat with your documents locally, without uploading them anywhere
description: Ask questions about your PDFs, notes and contracts with a model that runs on your own machine. How it works, how to set it up, and how to make the answers good.
track: use
order: 1
date: 2026-10-26
models: qwen3-14b, qwen3-8b, gemma-3-12b
---
This is one of the best reasons to run AI locally: contracts, medical records, client files and company docs you'd never paste into a cloud chatbot. With a local model they never leave your computer.

## Two ways it works

**1. Paste the whole thing in.** For one document that fits in the model's context, this gives the best answers. The model reads all of it. A 20-page PDF is roughly 10,000 to 15,000 tokens.

**2. Search, then answer (RAG).** For a folder of documents, or one too long to fit, the app splits everything into chunks, finds the chunks most related to your question, and gives only those to the model. It scales to thousands of files, but the answer is only as good as the search.

## The easy setup: Open WebUI

If you've [set up Open WebUI](/learn/open-webui-setup), you already have both.

- **One document:** drag it into the chat and ask. Open WebUI can give the model the full text instead of searching it; look for that option on the attached file when you need the whole thing read.
- **A collection:** go to Workspace, then Knowledge, create a collection, and upload your files. In any chat, type `#` and pick the collection.

Want better search? Pull a dedicated embedding model in Ollama and choose it in Open WebUI's document settings:

```sh
ollama pull nomic-embed-text
```

## Which model to use

Answering from documents needs a model that sticks to the text and admits when the answer isn't there. Smaller models are more likely to make things up.

- **8 GB:** [Qwen3 8B](/model/qwen3-8b). Fine for finding and summarizing; double-check details.
- **12 GB and up:** [Qwen3 14B](/model/qwen3-14b) is noticeably more faithful to the source.
- **Scanned pages, charts, screenshots:** [Gemma 3 12B](/model/gemma-3-12b) can read images.

## Make the answers good

1. **Raise the context length.** The model needs room for the retrieved text plus your conversation. 8K is a minimum for document work; 16K or more is better. See [how much VRAM you need](/learn/how-much-vram-do-you-need) for the memory cost.
2. **Ask it to quote.** "Answer using only the documents, and quote the sentence you're relying on" cuts made-up answers sharply.
3. **Ask specific questions.** "What's the termination notice period in the Acme contract?" searches far better than "tell me about the contracts".
4. **Clean PDFs work best.** Scanned PDFs need text recognition (OCR) first, or a vision model.
5. **For one key document, skip search.** Give it the whole text. Search is for when you can't.

## Privacy check

Everything here runs locally: the model, the embeddings, and the document store. You can confirm it by turning off your internet connection; it keeps working.

Not sure your machine is up to it? See what it runs on the [homepage](/) or [every GPU](/gpu).
