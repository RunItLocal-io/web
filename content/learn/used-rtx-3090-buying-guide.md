---
title: "Buying a used RTX 3090 for AI: what to check and what to pay"
description: Why the RTX 3090 is still the default card for local AI, what a fair used price is, how to spot a bad one, and what to pair it with.
track: hardware
order: 1
date: 2026-10-26
models: qwen3-32b, qwen3-30b-a3b, llama-3-3-70b
---
The RTX 3090 came out in 2020 and it's still the card most people buy for local AI. The reason is simple: **24 GB of fast memory for the price of a mid-range new card.** Memory decides which models you can run (see [how much VRAM you need](/learn/how-much-vram-do-you-need)), and nothing else this cheap has 24 GB at 936 GB/s.

## What it runs

{{lineup rtx-3090}}

The highlights: Qwen3 32B at about 26 tok/s and Qwen3 30B-A3B at around 160 tok/s. Two of them run Llama 3.3 70B.

## What to pay

As of October 2026, a used 3090 goes for roughly **$650 to $850**. The low end is usually ex-mining or a blower model; the high end is a clean card from a gaming PC, sometimes with a box.

The 3090 Ti is a little faster and runs cooler memory, but it usually costs more for little gain on this job. A 4090 costs far more and generates text only about 8% faster; it's much faster at prompt processing and image generation.

## What to check before you buy

1. **Run a real load.** Ask the seller to show it under a stress test, or test it yourself: 15 minutes of a GPU benchmark, or a model generating non-stop. Watch for crashes, artifacts, or the fans going wild.
2. **Memory temperature.** The 3090 has memory chips on the back of the board, and they run hot. Tools like HWiNFO (Windows) show "memory junction temperature". Under load it should stay below about 100°C. Above 105°C, plan to replace the thermal pads.
3. **Fans.** Spin each one up. Grinding or clicking means a fan replacement soon (cheap, but annoying).
4. **Ex-mining isn't automatically bad.** Mining ran cards at steady, lowered power, which is gentle on the chip. The risks are dried-out thermal pads and worn fans, both fixable. Price it accordingly.
5. **The power connectors.** Look for scorching or melted plastic around the 8-pin plugs.

## What to pair it with

- **Power supply: 850 W of good quality.** The 3090 can spike well above its 350 W rating for milliseconds, and cheap supplies shut down. For two cards, 1,200 W or more.
- **Case clearance.** Most 3090s are over 30 cm long and take three slots. Measure.
- **System RAM: 32 GB or more**, so loading models is quick and you have headroom if one spills over.
- **Any CPU from the last several years.** The GPU does the work.

Our full parts list with prices is the "Popular" build on the [builds page](/builds).

## Want to save power?

You can cap the card's power with almost no loss in text generation speed, since it's limited by memory, not compute. On Linux:

```sh
sudo nvidia-smi -pl 280
```

That caps it at 280 W. On Windows, MSI Afterburner's power limit slider does the same.

## Alternatives

- **Less money:** a [Tesla P100](/learn/tesla-p100-for-local-llms) gives you 16 GB of very fast memory for under $100, with some homework.
- **Quieter:** a [Mac with lots of memory](/learn/mac-for-local-llms) is silent and fits bigger models, but runs them slower.
- **More memory:** two 3090s give 48 GB for 70B models.
