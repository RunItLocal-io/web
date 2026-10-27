---
title: "Serve a team on used GPUs: what our 90-card rack taught us"
description: How to serve a local model to a team on cheap used GPUs. Our rack ran a billion tokens in 2.9 days on P100s, A4500s and mining cards. Builds and setup.
track: serve
order: 11
date: 2026-10-26
models: qwen3-30b-a3b, qwen3-14b, gpt-oss-20b
---
**You don't need new hardware to serve a model to a team.** Our rack is 90 used GPUs: Tesla P100s from 2016, RTX A4500s and ex-mining NVIDIA CMP cards. Together they ran **a billion tokens of Qwen3.6-35B-A3B in 2.9 days**. That's about 4,000 tokens a second, around the clock, and the power came to about **6 to 8 cents per million tokens**, so roughly $60 to $80 of electricity for the whole billion.

The lesson is that many cheap cards, each pair running its own copy of a fast model, beat one expensive card for serving lots of requests.

## What we measured

| Pair of cards | Qwen3.6-35B-A3B speed | Notes |
|---|---|---|
| 2× Tesla P100 (32 GB) | 53 tok/s | Never throttled through the whole run |
| 2× RTX A4500 (40 GB) | 110 tok/s | Won every speed test, sitting on its power cap |

Two things stood out. The 2016 P100s ran flat out for days and never throttled, as long as air moved through them. And the A4500s were power-limited, not heat-limited: they sat on their power cap and still won every speed test.

## The pattern: many copies, not one big server

A model split across two cards by layers runs at about one card's speed, because the cards take turns. So rather than one giant pool, the pattern we recommend (and the way we measured) is pairs of cards, each running its own server, with requests spread across them. Each pair is a "lane". More lanes means more people served at once, and a dead card takes down one lane, not the service.

This works best with a **mixture-of-experts model**. Qwen3.6-35B-A3B reads only about 3B parameters per token, so it's fast even on old cards, as long as the pair has the memory to hold all of it. Of the models we track, [Qwen3 30B-A3B](/model/qwen3-30b-a3b) and [gpt-oss 20B](/model/gpt-oss-20b) work the same way. See [mixture of experts explained](/learn/mixture-of-experts-explained).

## Builds that do this

All prices are October 2026 used-market ranges, from our [builds page](/builds).

| Build | Price | Memory | Fits |
|---|---|---|---|
| Used workstation + 2× Tesla P100 | $450 to $650 | 32 GB | One lane, 30B-class MoE models |
| Workstation + 2× RTX 3090 | $1,900 to $2,500 | 48 GB | One fast lane, or 70B at 4-bit |
| Dell DSS 8440 + 10× Tesla P100 | $2,500 to $4,000 | 160 GB | Five lanes in one server |

For a small office, one P100 pair is a remarkable deal. For a bigger team, the DSS 8440 holds ten P100s in one box, though it's a loud data-center server that needs a rack, power and cooling planned first.

Our calculator's estimate for a P100 pair:

{{lineup tesla-p100 32}}

## Software for each lane

On Pascal cards, use llama.cpp-based tools; newer engines like vLLM don't support them. The [llama.cpp server](/learn/llama-cpp-server-guide) is the right fit, because it batches several requests at once:

```sh
llama-server -m model.gguf -ngl 99 -c 32768 -np 4 --host 0.0.0.0 --port 8080 --api-key YOUR_LONG_RANDOM_KEY
```

`-np 4` gives four parallel slots, and the 32K context is shared among them, so each slot gets 8K. Run one of these per lane on its own port, with `CUDA_VISIBLE_DEVICES` choosing which two cards each one uses, and put any load-balancing reverse proxy in front.

On Ampere or newer cards with matched pairs, [vLLM](/learn/vllm-for-a-team) is worth trying; its batching handles more simultaneous users per card.

## What it takes to run cheap cards

- **Cooling.** Passive data-center cards need air forced through them: a server chassis or a blower shroud on each card. Without it they overheat in minutes.
- **Power cables.** P100s take an 8-pin EPS plug, not a normal GPU plug. Wrong cables can damage hardware.
- **Power caps.** Our A4500s sat on their caps the whole time. Capping cards a little below their maximum is a common way to cut heat and power with a small speed cost.
- **Monitoring.** Watch `nvidia-smi` for temperatures, power and memory on every card. A lane that slows down usually has a fan or airflow problem.

More detail in [the Tesla P100 for local LLMs](/learn/tesla-p100-for-local-llms) and [mining cards for AI](/learn/mining-cards-for-ai).

## Keep it private

A team server is a target. Don't publish its ports to the internet. Give each person access through [Tailscale or a Cloudflare tunnel](/learn/remote-access-with-tailscale-or-cloudflare), set an API key, and put a chat front end like [Open WebUI](/learn/open-webui-setup) with individual logins in front. The checklist is in [securing your local AI server](/learn/secure-your-local-ai-server).

Want to compare your own rig with ours? Run [our benchmark](/learn/how-we-benchmark) and [send us the result](/learn/posts#share).
