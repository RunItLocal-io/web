---
title: "Use Ollama from other devices: OLLAMA_HOST, phones and other PCs"
description: Make Ollama reachable from your phone, laptop or another PC on your home network by setting OLLAMA_HOST on Mac, Windows and Linux, and keep it safe.
track: serve
order: 6
date: 2026-10-26
models: qwen3-8b, qwen3-14b
---
**By default Ollama only answers on the computer it runs on.** To use it from a phone, a laptop or another PC, set `OLLAMA_HOST=0.0.0.0:11434` and restart Ollama. Then other devices reach it at your computer's local IP address, port 11434.

This is the usual setup for one strong desktop with a GPU serving the whole house. Keep it on your home network; never forward port 11434 on your router.

## Step 1: Set OLLAMA_HOST

`0.0.0.0` means "listen on every network connection", not just this computer. How you set it depends on how Ollama runs.

**Linux (installed as a service).** Edit the service:

```sh
sudo systemctl edit ollama.service
```

Add these two lines in the editor, then save:

```
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
```

Then reload and restart:

```sh
sudo systemctl daemon-reload && sudo systemctl restart ollama
```

**Mac (the Ollama app).** Set the variable, then quit Ollama from the menu bar and open it again:

```sh
launchctl setenv OLLAMA_HOST "0.0.0.0:11434"
```

That setting doesn't survive a reboot, so you'll need to run it again after restarting. Recent versions of the app also have a network option in Settings that does the same job.

**Windows.** Quit Ollama from the system tray. Open "Edit the system environment variables" from the Start menu, add a user variable named `OLLAMA_HOST` with the value `0.0.0.0:11434`, and start Ollama again. When Windows asks whether to allow it through the firewall, allow it on private networks only.

## Step 2: Find your computer's IP address

| System | Command | Look for |
|---|---|---|
| Mac | `ipconfig getifaddr en0` | Wi-Fi address |
| Linux | `hostname -I` | The first address |
| Windows | `ipconfig` | IPv4 Address |

It usually looks like `192.168.1.50`. Give the computer a fixed address in your router's settings so it doesn't change next week.

## Step 3: Test from another device

From another computer on the same network, using your server's address:

```sh
curl http://192.168.1.50:11434
```

You should see "Ollama is running". If it hangs, it's almost always the firewall on the Ollama machine, or the variable didn't take because Ollama wasn't fully restarted.

Then point apps at `http://192.168.1.50:11434`. Anything that speaks the OpenAI API uses `http://192.168.1.50:11434/v1`; see the [Ollama API guide](/learn/ollama-api-guide).

## Phones and tablets

The phone doesn't run the model; it just sends text to your server. You have two good options:

- **A web chat on the server.** Run [Open WebUI](/learn/open-webui-setup) on the same machine and open `http://192.168.1.50:3000` in your phone's browser. Add it to your home screen and it behaves like an app. This is what we'd do.
- **A phone app that talks to Ollama.** Many chat apps let you enter an Ollama server address. Use the same `http://192.168.1.50:11434`.

Browser-based apps served from somewhere else may also need `OLLAMA_ORIGINS` set to allow their address. If an app says it can't connect but `curl` works, that's the likely cause.

## Other PCs and coding tools

A laptop with weak graphics can use the desktop's GPU for everything: coding assistants, note apps and scripts. Set the extension's Ollama URL to the server address. One machine serves several people fine at home; if the model is busy, requests wait their turn. `OLLAMA_NUM_PARALLEL` lets it answer several at once, at the cost of more memory for context.

## How big a model to serve

A shared server should run something a step up from what a laptop can, with room for context. Here's what our calculator estimates for an RTX 3090, the card in our "Popular" build on the [builds page](/builds):

{{lineup rtx-3090}}

[Qwen3 14B](/model/qwen3-14b) or Qwen3 30B-A3B are good household defaults on that card.

## Keep it safe

Ollama has no passwords. Anyone who can reach port 11434 can use your models and your GPU. On a home network that's usually fine. On shared Wi-Fi, in a dorm or at the office, it isn't.

- Never forward 11434 on your router.
- For access away from home, use [Tailscale or a Cloudflare tunnel](/learn/remote-access-with-tailscale-or-cloudflare).
- Read [securing your local AI server](/learn/secure-your-local-ai-server) for the full checklist.
