---
title: "Set up Open WebUI: a private ChatGPT on your own computer"
description: Put a ChatGPT-style chat window on top of Ollama in about ten minutes, with chat history, document upload, and access from your phone.
track: serve
order: 2
date: 2026-10-26
models: qwen3-8b, gemma-3-12b
---
The terminal is fine for testing, but for daily use you want a proper chat window. **Open WebUI** is the most popular one: it looks and works like ChatGPT, keeps your chat history, reads documents and images, and runs entirely on your machine.

## Before you start

You need [Ollama](/learn/how-to-run-ai-locally) installed with at least one model, and **Docker**. On Mac and Windows install Docker Desktop. On Linux, install Docker Engine.

## Step 1: Start Open WebUI

```sh
docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```

What that does:

- `-p 3000:8080` makes it available at `http://localhost:3000`.
- `--add-host=...` lets it reach Ollama running on your computer.
- `-v open-webui:...` keeps your chats and settings when it updates.
- `--restart always` starts it again after a reboot.

## Step 2: Create your account

Open `http://localhost:3000`. The first account you create becomes the admin. It's stored on your machine, not online.

## Step 3: Pick a model and chat

Your Ollama models appear in the menu at the top. Pick one and start typing. If the list is empty, check Ollama is running with `ollama list`.

Good picks: [Qwen3 8B](/model/qwen3-8b) for everyday chat on 8 GB, or [Gemma 3 12B](/model/gemma-3-12b) if you want to drop in screenshots and photos.

## Things worth setting up

**Documents.** Drag a PDF into the chat and ask about it. For a set of files you use often, create a Knowledge collection in the Workspace section, then type `#` in a chat to pull it in. See [chat with your documents](/learn/chat-with-your-documents-locally).

**A system prompt.** In settings you can give every chat standing instructions, like "Answer briefly. Use metric units."

**Longer context.** In a model's advanced settings, raise the context length if you paste long documents. It costs memory; see [how much VRAM you need](/learn/how-much-vram-do-you-need).

## Use it from your phone

Anyone on your home network can open `http://<your-computer's-IP>:3000`. To use it away from home, put it behind a private network like Tailscale rather than opening a port to the internet. Open WebUI has logins, but it's not meant to face the open internet.

## Updating

```sh
docker pull ghcr.io/open-webui/open-webui:main
```

Then remove the old container and run the Step 1 command again. Your chats live in the `open-webui` volume, so they stay.

## Without Docker

If you have Python 3.11 you can install it directly:

```sh
pip install open-webui && open-webui serve
```

That serves it at `http://localhost:8080`.
