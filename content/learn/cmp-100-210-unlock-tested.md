---
kind: post
title: "We unlocked two CMP 100-210 mining cards: prompts ran 6x faster"
description: Same two cards, same machine, before and after the cmp100-unlock tool on Qwen3.8-27B. Prompt processing went from about 140 to 850 tok/s, generation rose 10%, and nothing was flashed.
date: 2026-10-27
---
**Unlocking two NVIDIA CMP 100-210 mining cards made them read prompts about 6 times faster.** On Qwen3.8-27B split across the pair, prompt processing at 2,048 tokens went from 140 to 850 tok/s. Generation went from 28.6 to 31.4 tok/s, about 10% faster. We used cmp100-unlock, a community tool that doesn't flash the card or touch any fuses, and a reboot undoes it.

The CMP 100-210 is a mining card built on the same GV100 chip as the [Tesla V100](/gpu/tesla-v100), with 16 GB of HBM2. NVIDIA locked it down for mining: its tensor cores are throttled and its PCIe link is stuck at Gen1 x1. We wanted to know how much of that the unlock gives back.

## The results

Two cards, Qwen3.8-27B at UD-Q4_K_M (16.5 GB) split across them by layer, flash attention on, 250 W power limit. We measured the same pair stock, unlocked it, and measured again. Tokens per second:

| Test | Stock | Unlocked | Change |
|---|---|---|---|
| Prompt, 512 tokens | 106.21 | 674.11 | **+535%** |
| Prompt, 2,048 tokens | 140.24 | 849.77 | **+506%** |
| Prompt, 8,192 tokens | 149.05 | 867.82 | **+482%** |
| Generation, 128 tokens | 28.59 | 31.38 | **+9.8%** |

A second pair of cards in the same server stayed stock the whole time and ran at the same moment. It didn't move (106.28, 140.06, 148.83 and 28.62 tok/s), so the gain comes from the unlock, not from anything else changing in the machine.

## Why prompts got 6x faster and generation didn't

Reading a prompt is matrix math, which is exactly what tensor cores do and exactly what the lock throttles. Generating text is limited by how fast the card can read its memory, and the unlock doesn't change the HBM2. More on the difference in [prompt processing vs generation speed](/learn/prompt-processing-vs-generation-speed) and [why memory bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed).

So if you mostly chat, the unlock is a modest gain. If you paste in long documents, run [RAG](/learn/local-rag-that-actually-works) or feed an agent big contexts, it's the difference between waiting and not.

The low-level probes show the same thing:

| Probe | Stock | Unlocked |
|---|---|---|
| Tensor (HMMA) latency | 512 cycles | 36.8 cycles |
| FP16 tensor throughput | 5.0 to 5.3 TFLOP/s | 73.9 TFLOP/s |
| PCIe, host to card | 0.203 GB/s | 0.409 GB/s |
| PCIe, card to host | 0.213 GB/s | 0.427 GB/s |
| Link speed | 2.5 GT/s (Gen1) | 5.0 GT/s (Gen2) |

## What the unlock does

[cmp100-unlock](https://github.com/mintoriakamoto/cmp100-unlock) (we used commit `8abaad2f`) builds on Brazzo978's CmpUnlocker and duggasco's PCIe Gen3 research. It's unofficial and community-built.

- **Nothing is flashed.** It doesn't rewrite the VBIOS or blow any fuse.
- **It uses the card's own loader.** A small kernel hook hands the card's signed firmware loader (ACR) a modified payload, built from your stock firmware and hash-checked. That flips the tensor gate register from `0x999` to `0x888` and raises the PCIe link speed.
- **It doesn't survive a reset.** A reboot or GPU reset puts the card back to stock. A boot service re-applies it.
- **You choose which cards.** We unlocked two of our ten.

After the unlock, both cards read `0x00000888` on the tensor register and linked at 5 GT/s.

**We got Gen2, not Gen3.** One of our cards reports its Gen3-disable fuse as blown, so the tool refused its Gen3 path. Both cards took its signed-write Gen2 fallback instead. That still doubled PCIe bandwidth. See [does PCIe bandwidth matter for LLMs](/learn/does-pcie-bandwidth-matter-for-llms) for when that helps.

## Power and clocks

| | Avg power | Peak power | SM clock |
|---|---|---|---|
| Stock | 68 to 78 W | 89 to 154 W | 1,267 to 1,380 MHz |
| Unlocked | 87 to 89 W | 250 to 257 W | 1,267 to 1,380 MHz |

Stock, the cards never got near their power limit while reading prompts, because the locked tensor cores were the bottleneck. Unlocked, they hit the 250 W cap in bursts, while average power stayed under 90 W. The clocks didn't change. Peak temperature on stock was 60 °C. More on watts and running costs in [power and heat of local AI](/learn/power-and-heat-of-local-ai).

## The stock cards in more detail

Before unlocking, we ran a full stock suite on the control pair, three repeats each, at a 130 W cap and at the stock 250 W. Tokens per second:

| Test | 130 W cap | 250 W stock |
|---|---|---|
| Q4_K_M pair, prompt 512 / 2,048 / 8,192 | 106.6 / 140.3 / 149.2 | 106.6 / 140.3 / 149.1 |
| Q4_K_M pair, generation | 27.5 | 28.6 |
| IQ3_XXS single card, prompt 512 / 2,048 / 8,192 | 104.7 / 104.1 / 101.2 | 105.0 / 104.1 / 101.2 |
| IQ3_XXS single card, generation | 22.9 | 26.1 |

Capping a stock card at 130 W costs almost nothing on prompts and a little on generation. The single-card test used the smaller UD-IQ3_XXS file (10.9 GB) so the model fits in one card's 16 GB.

Loading is slow at Gen1. The pair took 98.8 seconds to load the Q4_K_M model cold, and 77.6 seconds from the page cache. One card took 65.4 seconds cold and 51.4 seconds cached for IQ3_XXS.

## The setup

| Part | What we used |
|---|---|
| Server | Dell DSS 8440 with 10 CMP 100-210s |
| Cards tested | Two pairs on the same CPU socket, each pair behind its own PCIe switch |
| VBIOS | 88.00.9D.00.00, the stock CMP VBIOS, not reflashed |
| PCI ID | `10de:1d84` |
| OS | Proxmox VE 9.2.2 (Debian 13), kernel 7.0.2 |
| Driver | NVIDIA 580.196.07, proprietary (the open module doesn't support Volta) |
| CUDA | 12.9.1 (CUDA 13 dropped Volta's sm_70) |
| Engine | llama.cpp `19cce691`, built with CUDA for sm_70 |
| Model | `unsloth/Qwen3.8-27B-GGUF` revision `4ca72078`, SHA-256 checked |
| Bandwidth test | NVIDIA nvbandwidth `82fc4e8c` |

The benchmark was `llama-bench` with `-p 512,2048,8192 -n 128`. That's not the same test as our [benchmark prompt](/learn/how-we-benchmark), so compare these numbers with each other, not with results from that.

## Before you try it

- **One pass each.** The stock and unlocked numbers come from one run each. The three-repeat stock suite agrees with them within 0.5%.
- **Not everything is tested yet.** We haven't run the unlocked cards at a 130 W cap, on a single card, or for load time.
- **We applied it live.** The boot service is installed but we haven't tested it through a reboot yet.
- **There were warnings.** nouveau logged PRIVRING MMIO faults during the handoff. No GPU errors (Xid) followed.
- **Your card may differ.** The tool was mostly tested on cards reflashed with a Tesla V100 VBIOS. Ours ran the stock CMP VBIOS.
- **Set Gen2 in the config file.** The tool's `--gen2` flag is ignored when `/etc/cmp100-unlock.conf` sets `CMP100_PCIE`. Put `CMP100_PCIE=2` in the config instead.

## How to undo it

Run `./uninstall.sh` in the tool's folder, then reboot. The cards come back stock.

Next, we ran a 74B model on these two cards: [Nemotron 3.5 Bolt at 52 tok/s](/learn/nemotron-3-5-bolt-74b-on-two-mining-cards).

New to these cards? Start with [mining cards for AI](/learn/mining-cards-for-ai). Tried the unlock on your own CMP? [Send us your numbers](/learn/posts#share).
