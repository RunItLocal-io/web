---
title: The best local vision model for reading images and screenshots
description: How to run a local model that reads images, screenshots, charts and documents. Why Gemma 3 is the pick, which size to run, and what it can and can't do.
track: models
order: 11
date: 2026-10-26
models: gemma-3-12b, gemma-3-27b
---
Of the models we track, **Gemma 3 is the one that reads images.** Show it a screenshot, a photo of a receipt, a chart or a scanned page and ask questions about it. Qwen3, gpt-oss and Llama 3.3 are text only. Everything runs on your machine, which matters when the images are private documents.

## Pick your size

| Memory | Pick | Command | Estimated speed |
|---|---|---|---|
| 12 to 16 GB | [Gemma 3 12B](/model/gemma-3-12b) | `ollama run gemma3:12b` | ~24 tok/s on an RTX 3060 12 GB |
| 24 GB+ | [Gemma 3 27B](/model/gemma-3-27b) | `ollama run gemma3:27b` | ~30 tok/s on an RTX 3090 |
| 16 GB Mac | Gemma 3 12B | `ollama run gemma3:12b` | ~8 tok/s on an M4 |
| 36 GB+ Mac | Gemma 3 27B | `ollama run gemma3:27b` | ~18 tok/s on an M4 Max |

Speeds are from our calculator, for generating the answer. Images also take memory and time to read in before the answer starts, so leave a little more headroom than for text. The 27B is noticeably better at reading small text, dense charts and detailed questions. The 12B is fine for "what's in this picture" and short screenshots.

## How to use it

In Ollama's terminal chat, put the path to an image in your message:

```sh
ollama run gemma3:12b "What does this error message mean? ./screenshot.png"
```

Easier for most people: a chat app with an attach button. [Open WebUI](/learn/open-webui-setup) and LM Studio both let you drop an image into the chat with a Gemma 3 model loaded.

From code, Ollama's API takes images as base64 alongside the message, so you can script it: sort a folder of photos, pull totals off receipts, or describe screenshots for alt text. See [the Ollama API guide](/learn/ollama-api-guide).

## What it's good at

- **Screenshots.** Explaining an error dialog, reading a settings page, summarizing a slide.
- **Documents and receipts.** Pulling out the date, total and vendor; reading a printed form.
- **Charts.** Describing the trend, reading approximate values off the axes.
- **Photos.** Describing a scene, identifying common objects, writing alt text.
- **Other languages.** Gemma 3 is strong at many languages, so it can read a sign or menu and translate it in one step. See [the best local model for translation](/learn/best-local-model-for-translation).

## What it's not good at

- **Exact numbers from charts.** It estimates. If you need precise values, get the underlying data.
- **Long scanned documents.** Each page is a separate image that eats memory, and small print gets missed. For a stack of PDFs with real text in them, extracting the text first and using [chat with your documents](/learn/chat-with-your-documents-locally) works better.
- **Counting and fine detail.** "How many people are in this photo" is often wrong past a handful.
- **Recognizing specific people.** Don't rely on it for that, and don't use it that way.
- **Making images.** Reading images and making them are different models. For image generation, see [local image generation models](/learn/local-image-generation-models), or try it in your browser in our [Studio](/studio).

## Tips

- **Crop to what matters.** A tight crop of the relevant part of a screenshot gets better answers than a full 4K desktop.
- **Ask specific questions.** "What is the total on this receipt?" beats "describe this image".
- **Check the model is on the GPU.** Images add memory. If answers suddenly crawl, run `ollama ps` and check it still says `100% GPU`.

## What's next

More vision models are coming to local hardware. We have NVIDIA's Nemotron 3.5 Bolt queued for testing on our rack: a 74B mixture-of-experts model with 9B active, trained to run at 2-bit in about 24 GB, with vision built in. We'll [post results](/learn/posts) when we have them.

Want the full picture on a 24 GB card? See [the best local LLM for 24 GB](/learn/best-local-llm-for-24gb-vram).
