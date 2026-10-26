---
title: "Ollama on Linux with an NVIDIA GPU: drivers, setup and fixes"
description: Install the NVIDIA driver, install Ollama as a service, confirm it's using the GPU, and fix the problems that send it to the CPU instead.
track: start
order: 6
date: 2026-10-26
models: qwen3-8b, qwen3-30b-a3b, qwen3-32b
---
On Linux, the only part that takes thought is the NVIDIA driver. Get `nvidia-smi` working first, then Ollama's install script does the rest. You don't need to install the CUDA toolkit: Ollama brings the CUDA libraries it needs.

This is how our own rack of 90 used GPUs is set up: Linux, the NVIDIA driver, and llama.cpp-based tools on top.

## Step 1: Install the NVIDIA driver

Use your distribution's packaged driver rather than the installer from NVIDIA's website. It survives kernel updates better.

On Ubuntu and its relatives:

```sh
sudo ubuntu-drivers install
```

On Fedora, the usual route is the `akmod-nvidia` package from RPM Fusion. On Debian, Arch and others, follow your distribution's NVIDIA wiki page. Then reboot.

## Step 2: Check the driver works

```sh
nvidia-smi
```

You should see a table listing your card, its memory, and a driver version. If you get "command not found" or "couldn't communicate with the NVIDIA driver", stop here and fix it. Ollama can't use the card until this works. The two usual causes:

- **Secure Boot** is blocking the driver module. Either enroll the key your distribution offers during install, or turn Secure Boot off in the firmware.
- **You haven't rebooted** since installing, so the open-source `nouveau` driver is still loaded.

## Step 3: Install Ollama

```sh
curl -fsSL https://ollama.com/install.sh | sh
```

The script installs the `ollama` binary, creates an `ollama` system user, sets up a systemd service that starts at boot, and detects your NVIDIA or AMD card. Check the service is running:

```sh
systemctl status ollama
```

## Step 4: Run a model and check the GPU

```sh
ollama run qwen3:8b
```

In another terminal:

```sh
ollama ps
```

The `PROCESSOR` column should say `100% GPU`. For a live view of memory use and load, run `watch -n 1 nvidia-smi` while the model answers.

## What a 24 GB card runs

A used RTX 3090 is the most common card in Linux AI boxes. From our calculator:

{{lineup rtx-3090}}

That's [Qwen3 30B-A3B](/model/qwen3-30b-a3b) at well over 100 tok/s and [Qwen3 32B](/model/qwen3-32b) at about reading speed, by our estimate. See [every GPU](/gpu) for yours.

## When it runs on the CPU anyway

Read the logs first. They say which GPU was found, or why none was:

```sh
journalctl -u ollama --no-pager | tail -50
```

The common causes:

- **You installed Ollama before the driver.** Restart the service after the driver works: `sudo systemctl restart ollama`.
- **The driver broke after a kernel update.** `nvidia-smi` fails again. Reinstall or rebuild the driver package and reboot.
- **The model is too big.** A split like `25%/75% CPU/GPU` means it didn't fit. See [how much VRAM you need](/learn/how-much-vram-do-you-need).
- **The card is very old.** Tesla P100s and other Pascal cards still work with llama.cpp-based tools, but NVIDIA's newest CUDA releases have dropped them. Stay on a driver that supports your card. Our [P100 guide](/learn/tesla-p100-for-local-llms) covers this.

## Changing settings

Because Ollama runs as a systemd service, environment variables go in a service override, not your shell profile:

```sh
sudo systemctl edit ollama.service
```

Add lines like these, save, then run `sudo systemctl restart ollama`:

```
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_MODELS=/data/ollama/models"
```

`OLLAMA_HOST` set like that makes Ollama reachable from other machines on your network. Only do that on a network you trust: there's no login on port 11434. `OLLAMA_MODELS` moves the model folder; the `ollama` user needs to own it. See [where Ollama stores models](/learn/where-ollama-stores-models).

## AMD cards and Docker

**AMD:** the install script also sets up support for many Radeon and Instinct cards through ROCm. If yours isn't supported, llama.cpp's Vulkan build usually works.

**Docker:** to give a container your NVIDIA card, install the NVIDIA Container Toolkit, then run containers with `--gpus=all`. That's also how you'd run [Open WebUI](/learn/open-webui-setup) next to Ollama.

## Where to go next

- **Every command in one place:** the [Ollama cheat sheet](/learn/ollama-commands-cheat-sheet).
- **Building a dedicated box?** The [builds page](/builds) has used workstation parts lists, from a single RTX 3060 to a ten-GPU server.
- **Running it headless for a household?** Start with [Open WebUI](/learn/open-webui-setup).
