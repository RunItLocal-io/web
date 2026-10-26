---
title: "Power supplies for multi-GPU AI rigs: how many watts you need"
description: How to size a power supply for two or more GPUs, the cables each card needs, wall circuit limits, power capping, and what our builds draw under load.
track: hardware
order: 12
date: 2026-10-26
models: llama-3-3-70b, qwen3-32b
---
**Add up each card's rated power, add about 200 W for the rest of the system, then add 25 to 30% headroom.** Two RTX 3090s come to about 1,200 W by that rule, which is what we list in our two-card build. Then check that the supply has enough of the right cables, and that your wall circuit can carry it.

## Why the headroom

GPUs don't draw a steady load. They spike well above their rating for milliseconds, and cheap or undersized supplies treat those spikes as a fault and shut off. If your machine reboots or switches off under load but runs fine at idle, the power supply is the first suspect. Quality matters as much as the wattage on the label.

## What our builds draw

From our [builds page](/builds):

| Build | Draw under load | Power supply |
|---|---|---|
| RTX 3060 12 GB starter | About 200 W | 450 W+ |
| 2× Tesla P100 workstation | About 400 W | The workstation's own |
| 1× RTX 3090 | About 400 W | 850 W, good quality |
| 2× RTX 3090 | About 750 W | 1,200 W |
| Dell DSS 8440 + 10× P100 | About 2 kW | Server supplies; plan a dedicated circuit |

The gap between "draw under load" and the supply size is the headroom for spikes, plus room to grow.

## Count the cables, not just the watts

Each card needs the right number of the right plugs:

- **PCIe 8-pin** is what most gaming cards use. Each one is rated for 150 W, and the slot itself supplies up to 75 W. A 350 W card typically takes two or three.
- **12V-2x6 (16-pin)** is used on the RTX 4090 and 5090. Use the cable that came with the supply, push it in fully, and don't bend it sharply near the plug.
- **EPS 8-pin**, the CPU-style plug, is what data-center cards like the Tesla P100 and P40 take. Use a proper adapter. Plugging a PCIe cable into an EPS socket, or the other way round, can damage the card or the supply.

**Don't daisy-chain one cable to a high-power card.** Many supplies ship cables with two 8-pin plugs on one lead. For a 350 W card, run separate leads where you can.

## Mind the wall

In North America, a standard 15 A, 120 V circuit carries 1,800 W, and for a load that runs for hours you should stay under about 80% of that, roughly **1,440 W**. Two 3090s fit. Three or four cards on one ordinary circuit, sharing it with other appliances, may not. Check what else is on the circuit, and for big rigs plan a dedicated one. Elsewhere, check your local voltage and breaker ratings.

## Two supplies in one machine

When one supply isn't enough, rigs often use two: a main supply for the motherboard and some cards, and a second for the rest. A small adapter board starts the second supply when the first turns on. If you do this:

- Power each card's plugs from one supply where you can.
- Plug both supplies into the same circuit.
- Use quality supplies. Two cheap ones are worse than one good one.

Some builders use ex-server supplies with breakout boards, which are cheap for their wattage but loud. They're common in mining rigs. Only go this route if you're comfortable with the wiring.

## Cap the power

Text generation is limited by memory bandwidth, not compute, so you can lower each card's power limit and lose very little speed. That cuts heat, noise, spikes and your bill. On Linux:

```sh
sudo nvidia-smi -pl 280
```

That caps every card at 280 W. Add `-i 0` to target one card. On our rack, the RTX A4500s won every speed test while sitting on their power cap, and power for the whole run came to about **6 to 8 cents per million tokens**. More in [power and heat of local AI](/learn/power-and-heat-of-local-ai).

## A checklist

1. Add up rated power, plus about 200 W, plus 25 to 30%.
2. Count PCIe, 12V-2x6 and EPS plugs, and buy proper adapters.
3. Check the wall circuit.
4. Cap power once it's running.

Next: what to run on two cards in [multi-GPU explained](/learn/multi-gpu-explained), the trade-offs in [RTX 4090 vs two 3090s](/learn/rtx-4090-vs-two-3090s), and what a pair runs on the [RTX 3090 page](/gpu/rtx-3090).

{{lineup rtx-3090 48}}
