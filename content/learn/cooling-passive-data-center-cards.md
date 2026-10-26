---
title: "How to cool a passive Tesla card: shrouds, fans and airflow"
description: Data-center GPUs like the Tesla P100 and P40 have no fans. How to cool them in a normal PC with a blower shroud, how to check temperatures, and what we run.
track: hardware
order: 11
date: 2026-10-26
models: qwen3-30b-a3b
---
**A passive data-center card needs air forced straight through its heatsink, or it overheats within minutes.** Cards like the Tesla P100 and P40 have no fans of their own. In a server, rows of loud fans push air through them. In a normal PC, you add a blower shroud to the end of each card. It costs about **$15 to $25 per card** and it's not optional.

## Why case fans aren't enough

A passive Tesla card has a long, dense fin stack inside a closed metal cover. Air only flows through it if something pushes it in one end and out the other. Case fans move air around the card, not through it, so the card heats up fast, slows itself down, and eventually shuts off.

## Your options

| Option | Cost | Noise | Good for |
|---|---|---|---|
| Blower shroud on each card | $15 to $25 per card | Moderate | Workstations and desktops |
| Server chassis built for GPUs | Varies | Loud | Racks, garages, many cards |
| Strong fan aimed at the card end | A few dollars | Varies | Testing only |

**Blower shrouds** are the standard for a desk or homelab box. They're 3D-printed or bought ducts that fit over the end of the card opposite the bracket, with a small blower or high-pressure fan that pushes air lengthwise through the fins. Two shrouds are in our "Best value" build on the [builds page](/builds), at $30 to $50 for the pair.

**A GPU server** solves cooling properly. Our "rack in a box" build, a Dell DSS 8440 with ten P100s, is designed to cool all ten. It draws about 2 kW under load and is a loud data-center machine: plan for a rack, power and cooling before you buy one.

## Choosing and fitting a shroud

- **Match the card.** Shrouds are made for specific cards and fan sizes. Check it's for your model.
- **Pressure beats airflow.** The fin stack resists air. Blower fans and high-static-pressure fans work; thin, quiet case fans often don't.
- **Seal the gap.** Air takes the easy way out. The shroud should fit snugly against the card's opening.
- **Power and control the fan.** Most plug into a motherboard fan header or a SATA adapter. A header lets you control speed, but some fans draw more than one header should supply. Check the fan's rating.
- **Leave room.** A shroud adds length. Measure your case, especially in front of drive cages.

## Check it's working

Watch temperature, power and clock speed during a long run. This prints them every 5 seconds:

```sh
nvidia-smi --query-gpu=index,temperature.gpu,power.draw,clocks.sm --format=csv -l 5
```

Start a model generating non-stop for 15 minutes and watch. The temperature should level off, not keep climbing. If clocks drop while temperature rises, the card is throttling.

To see the card's own slowdown and shutdown temperatures, and whether it's throttling right now:

```sh
nvidia-smi -q -d TEMPERATURE,PERFORMANCE
```

## What we've seen on our rack

Our rack is 90 used GPUs: Tesla P100s, RTX A4500s and ex-mining NVIDIA CMP cards. Together they ran a billion tokens of Qwen3.6-35B-A3B in 2.9 days. Through that run, **the 2016 P100s never throttled.** The lesson: old passive cards can handle heavy, continuous work, as long as air goes through them.

The RTX A4500s, which have their own blower fans, won every speed test while sitting on their power cap.

## Tips that apply to any passive card

1. **Test cooling before trusting the machine.** Run a long load the first day and watch temperatures.
2. **Keep fans clean.** Dust on a shroud intake cuts airflow quickly.
3. **Cap power if it runs hot.** Text generation is limited by memory bandwidth, so a lower power limit costs little speed. See [power supplies for multi-GPU](/learn/power-supplies-for-multi-gpu).
4. **Give cards space.** Cards packed tight starve each other of air. Leave a slot between them if you can.
5. **Plan for noise.** Shrouded cards are audible under load. If that matters, see [building a quiet home AI server](/learn/home-ai-server-build).

For the cards themselves, see [the Tesla P100 guide](/learn/tesla-p100-for-local-llms) and [the Tesla P40 guide](/learn/tesla-p40-for-local-llms), or the [P100's speeds](/gpu/tesla-p100).
