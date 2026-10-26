---
title: "Local AI glossary: tokens, context, quants and GGUF in plain English"
description: The words you'll meet when running AI models locally, explained in a sentence or two each: tokens, context, VRAM, quantization, GGUF, MoE and more.
track: start
order: 9
date: 2026-10-26
models: qwen3-8b, qwen3-30b-a3b, qwen3-32b
---
Local AI comes with a lot of jargon. Here's what the words mean, in the order you'll probably meet them. Where it matters, each one links to a longer guide.

## The basics

- **Model.** The file that does the thinking. It's a big list of numbers, called weights, learned during training. Running it is called **inference**.
- **Open weights.** A model whose files you can download and run yourself, like Qwen3, Gemma 3, Llama 3.3 or gpt-oss. Each comes with a license that says what you can do with it.
- **Parameters.** How many numbers are in the model. "8B" means 8 billion. More parameters usually means smarter and always means bigger.
- **Token.** The chunk of text a model reads and writes, about three quarters of a word in English.
- **Tokens per second (tok/s).** How fast a model writes. About 10 tok/s is reading speed; 30 and up feels instant.

## Memory and speed

- **VRAM.** The memory on your graphics card. The model has to fit in it to run fast. This is the number that decides what you can run. See [how much VRAM you need](/learn/how-much-vram-do-you-need).
- **Unified memory.** On Apple silicon Macs, one pool of memory shared by the processor and GPU. The GPU can use about two thirds to three quarters of it.
- **Memory bandwidth.** How fast memory can be read, in GB/s. To write each token, the model reads its weights once, so bandwidth sets speed. Our calculator's rule: tok/s ≈ bandwidth ÷ model size in GB × 0.55. See [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed).
- **Offloading.** When a model doesn't fit in VRAM, part of it runs on the processor and system RAM. It works, but several times slower.
- **Prompt processing.** The model reading your input before it starts answering, also called prefill. Fast on modern GPUs, slow on CPUs and old cards.

Here's the bandwidth rule in action. An RTX 3090 has 936 GB/s. [Qwen3 32B](/model/qwen3-32b) is 20 GB, so our estimate is about 26 tok/s:

{{lineup rtx-3090}}

## Context

- **Context window.** How much text the model can hold in mind at once, prompt and answer together, counted in tokens. Qwen3 handles 32K natively; Gemma 3 and gpt-oss handle 128K.
- **Context length setting.** How much of that window your app actually reserves. Ollama starts small to save memory; you can raise it.
- **KV cache.** The memory a model uses to hold the current conversation. It grows with every token, which is why long context needs more VRAM.

## Quantization and files

- **Quantization (quant).** Storing each weight with fewer bits so the model is smaller and faster. A 4-bit model is under a third the size of the original 16-bit one and loses surprisingly little. See [quantization explained](/learn/quantization-explained).
- **Q4_K_M, Q8_0, FP16.** Names for quant levels. The number is roughly bits per weight. Q4_K_M is the common default; Q8_0 is near-lossless and twice the size; FP16 is the full original.
- **GGUF.** The single-file model format used by llama.cpp, Ollama and LM Studio. One `.gguf` file holds the weights, the quant and the settings.
- **Safetensors.** The format models are usually published in on Hugging Face, at full precision. Server tools like vLLM use these.
- **MLX.** Apple's format and framework for running models on Macs. LM Studio can use it.
- **Modelfile.** Ollama's recipe file: which weights to use, plus a system prompt and settings. You build one with `ollama create`.

## Kinds of models

- **Dense model.** Every parameter works on every token. [Qwen3 32B](/model/qwen3-32b) is dense.
- **Mixture of experts (MoE).** Only some parameters, the "active" ones, work on each token. [Qwen3 30B-A3B](/model/qwen3-30b-a3b) has 30B total and 3B active, so it needs memory like a 30B but runs at the speed of a much smaller model. See [mixture of experts explained](/learn/mixture-of-experts-explained).
- **Thinking model.** One that reasons step by step before answering. Slower, but better at hard problems. Qwen3 and gpt-oss both do this.
- **Vision model.** One that reads images as well as text, like Gemma 3.
- **Embedding model.** A small model that turns text into numbers for search, like nomic-embed-text. Used for document search.

## Using models

- **System prompt.** Standing instructions applied to every message in a chat, like "Answer briefly."
- **Temperature.** How random the answers are. Lower is more predictable; higher is more varied.
- **RAG.** Retrieval-augmented generation: finding the relevant parts of your documents and handing them to the model with your question. See [chat with your documents](/learn/chat-with-your-documents-locally).
- **Fine-tune.** A model trained further on extra data to change its style or skills.
- **API endpoint.** The local address apps use to talk to a model. Ollama's is `http://localhost:11434`.

## Where to go next

- **Ready to try it?** [Run your first model](/learn/how-to-run-ai-locally) in ten minutes.
- **Pick a model** from [the ten we track](/model), each with speeds on every GPU.
