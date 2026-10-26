---
title: "Run AI in your browser with WebGPU: local models, no install"
description: How WebLLM and WebGPU run language models and image generation on your own GPU inside a browser tab, what works, and where it falls short of Ollama.
track: start
order: 13
date: 2026-10-26
models: qwen3-4b, qwen3-8b
---
**You can run a real AI model on your own graphics card without installing anything.** Modern browsers can use the GPU through a standard called WebGPU, and projects like WebLLM use it to run language models right in a tab. The model downloads once, then runs on your machine, and keeps working offline.

The quickest way to try it is our [Studio](/studio): open it, pick a model, and start chatting.

## How it works

**WebGPU** is a browser feature that lets web pages run work on your graphics card, the way games and apps do. **WebLLM**, from the MLC project, compiles models so they run on it. The first time you pick a model, the browser downloads its files and stores them on your device. After that it loads from disk, not the internet.

Your prompts never leave the tab. The page is just a delivery method; the thinking happens on your own GPU, the same as with Ollama. See [local AI privacy](/learn/local-ai-privacy-what-stays-on-your-machine).

## What the Studio runs

The Studio offers a range of 4-bit chat models, from tiny ones under 1 GB to [Qwen3 8B](/model/qwen3-8b) at about 5.7 GB, plus image generation:

| Kind | Examples | Download |
|---|---|---|
| Tiny and fast | Gemma 3 1B, Llama 3.2 1B | under 1 GB |
| Everyday chat | [Qwen3 4B](/model/qwen3-4b), Llama 3.2 3B | about 2 to 3.5 GB |
| The smartest | Qwen3 8B, Llama 3.1 8B | about 5 to 5.7 GB |
| Code and reasoning | Qwen2.5 Coder 7B, Phi-4 mini | about 3.5 to 5 GB |
| Images | SD-Turbo, 512 px, one step | about 2.5 GB |

It checks your GPU first and tells you which models it can run. Chats and images are saved in your browser on this device, and it can run Python in a sandbox in the tab. You can install it as an app and use it offline.

## What you need

- **A browser with WebGPU.** Chrome and Edge on desktop have it on by default. Safari and Firefox have been adding it; update to the latest version and try.
- **A GPU with some free memory.** Tiny models work on most laptops with built-in graphics. The 8B models need a real graphics card or a recent Mac. Some models and the image generator also need 16-bit shader support, which the Studio checks for.
- **Disk space and patience for the first load.** A 5 GB model is a 5 GB download, once.

## Browser vs Ollama

| | Browser (WebGPU) | Ollama |
|---|---|---|
| Install | None | One app |
| Largest models | About 8B in our Studio | Whatever fits your memory |
| Speed | Usually below native | Full speed |
| Works offline | Yes, after first load | Yes |
| Use from other apps | No | Yes, through its API |
| Models stored | Browser storage | A folder on disk |

The browser only gets part of your GPU's memory, and has to share the card with everything else on screen. That's why it tops out at small models. For 14B, 30B or bigger, use Ollama: [run your first model](/learn/how-to-run-ai-locally) takes ten minutes.

## Good uses for browser AI

- **Trying local AI before installing anything.** Find out if your laptop is up to it in a minute.
- **Work computers** where you can't install software.
- **Showing someone.** Send a link instead of a setup guide.
- **Quick image generation** without setting up Stable Diffusion tools.

## When it doesn't work

- **"WebGPU not available."** Update the browser, or try Chrome or Edge. Some Linux setups need it turned on in the browser's flags.
- **A model won't load or the tab crashes.** It ran out of graphics memory. Close other tabs and pick a smaller model.
- **It's using the wrong GPU on a laptop.** Set the browser to use the high-performance GPU in your system's graphics settings.
- **Models disappeared.** Clearing site data or browsing in a private window removes the stored files. They'll download again.

## Then: the same models, faster

If you like what you see, the step up is Ollama on the same machine, which can use all of your graphics memory. Here's what an 8 GB RTX 4060 runs there by our calculator, including Qwen3 8B at about 29 tok/s:

{{lineup rtx-4060}}

## Where to go next

- **Open the [Studio](/studio)** and try a model now.
- **No graphics card?** See [running AI without a GPU](/learn/run-ai-on-a-laptop-without-a-gpu).
- **Ready to install?** [Run AI locally](/learn/how-to-run-ai-locally), then check what your card runs on [every GPU](/gpu).
