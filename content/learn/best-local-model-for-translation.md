---
title: The best local model for translation
description: Which open models translate best on your own hardware, by memory size, plus prompts that get natural results and where local translation still falls short.
track: models
order: 12
date: 2026-10-26
models: gemma-3-12b, gemma-3-27b, qwen3-14b, llama-3-3-70b
---
For translation, **Gemma 3 is the pick** on most hardware, with Qwen3 a close second. Both were trained on a wide range of languages and handle the common ones well. Running locally means contracts, medical letters and private messages never leave your machine.

## Picks by memory

| Memory | Pick | Command | Notes |
|---|---|---|---|
| 8 GB | [Qwen3 8B](/model/qwen3-8b) | `ollama run qwen3:8b` | Fine for major languages, gist translation |
| 12 to 16 GB | [Gemma 3 12B](/model/gemma-3-12b) | `ollama run gemma3:12b` | Natural phrasing, reads images too |
| 24 GB | [Gemma 3 27B](/model/gemma-3-27b) | `ollama run gemma3:27b` | The best translator on one card |
| 48 GB+ | [Llama 3.3 70B](/model/llama-3-3-70b) | `ollama run llama3.3:70b` | Strong in the languages Meta supports officially |

## Why Gemma 3

Google built Gemma 3 with many languages in mind, and it shows: its translations tend to read like they were written by a person, not converted word by word. It also has a 128K context window, so it can translate a long document in one go and keep terms consistent. And it reads images, so you can photograph a sign, a menu or a printed letter and ask for a translation in one step. See [the best local vision model](/learn/best-local-vision-model).

**Qwen3** (8B and 14B, with 32B on 24 GB) is very good too, and especially strong for Chinese. If Gemma's phrasing doesn't suit a language pair, try both on a paragraph you know well.

**Llama 3.3 70B** officially supports a short list of major languages, including English, German, French, Italian, Portuguese, Hindi, Spanish and Thai. It's excellent in those and less predictable outside them.

**gpt-oss** is focused mainly on English. It can translate, but it's not the one to pick for this.

## How fast it needs to be

Translation output is about as long as the input, so speed matters for long documents. Here's the RTX 3090 from our calculator, where Gemma 3 27B runs at about 30 tok/s, roughly a page of text every 20 seconds or so:

{{lineup rtx-3090}}

On a 12 GB RTX 3060, Gemma 3 12B is about 24 tok/s, and on a 16 GB card like the [RTX 5060 Ti](/gpu/rtx-5060-ti), about 30.

## Prompts that work

- **Say who it's for.** "Translate into Spanish for customers in Mexico, friendly but professional" beats "translate to Spanish".
- **Give a glossary.** List the terms that must stay fixed: product names, legal terms, your company's words. Put them in the system prompt so every message uses them. See [what is a system prompt](/learn/what-is-a-system-prompt).
- **Ask for the translation only.** "Output only the translation, no notes" keeps it clean for copying or scripts.
- **Ask it to flag doubts.** For important text, the opposite: "after the translation, list any phrases that were ambiguous."
- **Turn off Qwen3's thinking.** Add `/no_think` for straight translation. It's faster and the result is usually the same.
- **Lower the temperature.** For faithful translation you want less creativity, not more. See [temperature and sampling](/learn/temperature-and-sampling).

## Translating lots of text

For a folder of files, or translating product descriptions in bulk, script it against Ollama's API. Split long files into sections of a few paragraphs, send each with the same instructions and glossary, and join the results. See [batch jobs with a local model](/learn/batch-jobs-with-a-local-model).

## Where it falls short

- **Rare languages.** Quality drops off for languages with less training data. Check with a native speaker before you rely on it.
- **Legal and medical text.** Good for understanding a document; not a replacement for a certified translator when it matters.
- **Idioms and wordplay.** Bigger models do much better. Small ones translate literally.
- **Consistency across a long book.** Keep a glossary and translate in sections, or the same term drifts.

## Real-time speech

Translating speech needs a speech-to-text model first. Whisper runs locally and handles many languages; see [local speech-to-text models](/learn/local-speech-to-text-models). Pipe its text into Gemma 3 for the translation.

Not sure which model fits your card? Check [every GPU](/gpu) or see [how much VRAM you need](/learn/how-much-vram-do-you-need).
