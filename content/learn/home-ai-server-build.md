---
title: "Building a quiet, always-on home AI server"
description: How to build a home AI server that's quiet enough to live with and cheap to leave on. Hardware picks, noise and power tips, and sharing it on your network.
track: hardware
order: 19
date: 2026-10-26
models: qwen3-14b, qwen3-30b-a3b, qwen3-32b
---
**For a quiet, always-on AI server, pick either a used Mac Studio or a desktop with one power-capped RTX 3090 in a big case.** The Mac is silent and sips power. The 3090 is faster and cheaper, and with a power cap and good fans it's quiet enough for a home office. Skip passive data-center cards and GPU servers here: they're great value, but loud.

## Two good builds

Both are on our [builds page](/builds), with October 2026 used prices.

| | Used Mac Studio, 64 GB | Desktop + RTX 3090 |
|---|---|---|
| Price | $1,500 to $2,100 | $900 to $1,200 |
| Memory for models | About 48 GB | 24 GB |
| Draw under load | About 100 W | About 400 W |
| Noise | Silent | Quiet to moderate, with a cap |
| Speed | About half a 3090 on the same model | Fast |

**The Mac Studio** (M1 or M2 Max, 64 GB) is the closest thing to an appliance. It fits up to Llama 3.3 70B, slowly, and it's near silent under load. See [Macs for local LLMs](/learn/mac-for-local-llms).

**The RTX 3090 desktop** runs Qwen3 32B at about 26 tok/s and Qwen3 30B-A3B at around 164 tok/s, estimated:

{{lineup rtx-3090}}

Its parts list: an RTX 3090 ($650 to $850), a desktop with 32 GB RAM and an 850 W supply ($200 to $300), and a 1 TB NVMe SSD ($50 to $70). More in the [used RTX 3090 buying guide](/learn/used-rtx-3090-buying-guide).

On a smaller budget, our $300 to $400 starter build with an [RTX 3060 12 GB](/learn/rtx-3060-12gb-for-ai) is also quiet, at about 200 W under load, and runs [Qwen3 14B](/model/qwen3-14b) well.

## Making a GPU box quiet

**Cap the power first.** Text generation is limited by memory bandwidth, so a lower limit costs little speed and cuts heat and fan noise a lot. On Linux:

```sh
sudo nvidia-smi -pl 250
```

Then:

1. **Use a big case with large, slow fans.** More airflow at lower fan speeds beats small fans spinning fast.
2. **Pick a card with a good cooler.** Triple-fan cards are usually quieter than blower cards.
3. **Put it somewhere sensible.** A closet with ventilation, or under a desk away from your ears. Don't seal it in a cabinet without airflow.
4. **Mind idle draw.** It's on 24/7, so idle power matters as much as load power. Measure it with a plug-in power meter, and see [power and heat of local AI](/learn/power-and-heat-of-local-ai).

## The software side

Install Linux and Ollama. On Linux, Ollama's installer sets it up as a service that starts on boot, so it's always there.

To reach it from other devices on your network, Ollama needs to listen on all interfaces rather than only the machine itself, using the `OLLAMA_HOST` setting. See [Ollama on your network](/learn/ollama-on-your-network). Then add a chat interface everyone in the house can use: [Open WebUI](/learn/open-webui-setup) gives you a ChatGPT-style page with accounts.

Two settings worth knowing:

- **Keep models loaded.** Ollama unloads a model after a few idle minutes. The `OLLAMA_KEEP_ALIVE` setting keeps it in memory longer, so the first reply after a break is fast.
- **Persistence mode on NVIDIA.** Keeps the driver loaded so the card responds quickly:

```sh
sudo nvidia-smi -pm 1
```

## Keep it private

Don't open Ollama's port to the internet. It has no login. For access away from home, use a private network tool or a tunnel with authentication. See [securing your local AI server](/learn/secure-your-local-ai-server) and [remote access with Tailscale or Cloudflare](/learn/remote-access-with-tailscale-or-cloudflare).

## What about the loud options?

Two Tesla P100s in a used workstation are our "Best value" build, at $450 to $650, and on our rack they run Qwen3.6-35B-A3B at 53 tok/s, measured. But passive cards need blower shrouds, which are audible under load. They're a good fit for a garage, basement or rack, not a bedroom. See [used workstation builds](/learn/used-workstation-builds).
