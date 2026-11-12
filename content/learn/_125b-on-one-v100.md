---
kind: post
title: "125B on One V100: 49.5 tok/s With Colibri"
description: Colibri runs Qwen3.8-Flash-Next, a 125B mixture-of-experts model, at 49.5 tok/s on one used 32 GB V100, 2 to 2.7× llama.cpp on the same card. The catch is slow prompts.
date: 2026-11-12
card: /learn/img/v100-sxm2-125b.png
---
Draft: front matter and the stats row the share card reads. The article body goes here; rename without the leading _ to publish.

```chart
{"type": "stats", "items": [
  {"value": "125B", "label": "Qwen3.8-Flash-Next on one 32 GB V100", "hi": true},
  {"value": "49.5 tok/s", "label": "decode, one conversation"},
  {"value": "18.3 to 22.6 tok/s", "label": "llama.cpp on the same card"},
  {"value": "≈47 tok/s", "label": "prompt reading at 2,000 tokens, the catch"}
]}
```
