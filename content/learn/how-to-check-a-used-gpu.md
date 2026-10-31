---
title: "How to check a used GPU before you buy: stress, VRAM and speed tests"
description: A step-by-step check for a used graphics card for AI. What to inspect, how to stress test it, test its memory, read temperatures and confirm its real speed.
track: hardware
order: 18
date: 2026-10-26
models: qwen3-8b
---
**Look it over, confirm it's the card it claims to be, run it hard for 15 minutes or more, test its memory, and check that it generates text at about the speed it should.** Most bad cards show themselves in that time. Do as much as you can before money changes hands, or buy where you can return it.

## 1. Look before you power it

- **Power connectors:** scorch marks or melted plastic around the plugs mean walk away.
- **Board and bracket:** bent pins on the slot connector, missing screws, or a warped bracket hint at rough handling or a repair.
- **Fans:** spin each by hand. They should turn freely and quietly.
- **Smell:** a burnt smell is a no.
- **Data-center cards** like the Tesla P100 have no fans and take a CPU-style EPS power plug. Bring the right cable and a way to cool them, or a short test will overheat them. See [cooling passive data-center cards](/learn/cooling-passive-data-center-cards).

## 2. Confirm what it is

Fake and relabelled cards exist. On Windows, GPU-Z shows the chip, memory size and memory type the card reports. On Linux or Windows with the NVIDIA driver:

```sh
nvidia-smi
```

Check the name and memory match the listing. A 12 GB RTX 3060 should show about 12 GB, not 8. While you're there, check the card is connected at full width:

```sh
nvidia-smi --query-gpu=name,memory.total,pcie.link.gen.current,pcie.link.width.current --format=csv
```

The link speed can drop at idle to save power, so check it again under load.

## 3. Stress test it

Run a heavy GPU load for at least 15 minutes. Common choices are FurMark or OCCT on Windows, and gpu-burn on Linux. Watch for:

- **Crashes, driver resets or black screens.**
- **Artifacts:** flickering, colored dots or lines.
- **Temperatures that keep climbing** instead of levelling off.
- **Clock speeds dropping** as it heats up, a sign of throttling.

For NVIDIA cards, this shows temperature, power and clock every 5 seconds while you test:

```sh
nvidia-smi --query-gpu=temperature.gpu,power.draw,clocks.sm --format=csv -l 5
```

On cards with memory chips on the back, like the RTX 3090, also check **memory junction temperature** in HWiNFO. Under about 100°C is fine; above 105°C means the thermal pads need replacing. See the [used RTX 3090 buying guide](/learn/used-rtx-3090-buying-guide).

## 4. Test the memory

Local AI fills a card's memory, so a fault in a corner of VRAM that games never touch will show up for you. Run a dedicated VRAM test. OCCT has one, and memtest_vulkan is a free option that works across brands. Any reported error is a reason to walk away.

Data-center cards like the P100 have error-correcting memory. Check its error counts:

```sh
nvidia-smi -q -d ECC
```

A few corrected errors can be normal. Uncorrected errors are not.

## 5. Run a real model

The final test is the job you bought it for. Install Ollama and run a model with timing on:

```sh
ollama run qwen3:8b --verbose
```

Ask for a long answer, then read the "eval rate" line, which is the generation speed in tokens per second. Compare it to our calculator's estimate on the card's page. For example, here's an RTX 3060 12 GB:

{{lineup rtx-3060 12}}

A healthy card should land in the same range. Much slower usually means it's running on the CPU, throttling, or on a limited PCIe link. See [fix Ollama using the CPU instead of the GPU](/learn/fix-ollama-using-cpu-instead-of-gpu).

Keep it generating for 15 minutes. Long, steady AI loads catch problems a short benchmark misses.

## Ex-mining cards

Mining ran cards at steady, lowered power, which is gentle on the chip. The usual wear is in fans and thermal pads, both fixable. Test them the same way and price them accordingly. See [mining cards for AI](/learn/mining-cards-for-ai).

## A quick checklist

1. No damage around power plugs or the slot connector.
2. Name and memory size match the listing.
3. 15+ minutes of stress with no crashes, artifacts or runaway temperatures.
4. A clean VRAM test.
5. Model speed close to [our estimate](/gpu) for that card.

Once it passes, [send us your measured speed](/articles#share).
