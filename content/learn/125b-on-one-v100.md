---
kind: post
title: "125B on one V100: 49.5 tok/s with colibri"
description: Colibri runs Qwen3.8-Flash-Next, a 125B mixture-of-experts model, at 49.5 tok/s on one used 32 GB V100, 2 to 2.7× llama.cpp on the same card. The catch is slow prompts.
date: 2026-11-12
card: /learn/img/v100-sxm2-125b.png
---
**Colibri ran Qwen3.8-Flash-Next, a 125B mixture-of-experts model, at 49.5 tokens per second on one used 32 GB [Tesla V100](/gpu/tesla-v100).** llama.cpp, with the same file on the same card, managed 18 to 23. Across two V100s, llama.cpp reached about 29.

The catch is reading. On a V100, colibri reads prompts 5 to 6 times slower than llama.cpp, so an 8,000-token prompt waits about 140 seconds for its first word. And it serves one conversation per card. This is a big model for one person's chat, not a server for a team. Below are the numbers, what you need, the full setup with the two gotchas that stop most people, and where it does and doesn't make sense.

```chart
{"type": "stats", "items": [
  {"value": "125B", "label": "Qwen3.8-Flash-Next on one 32 GB V100", "hi": true},
  {"value": "49.5 tok/s", "label": "writing, one conversation (llama.cpp: 18 to 23)"},
  {"value": "≈140 s", "label": "to read an 8,000-token prompt (llama.cpp: about 27 s)"},
  {"value": "66.7%", "label": "MMLU-Pro, 84-question sample, about ±10 points"}
]}
```

## What colibri does

A mixture-of-experts model uses only a few of its experts for each token (see [mixture of experts explained](/learn/mixture-of-experts-explained)). Flash-Next has 512 experts in each of its 48 layers, 24,576 in all, and the 2.3-bit file we used is 75.8 GB. That's more than twice what a 32 GB card holds.

[Colibri](https://github.com/JustVugg/colibri) puts what every token needs on the card: the 9.7 GB trunk and about 5.7 GiB of cache for a 65K-token context. It fills the rest of the card with the experts that get picked most, 7,913 of them, and keeps every other expert in pinned system RAM, which the card reads over PCIe. So while it writes, most of what each token needs is already on the card. llama.cpp's [CPU offloading](/learn/cpu-offloading-explained) splits by layer instead: the experts of whole layers stay in RAM, and the CPU computes them.

![Where the experts live: about a third on the card, the rest in RAM, copied over as each prompt needs them](/learn/img/v100-sxm2-125b.png)

## Results

All measured on November 12, 2026, on one Tesla V100 SXM2 32 GB, with unsloth's UD-IQ2_XS file of Qwen3.8-Flash-Next.

```chart
{"type": "bars", "title": "Writing speed, one conversation", "note": "Tokens per second after a short prompt, higher is faster. The llama.cpp rows keep the experts of some of the 48 layers in RAM; their 29.3 and 22.6 are warm repeats, rounded.", "unit": "tok/s", "digits": 1, "rows": [
  {"label": "colibri", "sub": "1× V100", "value": 49.5, "hi": true},
  {"label": "llama.cpp", "sub": "2× V100, 10 layers' experts in RAM", "value": 29.3},
  {"label": "llama.cpp", "sub": "1× V100, 25 layers' experts in RAM", "value": 22.6},
  {"label": "llama.cpp", "sub": "1× V100, 34 layers' experts in RAM", "value": 18.3}
]}
```

Writing is where colibri wins: 2 to 2.7 times llama.cpp on one card, and 1.7 times llama.cpp across two.

```chart
{"type": "bars", "title": "Reading a 2,000-token prompt", "note": "Tokens per second, higher is faster. Same setups as above.", "unit": "tok/s", "digits": 0, "rows": [
  {"label": "llama.cpp", "sub": "1× V100, 25 layers' experts in RAM", "value": 301},
  {"label": "llama.cpp", "sub": "2× V100, 10 layers' experts in RAM", "value": 273},
  {"label": "llama.cpp", "sub": "1× V100, 34 layers' experts in RAM", "value": 233},
  {"label": "colibri", "sub": "1× V100", "value": 47, "hi": true}
]}
```

Reading is where it loses. Time before the first word, colibri against llama.cpp's fastest one-card setup:

| Prompt | colibri, 1× V100 | llama.cpp, 1× V100 |
|---|---|---|
| 512 tokens | about 17 s | about 3 s |
| 2,000 tokens | about 43 s | about 7 s |
| 8,000 tokens | about 140 s | about 27 s |

So the winner depends on the shape of the conversation. After a 450-token prompt, colibri starts writing about 12 seconds behind llama.cpp, then writes each token in 20 ms instead of 44. It's ahead once the answer runs past about 500 tokens. A short question with a long answer favors colibri; a long document with a short answer favors llama.cpp. More on that split in [prompt processing vs generation speed](/learn/prompt-processing-vs-generation-speed).

## The limits

You'll hit these in the first five minutes, so here they are before the setup.

- **Slow prompts on pre-Ampere cards.** About 47 tok/s at 2,000 tokens. Each prompt copies about 21 GB of experts to the card, about 7 seconds at PCIe Gen3, and then spends about 17 ms of card time per token, where llama.cpp spends 3.3. Colibri's fast prompt kernels need sm_80 (Ampere and newer), so a V100 falls back to slower f16 tiles.
- **Long context slows writing.** 49.5 tok/s after a short prompt drops to 16 to 17 after a 9,600-token one. See [context length and the KV cache](/learn/context-length-and-kv-cache).
- **One conversation per card.** Setting `--kv-slots` above 1 turns off the card-side path that gives 49.5 tok/s.
- **It wants a lot of RAM.** Each colibri process pins about 64 GiB. RAM, not the number of cards, decides how many you can run.
- **It's a 2.3-bit file.** Squeezing 125B into 75.8 GB costs quality. See the accuracy section, and [quantization explained](/learn/quantization-explained).
- **The first answer is slower.** About 38.5 tok/s, then about 49.5 from the second request on.

## Hardware

What we measured on is the minimum we can vouch for: one 32 GB V100 and 96 GB of system RAM.

| Part | What we used | Why it matters |
|---|---|---|
| GPU | Tesla V100 SXM2 32 GB (sm_70) | 32 GB holds the 9.7 GB trunk, 5.7 GiB of cache at 65K context, and 7,913 of the 24,576 experts |
| Card link | PCIe Gen3 x16 | Each prompt copies about 21 GB of experts to the card, about 7 s at Gen3 |
| System RAM | 251 GiB in the server; colibri pinned 63.9 GiB and held 69.3 GB | The pinned pool holds every expert that isn't on the card. Plan on 96 GB; 64 GB is untested |
| CPU | 2× Xeon E5-2698 v4 (AVX2) | Not tested on AVX-only CPUs (Sandy Bridge, Ivy Bridge) |
| CUDA | 12.8 | CUDA 13 no longer compiles for sm_70 |
| Storage | SATA SSD, ZFS | Matters only at load: 46 s to set up the RAM pool, 29 s to read the file |

**If your V100 is an SXM2 module.** Most used 32 GB V100s for sale are SXM2 modules pulled from servers, not PCIe cards. An SXM2 module has no slot connector; it sits on mezzanine connectors on a server board. To use one in a normal PC you need an SXM2-to-PCIe adapter board that carries the module and plugs into an x16 slot. Budget for three things: the adapter, power for a module rated at 300 W, and cooling, because the module's heatsink is passive and built for a server's front-to-back airflow ([cooling passive data-center cards](/learn/cooling-passive-data-center-cards)). Make sure the adapter gives you a full Gen3 x16 link, since every prompt moves about 21 GB over it. We ran in a server, not on an adapter, so we haven't measured one. Before you buy, read [how to check a used GPU](/learn/how-to-check-a-used-gpu).

## Setup

The build takes under three minutes. You need a CUDA 12.x toolkit, gcc, make and Python 3. The prebuilt colibri releases need glibc 2.43, so on Ubuntu 24.04 (glibc 2.39) build from source as below. We ran colibri 2.1.0, commit `0a5504a1`.

### 1. Build colibri for the V100

This is the first gotcha: CUDA 13 dropped compute 7.0, so it won't build for a V100 at all. Use CUDA 12.

```sh
git clone https://github.com/JustVugg/colibri ~/colibri
cd ~/colibri && git checkout 0a5504a1
make -C c qwen38 CUDA=1 CUDA_ARCH=sm_70
```

### 2. Download the three parts and check them

The three parts come to 75.8 GB; `pip install -U huggingface_hub` gives you the `hf` command. You don't need the separate MTP file: colibri turns the draft head off on this path, because it would run on the CPU.

```sh
hf download unsloth/Qwen3.8-Flash-Next-GGUF --include "UD-IQ2_XS/*" --local-dir ~/flash-next
cd ~/flash-next/UD-IQ2_XS && sha256sum -c <<'EOF'
91e8dc8f1428ce25d48fd1f711e4bf1f42215c5bac0f32eeb5608e6ec7ae91e9  Qwen3.8-Flash-Next-UD-IQ2_XS-00001-of-00003.gguf
11a67c82f54a9edf683d6b708062de78d803921a18a6cb2bf1dd55949b4ef9bd  Qwen3.8-Flash-Next-UD-IQ2_XS-00002-of-00003.gguf
05716382c280d999b81afff92b2d527fadbfd926ac225ffdc273f2d1d13331c6  Qwen3.8-Flash-Next-UD-IQ2_XS-00003-of-00003.gguf
EOF
```

### 3. Fix the one Q5_0 tensor

This is the second gotcha, and it fails silently. One tensor in part 2, `blk.4.ffn_down_exps`, is stored as Q5_0, and colibri's card-side expert path can't compute Q5_0. Colibri doesn't refuse to run: it computes every expert on the CPU instead, and you get a fraction of the speed. Rewrite that tensor as Q8_0 with the same scales. Every weight comes out identical, and part 2 grows by 314.6 MB. Put the fixed part in a new folder with a real copy of part 1: colibri follows a symlinked first part and then loads parts 2 and 3 from the original folder, so it would pick up the unfixed part 2.

```sh
mkdir ~/flash-next/q8fix && cd ~/flash-next/q8fix
cp ../UD-IQ2_XS/*-00001-of-00003.gguf .          # a real copy, not a symlink
ln -s ../UD-IQ2_XS/*-00003-of-00003.gguf .
python3 -m venv ~/gguf-env && ~/gguf-env/bin/pip install gguf numpy
curl -O https://runitlocal.io/learn/files/q5to8.py
~/gguf-env/bin/python q5to8.py ../UD-IQ2_XS/Qwen3.8-Flash-Next-UD-IQ2_XS-00002-of-00003.gguf Qwen3.8-Flash-Next-UD-IQ2_XS-00002-of-00003.gguf
```

It should finish with `blk.4.ffn_down_exps.weight now Q8_0, 314.6 MB larger`. The script is shown in full further down.

### 4. Import the fixed copy

Colibri writes a small model folder that points at the parts.

```sh
cd ~/colibri && python3 c/coli import ~/flash-next/q8fix/Qwen3.8-Flash-Next-UD-IQ2_XS-00001-of-00003.gguf --out ~/flash-next/model
```

### 5. Serve it

```sh
cd ~/colibri && COLI_CUDA=1 python3 c/coli serve --model ~/flash-next/model --gpu 0 --ctx 65536
```

### 6. Check the load

The log should say the card holds about 9,700 MB of trunk and has room for about 7,900 experts; the rest stay in pinned RAM. Send one short request to warm it up: the first runs at about 38.5 tok/s, the ones after at about 49.5. `python3 c/coli ui` opens colibri's chat page next to the running server.

## The fix script

[Download q5to8.py](/learn/files/q5to8.py). A Q5_0 weight is a block scale times (q − 16), with q from 0 to 31. A Q8_0 weight is a block scale times a signed byte. Keeping each block's scale and writing q − 16 as that byte gives exactly the same numbers. The script converts every Q5_0 tensor it finds and copies everything else as it is. We checked it on test files against the gguf library's own dequantizers, and checked 120,000 blocks of the fixed part we ran against the same rule, with no mismatches.

```python
#!/usr/bin/env python3
"""Rewrite every Q5_0 tensor in a GGUF file as Q8_0, losslessly, into a new file.

  pip install gguf numpy
  python3 q5to8.py IN.gguf OUT.gguf

A Q5_0 weight is d * (q - 16) with q in 0..31; a Q8_0 weight is d * s with s in -128..127. Keeping each block's
scale d and writing s = q - 16 gives the same numbers. Every other tensor and every metadata key is copied as is.
"""
import sys

import numpy as np
from gguf import GGMLQuantizationType as Q, GGUFReader, GGUFValueType as T, GGUFWriter

src, dst = sys.argv[1:3]
r = GGUFReader(src)


def q5_0_to_q8_0(raw: np.ndarray) -> np.ndarray:
    b = np.asarray(raw).reshape(-1, 22)            # Q5_0 block: f16 d, u32 high bits, 16 bytes of low nibbles
    d, qs = b[:, 0:2], b[:, 6:22]
    qh = b[:, 2:6].copy().view("<u4")             # bit j is the 5th bit of weight j
    j = np.arange(16, dtype=np.uint32)
    lo = (qs & 0x0F) | (((qh >> j) & 1) << 4).astype(np.uint8)
    hi = (qs >> 4) | (((qh >> (j + 16)) & 1) << 4).astype(np.uint8)
    s = (np.concatenate([lo, hi], axis=1).astype(np.int16) - 16).astype(np.int8)
    out = np.concatenate([d, s.view(np.uint8)], axis=1)  # Q8_0 block: f16 d, 32 int8
    return out.reshape(*raw.shape[:-1], raw.shape[-1] // 22 * 34)


new = {t.name: q5_0_to_q8_0(t.data) for t in r.tensors if t.tensor_type == Q.Q5_0}
if not new:
    sys.exit(f"{src}: no Q5_0 tensors, nothing to do")

arch = r.fields.get("general.architecture")
w = GGUFWriter(dst, arch.contents() if arch else "unknown")
if not arch:                                       # a later part of a split model has none; don't add one
    w.kv_data[0].pop("general.architecture", None)
if "general.alignment" in r.fields:
    w.data_alignment = int(r.fields["general.alignment"].contents())
for f in r.fields.values():
    if f.name.startswith("GGUF.") or f.name == "general.architecture":
        continue
    w.add_key_value(f.name, f.contents(), f.types[0], sub_type=f.types[-1] if f.types[0] == T.ARRAY else None)

for t in r.tensors:
    data = new.get(t.name, t.data)
    w.add_tensor_info(t.name, data.shape, data.dtype, data.nbytes, Q.Q8_0 if t.name in new else t.tensor_type)
w.write_header_to_file()
w.write_kv_data_to_file()
w.write_ti_data_to_file()
for t in r.tensors:
    w.write_tensor_data(new.get(t.name, t.data))
w.close()

grew = sum(a.nbytes for a in new.values()) - sum(t.n_bytes for t in r.tensors if t.name in new)
print(f"{dst}: {', '.join(new)} now Q8_0, {grew / 1e6:.1f} MB larger")
```

## Accuracy

On an 84-question sample of MMLU-Pro (six questions from each of its 14 subjects, fixed seed), with thinking off, Flash-Next at 2.3 bits scored 66.7%, 56 of 84. Seven times it started working the problem instead of giving a letter, which counts as wrong. Qwen3.8-27B at 4.8 bits, which our rack serves every day, scored 59.5%, 50 of 84.

That's a lead, not a verdict. With 84 questions, the margin is about ±10 points either way, so the two could be level. What it does show is that the 2.3-bit file is not broken: a 125B model squeezed this hard still answers like a capable model.

## Who it's for

| Good fit | Poor fit |
|---|---|
| One person, short prompts, long answers | Agents and coding tools that send 8,000-token prompts |
| A model bigger than your one card, with RAM behind it | Several people sharing one card |
| A used 32 GB V100 you already own | Cards on x1 risers or mining links: a [CMP 100-210](/learn/mining-cards-for-ai) moves 0.41 GB/s, about 3.7 ms per expert, and a token needs 320 |
| Ampere or newer (sm_80 and up), where the prompt penalty should mostly go away | P100s and other cards without tensor cores |

**If the model fits on your card, colibri is still worth a try.** On Qwen3.6-35B-A3B, which fits on one V100, colibri wrote 7 to 9% slower than llama.cpp but read prompts 1.6 times faster than llama.cpp's best tuning: about 2,050 against 1,256 tok/s at 8,000 tokens. The prompt penalty above comes only from moving experts out of RAM.

## The setup

| Part | What we used |
|---|---|
| Server | NVIDIA DGX-1, one of its eight V100s |
| Card | Tesla V100 SXM2 32 GB, PCIe Gen3 x16 to the host |
| Host | 2× Xeon E5-2698 v4, 251 GiB RAM, Ubuntu 24.04 container |
| colibri | 2.1.0, commit `0a5504a1`, CUDA 12.8, `--gpu 0 --ctx 65536`, one KV slot |
| llama.cpp | Same file, `-ub 2048`, warm repeats (the first repeat reads the file from disk) |
| Model | `unsloth/Qwen3.8-Flash-Next-GGUF` UD-IQ2_XS, 75.8 GB, SHA-256 checked, `blk.4.ffn_down_exps` rewritten as Q8_0 |
| Quality | MMLU-Pro, 84 questions, six per subject, thinking off |

## Before you read too much into it

- **One card, one model, one day.** Every number here is from one V100 in one server on November 12.
- **Two llama.cpp figures are rounded.** The 22.6 and 29.3 tok/s llama.cpp figures are warm repeats, rounded.
- **A small quality test.** 84 questions, one run each, about ±10 points.
- **Not tested yet:** 64 GB of RAM, an SXM2-to-PCIe adapter, and an AVX-only CPU.

## What's next

- **Ampere.** We'll run the same file on an RTX A4500. Colibri's own docs report this model, from a 68 GB IQ2_XS file, on a newer 24 GB card, an RTX PRO 4000, at 209 to 213 tok/s reading and 49.6 to 50.8 writing, so the prompt penalty looks like a V100 problem rather than a colibri one.
- **Models over 80 GB**, where llama.cpp has to put most of the experts in RAM.
- **64 GB of RAM**, to see whether the 96 GB line can come down.

Running colibri on an Ampere card, or on an AVX-only box? [Send us your numbers](/articles#share).
