---
title: "Local AI for Home Assistant: a private voice assistant with Ollama"
description: Connect Home Assistant to a model running on your own hardware with the Ollama integration. What hardware you need, which model to pick, and how to set it up.
track: use
order: 6
date: 2026-10-26
models: qwen3-4b, qwen3-8b, qwen3-14b
---
**Home Assistant has an Ollama integration, so you can use a model on your own hardware as its conversation agent.** Ask "is the garage door open?" or "turn off everything downstairs" in plain words, by text or voice, and nothing goes to the cloud. You need a machine with a graphics card running Ollama, and Home Assistant needs to reach it over your network.

## The layout

Most people run two boxes:

- **Home Assistant** on whatever it already runs on: a Raspberry Pi, a mini PC, or a virtual machine.
- **Ollama** on a PC with a GPU. A Pi can't run a useful model at a usable speed.

They talk over your home network. Home Assistant sends the request and a description of your devices, and the model replies with an answer or a request to control something.

## Step 1: Let Ollama listen on the network

By default Ollama only accepts requests from the same machine. On the GPU machine, make it listen on your network:

```sh
OLLAMA_HOST=0.0.0.0 ollama serve
```

That's for a Linux machine started by hand. If Ollama runs as a service, or on Windows or Mac, set `OLLAMA_HOST` as an environment variable the way that system expects and restart Ollama. Full details are in [Ollama on your network](/learn/ollama-on-your-network). Don't forward port 11434 to the internet; Ollama has no login.

Then pull a model:

```sh
ollama pull qwen3:8b
```

## Step 2: Add the integration

In Home Assistant, add the **Ollama** integration from the integrations page. It asks for the address of your Ollama machine, like `http://192.168.1.50:11434`, and then which model to use.

The integration's options let you set the instructions the model gets and whether it may control your devices or only answer questions. Then set it as the conversation agent in your voice assistant settings. Menu names change between Home Assistant releases, so if something has moved, the integration's documentation page is the reliable reference.

## Step 3: Choose what it can see

Home Assistant only gives the model the devices you expose to its assistant. This matters more than it sounds:

- **Fewer devices means better answers.** Every exposed device goes into the prompt. A small model with 200 entities in front of it gets confused; with 30 well-named ones it does fine.
- **Name things clearly.** "Kitchen ceiling light" works far better than "light.shelly_1pm_a3f2".
- **Leave out anything risky,** like locks or the alarm, until you trust it.

## Which model to use

Home control needs a model that's good at tool calling and quick to answer. Bigger isn't automatically better here, because you're waiting for every reply.

| Card | Pick | Notes |
|---|---|---|
| 8 GB | [Qwen3 8B](/model/qwen3-8b) | The usual choice. Reliable with a modest device list |
| 6 GB or less | [Qwen3 4B](/model/qwen3-4b) | Works for simple commands; keep the device list short |
| 12 GB | [Qwen3 14B](/model/qwen3-14b) | Better with vague requests and bigger homes |

Turn off Qwen3's thinking for this. Add `/no_think` to the instructions, so it answers immediately instead of reasoning first.

## Hardware: cheap and always on

This machine runs all day, so power and noise matter more than peak speed. Our **Starter** build, a used desktop with an RTX 3060 12 GB, comes to about **$300 to $400** and draws about 200 W under load, much less at idle. Full parts list on the [builds page](/builds).

Here's that card from our calculator:

{{lineup rtx-3060 12}}

About 38 tok/s for Qwen3 8B is plenty, since home replies are a sentence or two. For a quiet, always-on box, see [the home AI server build](/learn/home-ai-server-build).

## Add voice

Home Assistant's voice pipeline can also run speech locally, with Whisper for speech-to-text and Piper for text-to-speech, so the whole loop stays in your house. Whisper on the GPU machine is much faster than on a Pi. For the general picture, see [build a local voice assistant](/learn/local-voice-assistant).

## When it goes wrong

- **It says it did something but nothing happened.** Usually the model wasn't allowed to control devices, or the device isn't exposed. Check both.
- **Slow first reply.** Ollama unloads idle models after a few minutes. Raise its keep-alive so the model stays in memory.
- **It controls the wrong thing.** Rename devices and areas clearly, and expose fewer of them.

Want to know what else your card can run? Check [every GPU](/gpu).
