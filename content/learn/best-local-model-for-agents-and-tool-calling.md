---
title: The best local model for agents and tool calling
description: Which open models call tools reliably on 12 GB to 64 GB+, how tool calling works with Ollama, and what to expect from local agents compared with cloud models.
track: models
order: 14
date: 2026-10-26
models: qwen3-14b, gpt-oss-20b, qwen3-30b-a3b, qwen3-32b, gpt-oss-120b
---
Tool calling is when a model, instead of just answering, asks your program to run something: search the web, read a file, query a database, call an API. An agent is a loop of that, where the model decides the next step from the results of the last one. **gpt-oss and Qwen3 are the families to use locally.** Both were trained for it and work with Ollama's tool support.

## Picks by memory

| Memory | Pick | Command | Good for |
|---|---|---|---|
| 12 GB | [Qwen3 14B](/model/qwen3-14b) | `ollama run qwen3:14b` | One or two tools, simple tasks |
| 16 GB | [gpt-oss 20B](/model/gpt-oss-20b) | `ollama run gpt-oss:20b` | Fast, reliable calls with reasoning |
| 24 GB | [Qwen3 30B-A3B](/model/qwen3-30b-a3b) or [Qwen3 32B](/model/qwen3-32b) | `ollama run qwen3:30b` | Multi-step agents |
| 64 GB+ | [gpt-oss 120B](/model/gpt-oss-120b) | `ollama run gpt-oss:120b` | The closest to cloud agents at home |

Below about 12 GB, models like Qwen3 8B can call a single well-described tool, but they get lost in longer agent loops.

Gemma 3 is great for images and writing but isn't the one to pick for tools. Llama 3.3 70B supports tool calling too, but it's dense and slow next to gpt-oss 120B on the same hardware.

## Why speed matters for agents

An agent makes many model calls per task: plan, call a tool, read the result, decide, call again. Ten steps at a slow model's pace adds up fast. That's why the [mixture-of-experts](/learn/mixture-of-experts-explained) models shine here. On a 24 GB RTX 3090 we estimate gpt-oss 20B and Qwen3 30B-A3B at about **164 tok/s** each, against about 26 for the dense Qwen3 32B.

{{lineup rtx-3090}}

Use the fast model for most steps. Switch to the dense 32B, or turn on reasoning, when the agent keeps making wrong decisions.

## How tool calling works with Ollama

You send the model a list of tools, each with a name, a description and a JSON schema for its arguments. If the model wants one, it replies with a tool call instead of text. Your code runs the tool, sends the result back as a message, and the model continues.

Ollama supports this in its own API and in its OpenAI-compatible endpoint at `http://localhost:11434/v1`. That means most agent frameworks and coding tools that speak the OpenAI API can use a local model by changing the base URL and model name. See [the Ollama API guide](/learn/ollama-api-guide).

Many tools now also use MCP (the Model Context Protocol), a standard way to plug tools into a model. Several local chat apps can connect MCP servers to a model running in Ollama. More in [local AI agents](/learn/local-ai-agents).

## Getting reliable tool calls

- **Write clear tool descriptions.** The model only knows what a tool does from its description. Say when to use it and when not to.
- **Fewer tools is better.** A small model choosing between 3 tools does much better than one choosing between 30. Give each agent only what it needs.
- **Keep argument schemas simple.** Flat objects with a few required fields work best.
- **Raise the context length.** Tool results, especially web pages and files, fill context fast. Ollama's default is short; see [increase Ollama's context length](/learn/increase-ollama-context-length).
- **Use reasoning for planning steps.** Qwen3's thinking mode and gpt-oss's higher effort levels help the model decide what to do next. They cost time, so try without first.
- **Validate before acting.** Check the arguments in your code before running anything that writes, deletes or spends money.

## Be careful what you give it

A local agent can only do what your tools let it do, so design them with that in mind. Read-only tools are safe to experiment with. For anything that changes files, sends messages or runs shell commands, require confirmation, or run it in a container. Text the agent reads, like web pages and emails, can contain instructions meant to steer it, so don't let content from outside decide what it runs.

## What to expect

- **Good:** searching and summarizing, answering questions over your own files or database, filling forms from text, home automation, coding help in a single file.
- **Mixed:** multi-step tasks of five to ten steps. The 24 GB-class models and gpt-oss 120B handle them; small ones drift.
- **Weak:** long autonomous sessions across a big codebase. That's where cloud models still lead. See [the best local LLM for coding](/learn/best-local-llm-for-coding).

For structured output without tools, such as classification and extraction, see [the best small model for scripts](/learn/best-small-model-for-scripts).
