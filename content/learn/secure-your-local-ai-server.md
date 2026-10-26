---
title: "Secure your local AI server: don't expose Ollama's port 11434"
description: Ollama has no passwords. How to check what's exposed, lock it to your machine or network, add auth, and reach it remotely without opening ports.
track: serve
order: 12
date: 2026-10-26
models: qwen3-8b
---
**Never expose Ollama's port 11434 to the internet.** Ollama has no logins and no API keys. Anyone who can reach that port can use your GPU, and download or delete your models. Open servers get found by automated scans. The safe setup is simple: keep the model server private, put a front end with real logins in front of it, and use a private network or tunnel for remote access.

## Step 1: Check what's listening

On Linux:

```sh
ss -tlnp | grep 11434
```

On a Mac:

```sh
lsof -iTCP:11434 -sTCP:LISTEN
```

If you see `127.0.0.1:11434`, only your own computer can reach it. That's the default and it's safe. If you see `0.0.0.0:11434` or `*:11434`, every network the machine is on can reach it. That's fine on a trusted home network, risky anywhere else.

Then check your router. If there's a port-forwarding rule for 11434 (or 8080, 1234, 3000 or 8000), delete it.

## Step 2: Expose as little as you need

| You want | Do this |
|---|---|
| Only this computer | Leave `OLLAMA_HOST` unset |
| Other devices at home | `OLLAMA_HOST=0.0.0.0:11434`, plus a firewall rule for your home network |
| Access away from home | A private network or tunnel, not an open port |
| Friends or a team | A front end with logins, behind a private network |

[Ollama on your network](/learn/ollama-on-your-network) covers the home case step by step.

## Step 3: Firewall to your home network

On Ubuntu with ufw, allow only your local network to reach the port. Adjust the range to match your network:

```sh
sudo ufw allow from 192.168.1.0/24 to any port 11434 proto tcp
```

On Windows, allow Ollama on private networks only when the firewall asks. On a Mac, the built-in firewall in System Settings blocks unwanted incoming connections.

**Docker skips ufw.** Ports published with `-p` bypass ufw's rules. If Ollama runs in Docker and only the same machine needs it, publish it as `-p 127.0.0.1:11434:11434`. See [running Ollama in Docker](/learn/run-ollama-in-docker).

## Step 4: Put logins in front

People should log in to a chat app, not reach the model server directly. [Open WebUI](/learn/open-webui-setup) has user accounts and an admin who approves new sign-ups. Run it next to Ollama, and leave Ollama itself on `127.0.0.1` or on Docker's internal network.

If apps need the API directly, use a server that checks keys:

- **llama.cpp:** start `llama-server` with `--api-key`. See the [llama.cpp server guide](/learn/llama-cpp-server-guide).
- **vLLM:** also takes `--api-key`. See [vLLM for a team](/learn/vllm-for-a-team).
- **Ollama:** put a reverse proxy like Caddy or nginx in front that requires a password or key, and keep Ollama on `127.0.0.1`.

Make keys long and random:

```sh
openssl rand -hex 32
```

## Step 5: Remote access without open ports

Two good options, both with free tiers for personal use:

- **Tailscale** puts your devices on a private network. Your phone reaches the server at a private address; nothing is open to the internet.
- **Cloudflare Tunnel** connects outward from your server to Cloudflare, so no ports are opened. Pair it with Cloudflare Access so people must log in before they reach the page.

Setup for both is in [remote access with Tailscale or Cloudflare](/learn/remote-access-with-tailscale-or-cloudflare).

## Other things worth doing

- **Keep things updated.** Update Ollama, Open WebUI and your other tools regularly; security fixes ship in normal releases.
- **Don't run it as root.** The standard Linux installer runs Ollama as its own `ollama` user. Keep it that way.
- **Watch for strangers.** Unexpected models in `ollama list`, or the GPU busy when nobody's using it (`nvidia-smi`), are signs someone else got in.
- **Separate the AI box.** If you can, put the server on its own network segment, away from your NAS and work laptop.

## What's at stake

A home GPU server is a real asset. A 24 GB RTX 3090 like the one in our "Popular" build costs $650 to $850 used and runs serious models; here's what it can do, from our calculator:

{{lineup rtx-3090}}

That's exactly why an open one gets found and used by strangers. Lock it down once and you can forget about it.

Serving more than a few people? Read [serving a team on used GPUs](/learn/serve-a-team-on-used-gpus).
