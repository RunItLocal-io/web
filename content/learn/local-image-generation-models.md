---
title: "Local image generation models: SDXL, Flux and how much VRAM"
description: The main open image models for running at home, roughly how much graphics memory each needs, which tools to use, and how to try it in your browser.
track: models
order: 27
date: 2026-10-26
---
**For image generation at home, SDXL is the easy, well-supported choice on 8 to 12 GB cards, and Flux gives better images and better text in pictures if you have 16 to 24 GB.** Older Stable Diffusion 1.5 still runs on almost anything. To try it with no install at all, our [Studio](/studio) generates images in your browser on your own GPU.

## The main model families

| Family | Quality | Rough VRAM | Notes |
|---|---|---|---|
| Stable Diffusion 1.5 | Dated, but huge ecosystem | ~4 to 6 GB | Thousands of fine-tunes and add-ons |
| SDXL | Good | ~8 to 12 GB | The well-supported middle ground |
| Flux | Very good, strong at text in images | ~12 GB with quantized files, 24 GB+ at full size | Big model, slower per image |
| Fast "turbo" models | Rough, but near instant | ~4 GB and up | One to a few steps per image |

The VRAM figures are approximate. They depend on image size, the tool, and its memory-saving settings. Many tools can run bigger models on smaller cards by moving parts of the model to system memory, at a cost in speed. Quantized versions of Flux, including GGUF files, cut memory a lot for a small loss in quality. See [quantization explained](/learn/quantization-explained).

## Images are different from text

Text generation is limited by memory bandwidth; see [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed). Image generation runs the model many times per picture and leans much harder on raw compute. So:

- **Newer NVIDIA cards win clearly.** Tensor cores matter here.
- **A card that's great for chat can be poor for images.** Our rack's Tesla P100s are fast at text but slow at images, because they have no tensor cores. See [the Tesla P100 for local LLMs](/learn/tesla-p100-for-local-llms).
- **Macs work**, more slowly than a similar-priced NVIDIA card.
- **AMD and Intel cards** work with some tools, with more setup. See [AMD GPUs for local AI](/learn/amd-gpus-for-local-ai).

The [RTX 3060 12 GB](/gpu/rtx-3060) is a popular starter for images: enough memory for SDXL with room to spare. A [used RTX 3090](/learn/used-rtx-3090-buying-guide) runs Flux comfortably.

## Try it in your browser first

Our [Studio](/studio) runs **SD-Turbo** entirely on your own GPU through WebGPU. Nothing is sent to a server. It's about a 2.5 GB download the first time, then it's cached and works offline. It makes 512×512 images in a single step, so it's fast but rough next to SDXL or Flux. It's a quick way to see if your machine handles image generation before you install anything. It needs a browser with WebGPU support.

## The tools

- **ComfyUI** builds image pipelines from connected nodes. It's the most flexible, and usually the first to support new models.
- **Stable Diffusion WebUI** (AUTOMATIC1111) and its forks, like Forge, give you a classic form-style interface.
- **InvokeAI** is a polished app with a canvas for editing.
- **Draw Things** is a popular native app on Mac.

All of these are free and run locally. ComfyUI or a Forge-style WebUI is a good first pick on a PC.

## Getting good results

- **Use the size a model was trained on.** SDXL and Flux are built for around 1024×1024; SD 1.5 for 512×512. Far off that and you get stretched or duplicated subjects.
- **Steps and guidance** matter. Each model has recommended settings on its model card; start there. See [how to read a model card](/learn/how-to-read-a-model-card).
- **Fine-tunes and LoRAs** add styles and subjects. They must match the base model family.
- **Seeds** let you repeat an image and tweak one thing at a time.

## Licenses vary more than for text models

Image models come under a wide range of licenses, and some popular ones are for non-commercial use only. Fine-tunes inherit the base model's terms. Check before you use images commercially. See [open model licenses explained](/learn/open-model-licenses-explained).

## Images and chat on one card

A 24 GB card can hold a chat model or an image model comfortably, but not both large ones at once. Ollama unloads idle models after a while, or you can stop one before starting the other. Here's what a 3090 runs on the chat side:

{{lineup rtx-3090}}

For a step-by-step setup, see the [local image generation guide](/learn/local-image-generation-guide). Or open the [Studio](/studio) and make your first image in a minute.
