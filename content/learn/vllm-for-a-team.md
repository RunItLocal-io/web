---
title: "vLLM vs Ollama: when to move to vLLM for a team"
description: Ollama is right for one person. vLLM is built for many users at once. When the switch is worth it, what hardware vLLM needs, and how to start it.
track: serve
order: 10
date: 2026-10-26
models: qwen3-8b, qwen3-30b-a3b, qwen3-32b
---
**Stay on Ollama until several people are waiting on it at the same time.** Ollama and llama.cpp are best for one user or a household. vLLM is a server engine built for many simultaneous requests: it batches them together on the GPU, so total throughput grows a lot as users are added, while each person's speed drops only a little. The catch is that it wants newer NVIDIA cards, more memory headroom and more setup.

## The difference in one table

| | Ollama / llama.cpp | vLLM |
|---|---|---|
| Built for | One user, a few at most | Many users at once |
| Model files | GGUF | Mostly Hugging Face safetensors (AWQ, GPTQ, FP8 and full precision) |
| Hardware | Almost anything, including CPUs, Macs and old cards | Recent NVIDIA cards, Ampere or newer works best; some AMD with ROCm |
| Memory use | Only what the model and context need | Reserves most of the card up front |
| Swapping models | Loads and unloads on demand | One model per server process |
| Setup | Minutes | An evening |
| API | OpenAI-compatible | OpenAI-compatible |

Both speak the OpenAI API, so apps don't care which one is behind them. You can switch later without changing your tools.

## Signs you've outgrown Ollama

- **People wait in line.** Ollama handles a few requests in parallel, set with `OLLAMA_NUM_PARALLEL`, but it isn't designed for a crowd. If replies stall while a colleague's long job runs, that's the sign.
- **You're running batch jobs.** Thousands of documents to summarize or classify finish far faster with vLLM's batching. See [batch jobs with a local model](/learn/batch-jobs-with-a-local-model).
- **You have a dedicated server.** A box that runs one model all day for a team is exactly vLLM's job.

If you're one person with one card, vLLM gives you little. Single-user speed is set by memory bandwidth either way; see [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed).

## Hardware it needs

- **A recent NVIDIA card.** Ampere (RTX 30-series and the RTX A-series) or newer is the safe choice; check vLLM's docs for older generations. Pascal cards like the [Tesla P100](/learn/tesla-p100-for-local-llms) and P40 are not supported, which is a real limit for budget racks: on P100s, llama.cpp-based tools are the option. The RTX 3090 and [RTX A4500](/gpu/rtx-a4500) work well.
- **Headroom.** vLLM claims about 90% of each card's memory by default and uses what's left after the model for a large KV cache. That cache is what lets it serve many users, so a model that barely fits is a poor choice.
- **Matched cards for multi-GPU.** vLLM splits a model across cards with tensor parallelism, which runs the cards together rather than taking turns. Use identical cards, in counts of 2, 4 or 8.

## Starting vLLM

On Linux with an NVIDIA card and Python installed:

```sh
pip install vllm
```

Then serve a model by its Hugging Face name:

```sh
vllm serve Qwen/Qwen3-8B --max-model-len 16384 --api-key YOUR_LONG_RANDOM_KEY
```

That downloads the model and serves an OpenAI-compatible API on port 8000, at `http://localhost:8000/v1`. Useful options:

- `--max-model-len` caps the context. Lower it if the model won't start for lack of memory.
- `--tensor-parallel-size 2` splits the model across two GPUs.
- `--gpu-memory-utilization 0.8` reserves less of the card, if something else needs it.
- `--api-key` requires a key on every request. Set one; see [securing your local AI server](/learn/secure-your-local-ai-server).

There's also an official Docker image, `vllm/vllm-openai`, which takes the same options and needs the same NVIDIA Container Toolkit setup as [Ollama in Docker](/learn/run-ollama-in-docker).

## Which model for a team

The model sets single-user speed; the card's spare memory sets how many users fit. A mixture-of-experts model like [Qwen3 30B-A3B](/model/qwen3-30b-a3b) is a strong team choice: it reads only 3B parameters per token, so it stays fast under load. A dense [Qwen3 32B](/model/qwen3-32b) is smarter on hard problems but slower for everyone. Here's our calculator's single-user estimate for two RTX 3090s, 48 GB, the "Serious" build on the [builds page](/builds) that we pitch for small teams:

{{lineup rtx-3090 48}}

With vLLM's tensor parallelism, two matched cards can beat that single-user number, and the total across many users is far higher.

## A middle path

Before vLLM, try the [llama.cpp server](/learn/llama-cpp-server-guide) with parallel slots (`-np 4`). It also batches requests, runs GGUF files, and works on older cards. It also runs on old cards like the P100s in our rack of 90 used GPUs; see [serving a team on used GPUs](/learn/serve-a-team-on-used-gpus) for what that looks like.
