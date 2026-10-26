---
title: "Does Ollama send your data anywhere? Local AI privacy, checked"
description: What stays on your computer when you run a local model, what does go over the network, and how to check for yourself instead of taking anyone's word.
track: start
order: 12
date: 2026-10-26
models: qwen3-8b, qwen3-14b
---
**No. When you chat with a local model in Ollama, your prompts and its answers stay on your computer.** The model runs on your own processor and graphics card, and the server only listens on your own machine by default. What does use the network is downloading models, checking for app updates, and any cloud feature you choose to turn on.

You don't have to take that on trust. You can unplug the internet and keep chatting.

## What stays on your machine

- **Your prompts and the answers.** Generated locally, by a model file sitting on your disk.
- **Files you give it.** A document you paste or upload to a local chat app is read on your machine.
- **Chat history.** The Ollama terminal doesn't save conversations to a server. Chat apps like [Open WebUI](/learn/open-webui-setup) store history in their own local database.

## What does touch the network

- **Downloading models.** `ollama pull` and the first `ollama run` fetch the model from Ollama's registry. That tells the registry which model you downloaded, like any download does. It doesn't send prompts.
- **Update checks.** The desktop apps check for new versions of Ollama.
- **Cloud models and sign-in.** Recent Ollama versions can also run some models on Ollama's own servers if you sign in and choose one. When you use those, your prompts go to their servers, like any cloud AI. The local models you pull and run with the usual tags don't.
- **Anything your chat app adds.** Web search, image generation through an online service, or a connection to a cloud API in Open WebUI all send data out. They're off unless you set them up.

## Check it yourself

**The offline test.** Load a model, turn off Wi-Fi or unplug the network cable, and keep chatting. It keeps working, because nothing about generating an answer needs the internet.

```sh
ollama run qwen3:8b
```

**Check who can reach it.** Ollama's server listens on `127.0.0.1:11434` by default, which means only programs on this computer can talk to it. On Mac or Linux:

```sh
lsof -i :11434
```

If you see `localhost` or `127.0.0.1`, it's private to this machine. If you see `*:11434`, it's open to your network, usually because `OLLAMA_HOST` was set to `0.0.0.0`.

**Watch the traffic.** A network monitor like Little Snitch on a Mac, or your router's traffic page, shows every connection an app makes. During a chat with a local model there's nothing to see.

## The real risks

The bigger privacy risk with local AI isn't the model calling home. It's you accidentally opening it up:

- **Exposing port 11434.** Ollama has no login. If you forward that port on your router, anyone who finds it can use your GPU and your models. To use it from your phone, use a private network like Tailscale instead. Our [Ollama cheat sheet](/learn/ollama-commands-cheat-sheet) covers `OLLAMA_HOST`.
- **Shared computers.** Chat history in a local app is readable by anyone with access to your user account.
- **Mixed setups.** If your chat app has both local and cloud models, check which one is selected before you paste something sensitive.

## Why this matters for real work

Because nothing leaves the machine, local AI suits work you can't paste into a cloud service: client documents, medical or legal notes, source code under an NDA, or internal data. There's no retention policy to read, because there's nothing retained anywhere else.

It also means you can process a lot of it. On our rack of 90 used GPUs, a billion tokens of Qwen3.6-35B-A3B took 2.9 days and cost about 6 to 8 cents of power per million tokens, with every byte staying on our own hardware.

For private documents on a normal PC, a 12 GB card running [Qwen3 14B](/model/qwen3-14b) is a good start. Here's what an RTX 3060 12 GB runs, by our calculator:

{{lineup rtx-3060 12}}

## Browser AI is local too

Models in our [Studio](/studio) run on your own GPU through the browser, and chats are saved in your browser's storage on this device, not on our servers. The model files download once from Hugging Face. See [run AI in your browser](/learn/run-ai-in-your-browser-webgpu).

## Where to go next

- **Weighing privacy against quality?** Read [is local AI worth it](/learn/is-local-ai-worth-it).
- **Want to search your own files privately?** See [chat with your documents](/learn/chat-with-your-documents-locally).
- **Just getting started?** [Run your first model](/learn/how-to-run-ai-locally) in ten minutes.
