---
title: "Open model licenses explained: Apache 2.0, Llama and Gemma terms"
description: What the licenses on popular open models mean in practice for personal, business and product use. Apache 2.0, the Llama community license and Gemma terms.
track: models
order: 23
date: 2026-10-26
models: qwen3-8b, gpt-oss-20b, llama-3-3-70b, gemma-3-27b
---
> This is general guidance, not legal advice. Licenses change between versions. If you're building a product or a business on a model, read the actual license that comes with the version you use, and ask a lawyer if anything is unclear.

**For personal use at home, every model on our list is fine to download and run. The differences show up when you build something on a model or ship it to others.** Apache 2.0 models are the simplest. Llama and Gemma models come with their own terms that add conditions.

## The models we track

| Model | License | Type |
|---|---|---|
| [Qwen3](/model/qwen3-8b), all sizes | Apache 2.0 | Standard open source |
| [gpt-oss 20B](/model/gpt-oss-20b) and [120B](/model/gpt-oss-120b) | Apache 2.0 | Standard open source |
| [Llama 3.3 70B](/model/llama-3-3-70b) | Llama 3.3 Community License | Custom |
| [Gemma 3](/model/gemma-3-27b) 12B and 27B | Gemma Terms of Use | Custom |

## "Open weights" isn't always "open source"

Open weights means you can download the model and run it. It doesn't by itself tell you what you're allowed to do with it. That's set by the license. Some models use a standard open-source license, others a custom one written by the maker. Both are common, and both usually allow running the model at home.

## Apache 2.0

A widely used open-source license, also used by a lot of ordinary software. In broad terms it lets you use, change and redistribute the model, including commercially. The main obligations are about passing the license and notices along when you redistribute it, and noting changes you made.

That's why Qwen3 and gpt-oss are popular with businesses: there's no separate approval to ask for and no custom terms to interpret.

## The Llama community license

Meta releases Llama under its own license for each version. It allows commercial use, but with conditions a standard open-source license doesn't have. In broad terms:

- **An acceptable use policy** lists things you may not use the model for.
- **Attribution requirements** cover how you credit Llama if you build on it or redistribute it.
- **Extra terms for very large companies.** Organizations above a size threshold need a separate license from Meta.
- **Derivatives carry the terms.** Fine-tunes of Llama remain under Llama's terms.

For most individuals and small businesses this doesn't get in the way. But read the license for the exact version you use, because the details differ between Llama releases.

## The Gemma terms of use

Google releases Gemma under its own terms of use rather than an open-source license. In broad terms they allow use and redistribution, including commercially, with a prohibited use policy attached. If you redistribute Gemma or a model built from it, the use restrictions travel with it to your users.

Our [Gemma 3 model pages](/model/gemma-3-12b) flag this as a reason to skip it if you need a standard open-source license.

## Questions people ask

**Can I use the output commercially?** Generally the licenses focus on the model, not ownership of what it writes for you. But some custom licenses do say things about using outputs, for example to train other models. Check yours.

**Do these apply to fine-tunes and GGUFs?** Yes. A community quant or fine-tune keeps the original license, whatever the uploader's page says. A Llama fine-tune is still under Llama's terms.

**Does running it locally change anything?** Not the license. It does mean your prompts and data stay on your machine, which is a separate question. See [local AI privacy](/learn/local-ai-privacy-what-stays-on-your-machine).

**What about images and speech models?** Same idea, different licenses, and image models especially vary. Some image models are released for non-commercial use only. See [local image generation models](/learn/local-image-generation-models).

## A simple way to decide

1. **Personal use:** don't worry about it. Pick on quality and fit.
2. **Internal business use:** Apache 2.0 models are the low-friction choice. Llama and Gemma are commonly used too; read their terms once.
3. **Shipping a product or redistributing the model:** read the full license, and get advice if the stakes are real.

Whatever you pick, the hardware question is the same. Our [GPU pages](/gpu) show what runs on your card, and here's a popular 16 GB card for reference:

{{lineup rtx-4060-ti 16}}

For choosing on quality, see [Qwen3 vs Gemma 3](/learn/qwen3-vs-gemma-3) and [how to read a model card](/learn/how-to-read-a-model-card).
