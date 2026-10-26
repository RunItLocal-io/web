---
title: "What to actually do with a local AI model: your first week"
description: Seven practical things to try in your first week with a local model, from rewriting email to reading your own documents and scripting batch jobs.
track: start
order: 8
date: 2026-10-26
models: qwen3-8b, gemma-3-12b, qwen3-14b
---
You've installed Ollama, run a model, and asked it a few trivia questions. Now what? Trivia is the worst test of a local model: small models don't memorize facts well. They're much better at **working on text you give them**. Here's a week of things to try, one a day, that show what a local model is really good for.

If you haven't got that far, start with [your first model in ten minutes](/learn/how-to-run-ai-locally).

## Day 1: Rewrite something you wrote

Paste in an email, a cover letter, or a message you're not sure about, and ask for a version that's shorter, friendlier, or more formal. This is where even [Qwen3 8B](/model/qwen3-8b) shines, and it's the kind of text you might not want to paste into a cloud service.

Try asking for three versions at once, then pick the best parts.

## Day 2: Summarize something long

Paste a long article, meeting notes or a contract and ask for the five points that matter, or "what does this commit me to?". One catch: Ollama starts with a short context window to save memory, so very long text can get cut off. In a chat, `/set parameter num_ctx 16384` gives it more room, at the cost of more memory. The [glossary](/learn/local-ai-glossary) explains context.

## Day 3: Get a chat window

The terminal gets old. Spend ten minutes on [Open WebUI](/learn/open-webui-setup) for chat history, a model picker and file uploads. Or install LM Studio, which has its own window.

## Day 4: Ask questions about your own files

Drop a PDF into Open WebUI and ask about it: a manual, a lease, a set of policies. The model reads the relevant parts and answers from them, all on your machine. This is where local AI starts to feel useful at work. See [chat with your documents](/learn/chat-with-your-documents-locally).

## Day 5: Show it a picture

[Gemma 3 12B](/model/gemma-3-12b) reads images. Give it a screenshot of an error, a photo of a whiteboard, or a chart, and ask what it says. It needs about 10 GB of memory.

```sh
ollama run gemma3:12b
```

In the terminal you can include an image by putting its file path in your message.

## Day 6: Coding help

If you write code, connect your editor. Continue and Cline are VS Code extensions that talk to Ollama. Start with explaining unfamiliar code and writing tests, which small models do well, before asking for big changes. See [a local coding assistant in VS Code](/learn/local-coding-assistant-in-vs-code) and [the best local LLM for coding](/learn/best-local-llm-for-coding).

## Day 7: Make it do a chore

The real advantage of a local model is that nobody counts your tokens. Anything you'd do a hundred times, it can do a hundred times. Ollama has an API on your machine:

```sh
curl http://localhost:11434/api/generate -d '{"model": "qwen3:8b", "prompt": "Write a subject line for this email: ...", "stream": false}'
```

A short script can loop that over a folder: tag support tickets, rename files from their contents, pull names and dates out of invoices. This is how we use our own rack. 90 used GPUs ran a billion tokens through Qwen3.6-35B-A3B in 2.9 days, for about 6 to 8 cents of power per million tokens.

## What to watch for

- **Made-up facts.** Small models fill gaps confidently. Give them the source text rather than asking from memory.
- **Thinking out loud.** Qwen3 models reason before they answer, which is great for hard questions and slow for easy ones. Type `/set nothink` in a chat to skip it.
- **Speed drops on long chats.** Every message adds to the context. Start a new chat when you change topics.

## At the end of the week

You'll know where the model you have hits its limits. If it's doing most of what you need, you're done. If it keeps falling short on reasoning or code, the next step is more memory: [Qwen3 14B](/model/qwen3-14b) on a 12 GB card is a clear step up, and a [used 24 GB card](/learn/used-rtx-3090-buying-guide) opens up the 30B class.

Here's what a 12 GB RTX 3060, our Starter build at about $300 to $400 all in, runs by our estimate:

{{lineup rtx-3060 12}}

## Where to go next

- **Weighing local against your cloud subscription?** Read [is local AI worth it](/learn/is-local-ai-worth-it).
- **Want the commands in one place?** See the [Ollama cheat sheet](/learn/ollama-commands-cheat-sheet).
- **Curious what other people's rigs do?** Browse the [leaderboard](/leaderboard).
