---
title: "Power and heat of local AI: watts and electricity cost per million tokens"
description: How much power a local AI rig draws, how to work out your cost per million tokens, what our 90-GPU rack paid, and how to cut watts without losing speed.
track: basics
order: 16
date: 2026-10-26
models: qwen3-30b-a3b
---
**Running a model at home costs a few cents to a few tens of cents per million tokens in electricity, depending mostly on one thing: how many requests you run at once.** On our rack of 90 used GPUs, generating a billion tokens came to about **6 to 8 cents per million tokens** in power. A single person chatting pays more per token, because the GPU is mostly waiting for you.

## What rigs draw

From our [builds](/builds), under load:

| Build | Power under load |
|---|---|
| Used desktop + RTX 3060 12 GB | about 200 W |
| Used workstation + 2× Tesla P100 | about 400 W |
| Used desktop + RTX 3090 24 GB | about 400 W |
| Used Mac Studio, 64 GB | about 100 W |
| Workstation + 2× RTX 3090 | about 750 W |
| Dell DSS 8440 + 10× Tesla P100 | about 2 kW |

That's while generating. When nothing is running, the GPUs drop to their idle power, which is a small fraction of this. The model sitting loaded in memory doesn't draw much on its own.

## Work out your cost per million tokens

> **kWh per million tokens = watts ÷ tok/s × 1,000,000 ÷ 3,600,000**

Then multiply by your electricity price per kWh.

An example: suppose a two-P100 machine draws about 400 W while running Qwen3.6-35B-A3B at the 53 tok/s we measured for one stream. That's about 7.5 joules per token, or about **2.1 kWh per million tokens**. At an example rate of 15 cents per kWh, around 31 cents per million tokens.

So why did the rack come in at 6 to 8 cents? Because it wasn't serving one person. It ran a billion tokens in 2.9 days by serving many requests at the same time. Generation is limited by memory reads, and when several requests share each read, the card produces far more tokens for only a little more power. One chat stream leaves most of that on the table.

| How you use it | Cost per token |
|---|---|
| One person chatting | Highest: the GPU idles between messages and runs one stream |
| Batch jobs, several at once | Much lower |
| Serving a team around the clock | Lowest: what our rack did |

If you run batch jobs, run them in parallel. See [batch jobs with a local model](/learn/batch-jobs-with-a-local-model).

## Measure your own

On NVIDIA, watch power draw once a second while a model is generating:

```sh
nvidia-smi --query-gpu=power.draw,temperature.gpu --format=csv -l 1
```

That's the GPU only. A plug-in power meter at the wall gives you the whole machine, including CPU, fans and power supply losses, which is the number your electricity bill sees.

Our [leaderboard](/leaderboard) records average GPU power during the test and reports **joules per token** for every rig, so you can compare efficiency, not just speed. See [what the leaderboard measures](/learn/what-the-leaderboard-measures).

## Cut power without losing much speed

Because generation waits on memory, not compute, a GPU running a language model often doesn't need its full power budget. You can cap it:

```sh
sudo nvidia-smi -pl 250
```

That sets a 250 W limit (pick a number within your card's allowed range; it resets on reboot). On our rack, the RTX A4500s won every speed test **while sitting on their power cap**. For text generation, power limits cost far less speed than they do in games. Prompt processing and image generation are compute-heavy and feel a cap more.

## Heat

Every watt your rig draws ends up as heat in the room. A 400 W machine running all day is like a small space heater on low; a 750 W two-3090 build is noticeably warm in a closed room; a 2 kW server needs its own cooling plan.

- **Consumer cards** handle their own cooling, but need case airflow. In a cramped case, long runs can push them into thermal throttling.
- **Data-center cards** like the Tesla P100 have no fans at all and need forced air. Done right, they're tough: our 2016 P100s **never throttled** across the billion-token run. See [cooling passive data-center cards](/learn/cooling-passive-data-center-cards).
- **Macs** are the quiet, cool option, at about 100 W for the 64 GB Mac Studio build. See [Macs for local LLMs](/learn/mac-for-local-llms).

## Power supplies and circuits

Leave headroom. Our two-3090 build uses a 1,200 W supply and wants a dedicated circuit; GPUs can spike above their rated power for brief moments. More in [power supplies for multi-GPU](/learn/power-supplies-for-multi-gpu).

## The cheapest tokens are fast tokens

Watts divided by tok/s means a faster setup on the same power is cheaper per token. A mixture-of-experts model like [Qwen3 30B-A3B](/model/qwen3-30b-a3b) reads only about 3B parameters per token, so it writes many more tokens per joule than a dense model of the same size. Here's a 24 GB card from our calculator:

{{lineup rtx-3090}}
