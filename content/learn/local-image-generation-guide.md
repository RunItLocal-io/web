---
title: "Local image generation: make AI images on your own GPU"
description: How to generate images on your own computer, from a one-click test in the browser to ComfyUI with SDXL and Flux. What hardware you need and why it differs from LLMs.
track: use
order: 12
date: 2026-10-26
---
**The fastest way to try it is our [Studio](/studio), which generates images on your own GPU inside the browser, with nothing to install.** For more control, bigger models and higher resolution, install a desktop tool like ComfyUI and run Stable Diffusion or Flux-class models. Either way, your prompts and pictures never leave your machine.

## Try it in the browser first

The [Studio](/studio) runs SD-Turbo, a small, fast Stable Diffusion model, directly on your graphics card using WebGPU.

- **One download, about 2.5 GB.** The model files are saved in your browser, so the next visit loads from disk and works offline.
- **512 × 512 images in a single step.** SD-Turbo is built to make a picture in one pass, so results come back quickly.
- **Needs a browser with WebGPU** and a GPU that supports its 16-bit maths. Most recent graphics cards and Apple silicon Macs do.

It's a good way to find out whether your machine handles image generation at all, and whether you enjoy it, before you install anything. You can remove the downloaded model from the Studio when you're done.

## When to move to a desktop tool

The browser version is deliberately small. Install a desktop app when you want:

- **Better models**, like SDXL and Flux-class models, with far more detail and better text in images.
- **Higher resolution** and more steps for quality.
- **Control:** image-to-image, inpainting (repaint part of a picture), and guides that control pose or composition.
- **Add-ons** like LoRAs, small files that teach a model a style or character.

**ComfyUI** is the most popular choice. You build a workflow from connected boxes, which looks daunting but means you can load a workflow someone else shared and run it. There are also simpler web interfaces that give you a single prompt box and sliders, if that's all you need.

## Hardware: different rules from chat models

For text, speed depends on memory bandwidth; see [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed). **Image generation is different. It's limited by raw compute**, so newer cards with tensor cores pull far ahead, and memory decides which models and resolutions you can run.

Rough guide:

| Memory | What runs comfortably |
|---|---|
| 4 to 6 GB | SD-Turbo in the [Studio](/studio), older Stable Diffusion models at low resolution |
| 8 GB | SDXL, with some memory-saving settings |
| 12 GB | SDXL comfortably, smaller or compressed Flux-class models |
| 16 to 24 GB | Flux-class models at full quality, larger batches |

These are rough; exact needs depend on the model version, resolution and the tool's settings. Compressed (quantized) versions of big image models bring them down onto smaller cards, at some loss of quality. See [local image generation models](/learn/local-image-generation-models) for the details on each.

**Card picks.** NVIDIA cards are the easy path, because most image tools are built for CUDA first. Our **Starter** build, a used desktop with an RTX 3060 12 GB at about **$300 to $400**, is a good entry point for SDXL. Our **Popular** build, with a used RTX 3090 24 GB at **$900 to $1,200**, runs the big models without workarounds. Both are on the [builds page](/builds).

**Cards to avoid for this.** Data-center cards without tensor cores, like the Tesla P100, are great value for text but slow for images. See [the Tesla P100 for local LLMs](/learn/tesla-p100-for-local-llms). AMD and Intel cards work with some tools, with more setup; see [AMD GPUs for local AI](/learn/amd-gpus-for-local-ai).

**Macs** run image models too, more slowly than a comparable NVIDIA card. The Studio works on Apple silicon in a WebGPU browser.

## Tips for better results

1. **Describe the picture, not the idea.** "A red fox curled up in snow, soft morning light, close-up photo" beats "a cozy fox".
2. **Fix the seed** when you're adjusting a prompt, so you change one thing at a time.
3. **Generate several, keep one.** Images are cheap locally. Make four and pick the best.
4. **Match the model's native size.** Each model has a resolution it was trained at. Going far off it gives stretched or repeated subjects.

## A note on what you make

Local tools have no content filter beyond what's trained into the model. Images of real people, and anything you'd publish, carry the same legal and ethical rules as any other image. Model licenses also differ, especially for commercial use; see [open model licenses explained](/learn/open-model-licenses-explained).

## Where to go next

Open the [Studio](/studio) and make something. To see what your card handles for text models too, check [every GPU](/gpu).
