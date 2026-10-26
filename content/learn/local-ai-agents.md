---
title: "Local AI agents: tool calling, MCP and what works on small models"
description: How agents and tool calling work with local models in Ollama, what MCP adds, which models handle tools reliably, and how to keep small models on track.
track: use
order: 5
date: 2026-10-26
models: qwen3-8b, qwen3-14b, gpt-oss-20b, qwen3-30b-a3b, gpt-oss-120b
---
**An agent is a model that can call tools in a loop until a task is done.** Local models can do it. The honest version: models from about 14B up handle a few tools reliably, gpt-oss 20B and up handle real multi-step work, and 8B models need short tasks and a tight leash.

## How tool calling works

The model doesn't run anything itself. It goes like this:

1. You send a message plus a list of tools, each with a name, a description and the arguments it takes.
2. The model either answers, or replies with a tool call: "call `get_weather` with `city: Lisbon`".
3. Your code runs the tool and sends the result back.
4. The model reads the result and either answers or calls another tool.

Ollama supports this in its chat API. Here's a single request with one tool:

```
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3:14b",
  "stream": false,
  "messages": [{"role": "user", "content": "What is the weather in Lisbon?"}],
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "Get the current weather for a city",
      "parameters": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"]
      }
    }
  }]
}'
```

If the model decides to use the tool, the reply's `message` has a `tool_calls` list with the function name and arguments. Your code runs it and adds the result as a message with the role `tool`. That loop is all an agent is. For the API basics, see [the Ollama API guide](/learn/ollama-api-guide).

## What MCP adds

The **Model Context Protocol** is a standard way to package tools. Instead of writing your own tool code for every app, you run an MCP server, for files, a database, a browser or a calendar, and any MCP-capable client can use its tools.

MCP doesn't care where the model runs. Several desktop chat apps, editor extensions and agent frameworks support both MCP servers and local models through Ollama. The catch is that each MCP server can bring many tools, and every tool's description goes into the prompt. Connect five servers and a small model is reading a long menu before it even sees your question.

## What works on small models

| Model | Tools it handles well | Good for |
|---|---|---|
| [Qwen3 8B](/model/qwen3-8b) | One to three simple tools | Single-step lookups, home automation |
| [Qwen3 14B](/model/qwen3-14b) | A handful | Short chains of two or three steps |
| [gpt-oss 20B](/model/gpt-oss-20b) | Many, with reasoning | Real multi-step tasks on 16 GB |
| [Qwen3 30B-A3B](/model/qwen3-30b-a3b) | Many, and fast | Agents that need lots of steps quickly |
| [gpt-oss 120B](/model/gpt-oss-120b) | Close to cloud models | Long tasks on 64 GB and up |

These are our general picks, not benchmark scores. Try your own task on two sizes before committing.

## Keep a small model on track

- **Give it fewer tools.** Five well-named tools beat thirty. Only connect the MCP servers the task needs.
- **Write clear descriptions.** The description is the only thing the model knows about a tool. Say what it does and when to use it.
- **Keep arguments simple.** Flat strings and numbers work. Deeply nested objects cause mistakes.
- **Cap the steps.** Stop the loop after ten or so calls. Small models can repeat the same call forever.
- **Raise the context length.** Tool lists and results fill the window fast. 16K is a sensible floor; see [context length and the KV cache](/learn/context-length-and-kv-cache).
- **Validate every call.** Check the arguments before running anything, and send a clear error back if they're wrong. Models often fix themselves on the second try.

## Speed adds up

An agent might make ten model calls for one task, so per-call speed multiplies. Here's a 24 GB RTX 3090 from our calculator:

{{lineup rtx-3090}}

Our estimates put both gpt-oss 20B and Qwen3 30B-A3B at about 164 tok/s on this card, against about 26 tok/s for the dense Qwen3 32B. For agents, the mixture-of-experts models are the clear pick. See [mixture of experts explained](/learn/mixture-of-experts-explained).

## Be careful what you connect

An agent that can delete files, send email or spend money will one day do it wrongly. Text it reads, like a web page or an email, can also contain instructions that try to steer it. Give tools the least access they need, and require a human yes for anything you can't undo.

## Where to go next

For model picks focused on tools, see [the best local model for agents](/learn/best-local-model-for-agents-and-tool-calling). For coding agents in your editor, see [a local coding assistant in VS Code](/learn/local-coding-assistant-in-vs-code).
