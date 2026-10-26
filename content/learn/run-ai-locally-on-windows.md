---
title: "Run a local LLM on Windows: setup with Ollama and an NVIDIA or AMD GPU"
description: Install Ollama on Windows 10 or 11, get it using your graphics card, change where models are stored, and fix the common problems.
track: start
order: 5
date: 2026-10-26
models: qwen3-8b, qwen3-14b, gpt-oss-20b
---
On Windows, local AI takes one installer and one command. You don't need WSL, Python or the CUDA toolkit. Ollama ships with everything it needs to use an NVIDIA card, and supports many recent AMD Radeon cards too.

## Step 1: Update your graphics driver

This is the step people skip, and it causes most problems.

- **NVIDIA:** install the latest Game Ready or Studio driver from NVIDIA's site or the NVIDIA app. You do not need the CUDA toolkit.
- **AMD:** install the latest Adrenalin driver from AMD's site.

## Step 2: Install Ollama

Download the Windows installer from [ollama.com](https://ollama.com/download) and run it. It installs for your user account, without admin rights, and puts an icon in the system tray. The server starts with Windows and runs in the background.

## Step 3: Run a model

Open PowerShell or Windows Terminal and run:

```sh
ollama run qwen3:8b
```

The first run downloads about 5 GB. When you see `>>>`, start typing. Type `/bye` to quit. For the rest of the commands, see the [Ollama cheat sheet](/learn/ollama-commands-cheat-sheet).

## Step 4: Check it's on the GPU

In a second window, while the model is loaded:

```sh
ollama ps
```

You want `100% GPU` in the `PROCESSOR` column. You can also open Task Manager, go to Performance, pick your GPU, and watch **Dedicated GPU memory** jump by about the model's size when it loads.

If it says `100% CPU`, see the fixes below.

## What your card can run

The most common card in a Windows gaming PC right now has 8 GB. Here's an RTX 4060 from our calculator:

{{lineup rtx-4060}}

8 GB runs [Qwen3 8B](/model/qwen3-8b) comfortably. With 12 GB you can step up to [Qwen3 14B](/model/qwen3-14b), and with 16 GB to [gpt-oss 20B](/model/gpt-oss-20b). Look up your exact card on [every GPU](/gpu), or read [how much VRAM you need](/learn/how-much-vram-do-you-need).

## Change where models are stored

Models go in `C:\Users\<you>\.ollama\models` by default. They're big, so if your C: drive is small, move them:

1. Quit Ollama from its tray icon.
2. Open the Start menu and search for **Edit environment variables for your account**.
3. Add a new variable named `OLLAMA_MODELS` with a folder such as `D:\ollama\models`.
4. Start Ollama again.

Full details, including moving the models you already have, are in [where Ollama stores models](/learn/where-ollama-stores-models). Other settings, like `OLLAMA_HOST`, are set the same way.

## Common problems

**It runs on the CPU.** Usually one of three things:

- The model is too big for your VRAM. A partial split like `40%/60% CPU/GPU` means this. Use a smaller model.
- The driver is old. Update it and restart Ollama from the tray.
- On a laptop with two GPUs, Windows is handing Ollama the built-in graphics. In Settings, under Display then Graphics, you can set apps to use the high-performance GPU.

**AMD card not used.** Ollama supports many, but not all, Radeon cards on Windows. If yours isn't picked up, LM Studio's Vulkan option runs on most AMD and Intel cards. See [Ollama vs llama.cpp vs LM Studio](/learn/ollama-vs-llama-cpp-vs-lm-studio).

**`ollama` is not recognized.** Close and reopen the terminal after installing, so it picks up the new path.

**A firewall prompt appears.** That happens if you set `OLLAMA_HOST` to accept connections from other devices. If you only use Ollama on this PC, leave it at the default and you won't see one.

## What about WSL?

You can install Ollama inside WSL2 using the Linux instructions, and it can use an NVIDIA card through the normal Windows driver. There's no speed reason to do it, though. Use it only if your other tools already live in WSL.

## A chat window instead of a terminal

Once Ollama works, add [Open WebUI](/learn/open-webui-setup) through Docker Desktop for a ChatGPT-style window with chat history and document upload. Or install LM Studio, which has its own chat window and model browser.

## Where to go next

- **New to this?** Read [your first week with local AI](/learn/first-week-with-local-ai) for things to try.
- **Thinking about a bigger card?** The [builds page](/builds) has used-market parts lists, and our [used RTX 3090 buying guide](/learn/used-rtx-3090-buying-guide) covers the 24 GB favorite.
