---
title: "Ollama using CPU instead of GPU? How to check and fix it"
description: Ollama slow and your GPU idle? Check with ollama ps, then fix the usual causes - model too big, drivers, Docker, laptops, AMD and sleep - step by step.
track: serve
order: 15
date: 2026-10-26
models: qwen3-8b, qwen3-14b, gemma-3-12b
---
**Run `ollama ps` while a model is loaded and look at the PROCESSOR column.** "100% GPU" is what you want. A split like "40%/60% CPU/GPU" means the model didn't fit in graphics memory and part of it runs on the CPU. "100% CPU" means Ollama can't use your GPU at all. Each has a different fix.

```sh
ollama ps
```

If nothing is listed, the model isn't loaded. Run a prompt first, then check again.

## A split: the model is too big

This is the most common cause. Ollama loads as much of the model as fits on the GPU and puts the rest on the CPU, and even a small CPU share slows things a lot. Speed often drops five to ten times.

Check the SIZE column in `ollama ps` against your card's memory. The size includes the context, so a model that fit yesterday can spill today if you raised the context length.

Fixes, best first:

1. **Pick a smaller model or quant.** On an 8 GB card, [Qwen3 8B](/model/qwen3-8b) fits; 14B doesn't.
2. **Lower the context.** If you raised `num_ctx` or `OLLAMA_CONTEXT_LENGTH`, bring it down. See [increasing Ollama's context length](/learn/increase-ollama-context-length) for the costs.
3. **Close other GPU users.** Games, browsers with many tabs, and other AI apps all hold graphics memory. `nvidia-smi` shows what's using it.
4. **Unload other models.** `ollama ps` may show two models loaded. Stop one with `ollama stop` followed by its name.

Here's what our calculator says fits on an 8 GB RTX 4060:

{{lineup rtx-4060}}

Anything marked "does not fit" will run split. For the full picture, see [how much VRAM you need](/learn/how-much-vram-do-you-need).

## 100% CPU: Ollama can't see the GPU

**Check the driver first.** On NVIDIA:

```sh
nvidia-smi
```

If that fails or isn't found, the driver isn't installed or isn't working. Install the current driver from NVIDIA or your Linux distribution, reboot, and restart Ollama. If you installed the drivers after Ollama on Linux, restart the service so it detects them:

```sh
sudo systemctl restart ollama
```

**Read the log.** Ollama writes what it found at startup:

- Linux: `journalctl -u ollama --no-pager | tail -50`
- Mac: `~/.ollama/logs/server.log`
- Windows: `server.log` in `%LOCALAPPDATA%\Ollama`

Look for lines about the GPU it found, or errors about CUDA or ROCm. Setting `OLLAMA_DEBUG=1` before starting Ollama makes the log more detailed.

## Specific situations

**Docker.** The container needs `--gpus=all` and the NVIDIA Container Toolkit on the host. Without them it silently runs on the CPU. See [running Ollama in Docker](/learn/run-ollama-in-docker).

**Linux after sleep.** On some Linux systems the NVIDIA card disappears from Ollama after the machine suspends and wakes. Reloading the driver's memory module fixes it without a reboot:

```sh
sudo rmmod nvidia_uvm && sudo modprobe nvidia_uvm
```

Then restart Ollama.

**Laptops with two GPUs.** Many laptops have both built-in graphics and an NVIDIA chip. Plug in the charger, and in the NVIDIA control panel or Windows graphics settings set Ollama to use the high-performance GPU.

**AMD cards.** Ollama supports many recent Radeon cards through ROCm, but not every model. On Linux, some unsupported cards work by setting `HSA_OVERRIDE_GFX_VERSION` to the nearest supported chip version; check Ollama's GPU docs for the right value. On Windows, unsupported AMD cards fall back to the CPU. See [AMD GPUs for local AI](/learn/amd-gpus-for-local-ai).

**Older NVIDIA cards.** Pascal cards like the [Tesla P100](/learn/tesla-p100-for-local-llms) run on llama.cpp-based tools, but NVIDIA's newest CUDA releases have dropped Pascal, so stay on a driver that still supports your card. If an update stops Ollama using an old card, the [llama.cpp server](/learn/llama-cpp-server-guide) built for your card is the fallback.

**Several GPUs, wrong one used.** `CUDA_VISIBLE_DEVICES` controls which NVIDIA cards Ollama sees. Set it to the card numbers from `nvidia-smi`, like `0` or `0,1`, where the Ollama server runs.

**Macs.** Apple silicon always uses the GPU through Metal in the normal Ollama app. Intel Macs and Docker on a Mac run on the CPU.

## Confirm the fix

Run a prompt, then:

```sh
ollama ps
```

You want "100% GPU". You can also watch `nvidia-smi` while it answers: memory should be in use and utilization should jump. Then compare your speed with our calculator's estimate on your card's [GPU page](/gpu). If you're close, you're done. If you're still far below, see [why your LLM is slow](/learn/memory-bandwidth-and-llm-speed).
