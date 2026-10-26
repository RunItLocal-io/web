---
title: The best local LLM for writing, by how much memory you have
description: Which open models write best for drafts, editing, emails and fiction on 8 GB to 48 GB+, plus the settings and prompts that make local writing sound less generic.
track: models
order: 9
date: 2026-10-26
models: gemma-3-12b, gemma-3-27b, llama-3-3-70b, qwen3-8b, qwen3-14b
---
Writing is one of the best uses for a local model. Drafts, rewrites, emails and fiction don't need cloud-level reasoning, and your unpublished work never leaves your machine. The models that write best aren't always the ones that top reasoning tests.

## Picks by memory

| Memory | Pick | Command | Why |
|---|---|---|---|
| 8 GB | [Qwen3 8B](/model/qwen3-8b) | `ollama run qwen3:8b` | The best all-rounder that fits |
| 12 to 16 GB | [Gemma 3 12B](/model/gemma-3-12b) | `ollama run gemma3:12b` | Natural prose, many languages, long context |
| 24 GB | [Gemma 3 27B](/model/gemma-3-27b) | `ollama run gemma3:27b` | The most polished writer on one card |
| 48 GB+ | [Llama 3.3 70B](/model/llama-3-3-70b) | `ollama run llama3.3:70b` | Best writing quality you can run at home |

## Why Gemma 3 and Llama 3.3

Google's Gemma 3 models have a more natural, varied style than most models their size, and they handle other languages well, which matters if you write in more than English. Both have a 128K context window, so you can paste in a long chapter for editing. Llama 3.3 70B is the step above: more general knowledge, better at keeping a consistent voice, and good at following detailed style instructions.

Qwen3 is a strong writer for its size too, and better than Gemma at structured work like reports and outlines. **Qwen3 14B** is a good pick on 12 GB if you write more technical or structured text than prose.

**gpt-oss** models are excellent at reasoning but can sound flat in creative writing. Use them for fact-heavy explainers, not stories.

## Speed for writing

Writing doesn't need to be fast. Anything above about 10 tok/s is faster than you can read. Here's a 24 GB RTX 3090 from our calculator, where Gemma 3 27B runs at about 30 tok/s:

{{lineup rtx-3090}}

On a 64 GB Mac, Llama 3.3 70B runs at an estimated 5 to 7 tok/s on a Max chip: slow for chat, but fine for "rewrite this section" while you get a coffee.

## Turn thinking off for prose

Qwen3's thinking mode helps with logic but tends to make prose stiffer and slower. For drafting, add `/no_think` to your message. Turn it back on with `/think` when you want it to plan a structure or check an argument.

## Settings that help

- **Raise the temperature a little for fiction.** It controls how adventurous the word choice is. A bit higher gives more varied prose; lower is better for edits where you want it to stay close to your text. See [temperature and sampling](/learn/temperature-and-sampling).
- **Use a system prompt for your voice.** Describe your style once ("short sentences, no clichés, British spelling, write like a newspaper column") instead of in every message. See [what is a system prompt](/learn/what-is-a-system-prompt).
- **Give examples.** Pasting two paragraphs of your own writing and asking it to match them works better than describing a style.
- **Raise the context length for long documents.** Ollama starts with a short context. For long manuscripts, raise it; see [increase Ollama's context length](/learn/increase-ollama-context-length).

## Prompts that get less generic output

- "Rewrite this to be 30% shorter. Keep my wording where you can." Better than "improve this", which invites filler.
- "List five weaknesses in this draft. Don't rewrite it." Local models are good critics.
- "Give me three different opening lines in very different tones." Then pick and continue.
- Ask it to avoid words you're tired of seeing. Every model has favorites.

## What to expect

- **Good:** rewriting, shortening, changing tone, first drafts, emails, brainstorming titles, critiquing structure.
- **Mixed:** long fiction with consistent characters across many chapters. Bigger models do much better.
- **Weak:** facts. Small models state wrong facts confidently. Check names, dates and numbers yourself.

## A comfortable writing setup

For writing, a chat window with saved conversations and system prompts helps a lot. [Open WebUI](/learn/open-webui-setup) gives you that on top of Ollama, in your browser. Not sure what your machine runs? Check [every GPU](/gpu) or see [how much VRAM you need](/learn/how-much-vram-do-you-need).
