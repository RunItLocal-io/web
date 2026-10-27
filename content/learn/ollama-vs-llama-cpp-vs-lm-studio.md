---
title: "Ollama vs llama.cpp vs LM Studio: which should you use?"
description: The three most popular ways to run models locally, what each is best at, and when to switch. Short version, start with Ollama.
track: serve
order: 1
date: 2026-10-26
models: qwen3-8b
---
All three run the same models from the same kind of files (GGUF), on the same hardware, at similar speeds. They differ in how much they do for you, and how much they let you control.

## The short version

| | Ollama | LM Studio | llama.cpp |
|---|---|---|---|
| What it is | Background service + command line | Desktop app with a chat window | The engine itself |
| Best for | Most people, and anything that needs an API | People who prefer clicking to typing | Full control and the newest features |
| Finding models | `ollama run name` from its library | Built-in Hugging Face search | Any GGUF file, or `-hf` to download |
| API | OpenAI-compatible, port 11434 | OpenAI-compatible, port 1234 | OpenAI-compatible, port 8080 |
| Open source | Yes | No (free to use) | Yes |

## Ollama: start here

```sh
ollama run qwen3:8b
```

Ollama is built on llama.cpp and hides almost all of its settings. It picks a file size, uses your GPU, unloads idle models, and runs as a service so other apps can use it. Most local AI apps, including [Open WebUI](/learn/open-webui-setup) and coding extensions, expect it.

**Pick it if:** you want it to just work, or you're connecting other tools to a local model.

**Outgrow it when:** you want exact control over offloading, quantization or new model architectures the day they come out.

## LM Studio: the friendliest window

LM Studio is a polished desktop app. You search Hugging Face from inside it, it shows which files fit your memory, and you chat in a clean window. It can also run a local server for other apps.

On Macs it supports **MLX**, Apple's own format, which is often a little faster than GGUF.

**Pick it if:** you'd rather not use a terminal, or you want to try lots of different models and quants quickly.

## llama.cpp: the engine

llama.cpp is the open-source engine under Ollama, LM Studio and much of local AI. Using it directly gives you every setting and the newest features first. To serve a model to other apps:

```sh
llama-server -hf ggml-org/gemma-3-4b-it-GGUF -ngl 99 -c 16384
```

That downloads the model, puts all layers on the GPU (`-ngl 99`), sets a 16K context (`-c`), and serves a chat page and API at `http://localhost:8080`.

**Pick it if:** you're tuning a rig, splitting a model across GPUs or between GPU and CPU, running older cards like the [Tesla P100](/learn/tesla-p100-for-local-llms), or benchmarking. [Our benchmark](/learn/how-we-benchmark) uses it.

## What about vLLM?

vLLM is a server engine built for many users at once on newer NVIDIA cards. It's much faster than the three above when serving a team, and harder to set up. It's not the place to start.

## Our advice

1. Start with **Ollama**.
2. Add **LM Studio** if you want to browse and compare models in a window.
3. Move to **llama.cpp** when you want to squeeze the most out of your hardware.

They all read the same model files, so nothing you download is wasted.
