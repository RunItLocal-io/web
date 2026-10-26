---
title: "Run Ollama in Docker, with NVIDIA GPU support"
description: Run the official ollama/ollama Docker image on CPU or NVIDIA GPU. The NVIDIA Container Toolkit setup, Docker Compose, and checking the GPU is used.
track: serve
order: 9
date: 2026-10-26
models: qwen3-8b, qwen3-14b
---
**The official image is `ollama/ollama`.** On a machine with an NVIDIA card you need the NVIDIA Container Toolkit installed once, and `--gpus=all` on the command. Without those, Ollama runs in the container but uses only the CPU, which is five to ten times slower.

Docker is worth it on a Linux server where everything else already runs in containers. On a Mac, skip it: Docker can't reach the Apple GPU, so install the normal Ollama app instead.

## Step 1: NVIDIA only, install the Container Toolkit

First check the driver works on the host:

```sh
nvidia-smi
```

If that lists your card, install the NVIDIA Container Toolkit. Follow NVIDIA's install guide to add their package repository for your distribution, then on Ubuntu or Debian:

```sh
sudo apt-get install -y nvidia-container-toolkit
```

Tell Docker about it and restart Docker:

```sh
sudo nvidia-ctk runtime configure --runtime=docker && sudo systemctl restart docker
```

On Windows, Docker Desktop with the WSL 2 backend passes NVIDIA GPUs through as long as your normal Windows NVIDIA driver is current. You don't install the toolkit yourself.

## Step 2: Start Ollama

With an NVIDIA GPU:

```sh
docker run -d --gpus=all -v ollama:/root/.ollama -p 11434:11434 --name ollama --restart unless-stopped ollama/ollama
```

CPU only: the same command without `--gpus=all`.

What the parts do:

- `--gpus=all` gives the container your NVIDIA cards.
- `-v ollama:/root/.ollama` keeps downloaded models in a Docker volume, so they survive updates. Models are big; don't skip this.
- `-p 11434:11434` publishes the API. See the warning below.
- `--restart unless-stopped` brings it back after a reboot.

AMD cards on Linux use the `ollama/ollama:rocm` tag and pass the devices in with `--device /dev/kfd --device /dev/dri` instead of `--gpus`.

## Step 3: Run a model

Run the Ollama command inside the container:

```sh
docker exec -it ollama ollama run qwen3:8b
```

Other apps on the host reach the API at `http://localhost:11434` as usual. The [Ollama API guide](/learn/ollama-api-guide) has curl examples.

## Step 4: Check it's on the GPU

```sh
docker exec -it ollama ollama ps
```

The processor column should say "100% GPU". If it says CPU, the container can't see the card. Run `docker exec -it ollama nvidia-smi`; if that fails, the toolkit isn't set up or `--gpus=all` is missing. More causes in [fixing Ollama using the CPU](/learn/fix-ollama-using-cpu-instead-of-gpu).

## Docker Compose

A `compose.yml` for Ollama plus [Open WebUI](/learn/open-webui-setup), with the GPU reserved:

```
services:
  ollama:
    image: ollama/ollama
    volumes: ["ollama:/root/.ollama"]
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          devices: [{driver: nvidia, count: all, capabilities: [gpu]}]
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    ports: ["127.0.0.1:3000:8080"]
    environment: ["OLLAMA_BASE_URL=http://ollama:11434"]
    volumes: ["open-webui:/app/backend/data"]
    restart: unless-stopped
volumes:
  ollama:
  open-webui:
```

Start it with `docker compose up -d`. Open WebUI talks to Ollama over Docker's internal network, so Ollama's port isn't published at all. That's the safest layout.

## Settings and environment variables

Ollama's environment variables work with `-e`, for example `-e OLLAMA_CONTEXT_LENGTH=16384` or `-e OLLAMA_KEEP_ALIVE=30m`. See [increasing context length](/learn/increase-ollama-context-length). Inside the container Ollama already listens on all interfaces, so you don't set `OLLAMA_HOST`; the `-p` option decides who can reach it.

## A port warning

Docker's published ports skip some host firewalls, including ufw on Ubuntu. `-p 11434:11434` can make Ollama reachable by anyone who can reach the machine, and Ollama has no passwords. If only the same machine needs it, publish it locally:

```sh
docker run -d --gpus=all -v ollama:/root/.ollama -p 127.0.0.1:11434:11434 --name ollama ollama/ollama
```

Read [securing your local AI server](/learn/secure-your-local-ai-server) before exposing it any further.

## Updating

```sh
docker pull ollama/ollama
```

Then remove the container with `docker rm -f ollama` and run the Step 2 command again. Your models stay in the volume.

## Speed is the same

Containers add no real overhead on the GPU. Expect the same as a normal install. For a 12 GB RTX 3060, the card in our "Starter" build on the [builds page](/builds), our calculator estimates:

{{lineup rtx-3060 12}}
