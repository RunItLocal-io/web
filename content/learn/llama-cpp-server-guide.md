---
title: "llama.cpp server guide: run llama-server with the flags that matter"
description: Install llama.cpp, download a model, and serve it with llama-server. The handful of flags that matter for GPU layers, context and parallel users.
track: serve
order: 3
date: 2026-10-26
models: qwen3-8b, qwen3-30b-a3b
---
**`llama-server` is llama.cpp's built-in server.** One command loads a GGUF model, puts it on your GPU, and serves a chat page plus an OpenAI-compatible API at `http://localhost:8080`. It's what Ollama and LM Studio are built on, with every setting exposed. If you haven't picked a tool yet, read [Ollama vs llama.cpp vs LM Studio](/learn/ollama-vs-llama-cpp-vs-lm-studio) first.

## Install it

On a Mac, Homebrew has it:

```sh
brew install llama.cpp
```

On Windows, `winget install llama.cpp` works, or download a prebuilt release from the llama.cpp GitHub page. Pick the CUDA build for NVIDIA cards and the Vulkan build for AMD or Intel.

On Linux with an NVIDIA card, building it yourself is the usual route. You need the CUDA toolkit, CMake and a compiler:

```sh
cmake -B build -DGGML_CUDA=ON && cmake --build build --config Release -j
```

The programs end up in `build/bin/`. Building for your own card is also how you keep older GPUs like the [Tesla P100](/learn/tesla-p100-for-local-llms) working when prebuilt packages drop them.

## Start a server

```sh
llama-server -hf unsloth/Qwen3-8B-GGUF:Q4_K_M -ngl 99 -c 16384 --jinja
```

That downloads [Qwen3 8B](/model/qwen3-8b) at Q4_K_M from Hugging Face, caches it, and starts serving. Open `http://localhost:8080` for the built-in chat page. If you already have a GGUF file, use `-m path/to/model.gguf` instead of `-hf`.

## The flags that matter

| Flag | What it does | Typical value |
|---|---|---|
| `-m` / `-hf` | Local file, or a Hugging Face repo with an optional `:QUANT` tag | |
| `-ngl` | How many layers go on the GPU | `99` means all of them |
| `-c` | Context length in tokens | `8192` to `32768` |
| `--host` | Which address to listen on | `127.0.0.1` (default) or `0.0.0.0` |
| `--port` | Port | `8080` (default) |
| `-np` | Parallel slots, for several users at once | `1` to `4` |
| `--api-key` | Require a key on every request | a long random string |
| `--jinja` | Use the model's own chat template | on for tool calling |

A few notes on those:

- **`-ngl` is your speed dial.** All layers on the GPU is fastest. If the model doesn't fit, lower it until it loads; the rest runs on the CPU, and speed falls a lot. See [CPU offloading explained](/learn/cpu-offloading-explained).
- **`-c` costs memory.** Context lives in the KV cache, next to the model. Doubling it can add gigabytes. See [how much VRAM you need](/learn/how-much-vram-do-you-need).
- **`-np` splits the context.** With `-c 32768 -np 4`, each of the four slots gets 8,192 tokens. Raise `-c` when you raise `-np`.
- **`--host 0.0.0.0` opens it to your network.** Only do that with `--api-key` set, and never forward the port to the internet. See [securing your local AI server](/learn/secure-your-local-ai-server).

## Use the API

Any app that speaks the OpenAI API can use it. Point it at `http://localhost:8080/v1`:

```sh
curl http://localhost:8080/v1/chat/completions -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Say hello in five words."}]}'
```

You don't need a model name, because the server has one model loaded. `http://localhost:8080/health` answers when it's ready, which is handy for scripts and Docker health checks.

## Two GPUs

If llama.cpp sees two cards, it splits the model's layers across them automatically. Add `-ts 1,1` to set the split ratio by hand, for example `-ts 3,1` if one card has more free memory. A layer split pools memory but runs at about one card's speed, because the cards take turns. That's still the cheapest way to fit a 30B model: on our rack, two Tesla P100s run Qwen3.6-35B-A3B at 53 tok/s, and two RTX A4500s at 110 tok/s.

## What to expect

Speed with everything on the GPU is set by memory bandwidth. Here's what our calculator estimates for two P100s, 32 GB in total, the "Best value" build on the [builds page](/builds):

{{lineup tesla-p100 32}}

## Where to go next

- Want to serve many users? Read [serving a team on used GPUs](/learn/serve-a-team-on-used-gpus).
- Want more speed on big dense models? Try [speculative decoding](/learn/speculative-decoding).
- Running out of memory? See [fixing out-of-memory errors](/learn/fix-out-of-memory-errors).
