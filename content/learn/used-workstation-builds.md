---
title: "Used workstations for local AI: Dell T7810, HP Z840 and similar"
description: Why old Xeon workstations like the Dell T7810 and HP Z840 make cheap multi-GPU AI boxes, what to check before buying, and how to fit GPUs in them.
track: hardware
order: 10
date: 2026-10-26
models: qwen3-30b-a3b, qwen3-32b, llama-3-3-70b
---
**A used Xeon workstation is the cheapest good base for a multi-GPU AI machine.** Machines like the Dell Precision T7810 and HP Z840 were built for engineering and video work around 2014 to 2016. Today they sell for a few hundred dollars with lots of RAM, and they have what a GPU box needs: several full-length PCIe slots, big power supplies and room for heat.

## Why they suit local AI

- **Lots of PCIe slots.** Several full-size slots, so two GPUs fit without risers in many configurations.
- **Big power supplies.** The higher-end options were specified for workstation graphics cards. Check the label on the one you're buying.
- **Cheap RAM.** They use DDR4 ECC server memory, which is plentiful used. 64 GB is common and helps when a model spills over. See [how much system RAM you need](/learn/system-ram-for-local-ai).
- **Built to run all day.** Good airflow, solid boards, and usually quiet at idle.
- **The CPU barely matters.** The GPU does the work. Old Xeons are slow per core, but that's fine for running models on the graphics card.

## The two builds we list

Both of these are on our [builds page](/builds), with October 2026 used prices.

**Best value: workstation + 2× Tesla P100, $450 to $650 total.** 32 GB of fast GPU memory for 30B-class models. On our rack, two P100s run Qwen3.6-35B-A3B at **53 tok/s, measured**.

| Part | Price |
|---|---|
| 2× Tesla P100 16 GB (we paid about $85 each) | $170 to $240 |
| Dell T7810 or HP Z840 workstation, 64 GB RAM | $200 to $300 |
| 2× blower fan shrouds for passive cards | $30 to $50 |
| Power adapter cables (EPS to GPU) | $15 to $25 |

{{lineup tesla-p100 32}}

**Serious: workstation + 2× RTX 3090, $1,900 to $2,500 total.** 48 GB runs Llama 3.3 70B at 4-bit, about 12 tok/s estimated. This needs a board with two x16 slots and enough physical space between them ($350 to $500 with 64 GB RAM), plus a 1,200 W supply, since most workstation supplies weren't designed for two 350 W gaming cards.

## Similar machines

The same idea works with other workstations from that era and a little later: Dell's T7910 and later T7820 and T7920, HP's Z640 (smaller, fewer slots), and Lenovo's ThinkStation P-series towers. The newer models cost more but bring newer CPUs and memory. Check slot count, spacing and power supply rating for the exact configuration.

## What to check before you buy

1. **Power supply rating.** These machines came with several supply options. Look up the one fitted to the unit you're buying.
2. **GPU power leads.** Workstation supplies often have only a few PCIe power cables, and some use proprietary connectors. Count them and plan adapters. Data-center cards like the P100 and P40 take an 8-pin **EPS** plug, not a PCIe one, so buy the correct adapter. A wrong cable can damage the card or supply.
3. **Slot layout.** Check which slots are wired for x16 and whether two thick cards physically fit. Long consumer cards can hit drive cages or RAM shrouds.
4. **Second CPU.** On dual-socket machines, some PCIe slots only work when the second CPU is installed. Check before you remove one to save power.
5. **BIOS and boot.** Update the BIOS. Some older machines won't boot with certain data-center cards until a setting for large memory mapping (often called "Above 4G decoding") is enabled, if the board offers it.
6. **Noise.** Fine at idle, but cards with blower shrouds add noise under load.

## The limits

- **PCIe 3.0.** Slower than modern boards, but it mainly affects how fast models load, not generation speed. See [does PCIe bandwidth matter](/learn/does-pcie-bandwidth-matter-for-llms).
- **Power draw.** Dual Xeons idle higher than a modern desktop. If it runs 24/7, that adds up. See [power and heat of local AI](/learn/power-and-heat-of-local-ai).
- **No Resizable BAR** on many of these, which rules out Intel Arc cards.

## Setting it up

Install Linux, the NVIDIA driver and Ollama, then check every card is seen:

```sh
nvidia-smi
```

For passive cards, sort cooling before the first long run: see [cooling passive data-center cards](/learn/cooling-passive-data-center-cards). For the full card guide, read [the Tesla P100 for local LLMs](/learn/tesla-p100-for-local-llms).
