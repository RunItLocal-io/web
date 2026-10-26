# Learn: the 100-article plan

Not published (files starting with _ are skipped). One line per article: slug, then the search it answers.
[x] = written. Publish in batches of 10 to 20, and only when an article has something of ours in it:
a rack measurement, a calculator embed ({{lineup gpu-slug}}), a real parts list, or a thing that broke.

## start: Get started
- [x] how-to-run-ai-locally: how to run an LLM locally
- [x] is-local-ai-worth-it: local LLM vs ChatGPT, cost and privacy
- [x] ollama-commands-cheat-sheet: ollama commands list
- [x] run-ai-on-a-laptop-without-a-gpu: run llm on cpu only
- [x] run-ai-locally-on-windows: local llm windows setup
- [x] run-ai-locally-on-linux: ollama linux nvidia drivers
- [x] run-ai-locally-on-a-mac: ollama mac setup
- [x] first-week-with-local-ai: what to actually do with a local model
- [x] local-ai-glossary: tokens, context, quant, GGUF in plain English
- [x] how-to-update-and-delete-models: free up disk space ollama
- [x] where-ollama-stores-models: ollama model location change
- [x] local-ai-privacy-what-stays-on-your-machine: does ollama send data
- [x] run-ai-in-your-browser-webgpu: WebLLM, no install (link the Studio)

## basics: Know what matters
- [x] how-much-vram-do-you-need: how much vram for llm
- [x] quantization-explained: Q4_K_M vs Q8 vs FP16
- [x] memory-bandwidth-and-llm-speed: why is my llm slow / tokens per second
- [x] mixture-of-experts-explained: what is MoE, active parameters
- [x] context-length-and-kv-cache: why long context uses more vram
- [x] gguf-vs-safetensors-vs-mlx: model file formats
- [x] tokens-per-second-explained: what is a good tok/s
- [x] prompt-processing-vs-generation-speed: prefill vs decode
- [x] cpu-offloading-explained: model bigger than vram partial offload
- [x] multi-gpu-explained: two GPUs, layer split vs tensor parallel
- [x] does-pcie-bandwidth-matter-for-llms: PCIe x1 risers, x4 slots
- [x] system-ram-for-local-ai: how much RAM do I need
- [x] thinking-models-explained: reasoning mode, /think, effort levels
- [x] what-is-a-system-prompt: and how to set one locally
- [x] temperature-and-sampling: settings that matter
- [x] power-and-heat-of-local-ai: watts, electricity cost per million tokens (rack data)
- [x] what-the-leaderboard-measures: how we benchmark

## models: Pick a model
- [x] best-local-llm-for-8gb-vram
- [x] best-local-llm-for-12gb-vram
- [x] best-local-llm-for-16gb-vram
- [x] best-local-llm-for-24gb-vram
- [x] best-local-llm-for-32gb-and-up
- [x] best-local-llm-for-mac-16gb
- [x] best-local-llm-for-mac-64gb-and-up
- [x] best-local-llm-for-coding
- [x] best-local-llm-for-writing
- [x] best-local-llm-for-reasoning-and-math
- [x] best-local-vision-model: read images and screenshots
- [x] best-local-model-for-translation
- [x] best-small-model-for-scripts: classify, extract, JSON
- [x] best-local-model-for-agents-and-tool-calling
- [x] best-uncensored-local-model: what "abliterated" means and the tradeoffs
- [x] qwen3-vs-gemma-3
- [x] gpt-oss-20b-vs-qwen3-30b
- [x] qwen3-32b-vs-llama-3-3-70b
- [x] gpt-oss-120b-on-a-mac
- [x] llama-3-3-70b-hardware-guide
- [x] new-model-checklist: how to judge a new release in an evening
- [x] how-to-read-a-model-card
- [x] open-model-licenses-explained: Apache, Llama, Gemma terms
- [x] local-embedding-models: nomic-embed-text and friends
- [x] local-speech-to-text-models: Whisper sizes and speeds
- [x] local-text-to-speech-models
- [x] local-image-generation-models: SDXL, Flux, VRAM needs

## hardware: Pick your hardware
- [x] used-rtx-3090-buying-guide
- [x] tesla-p100-for-local-llms (rack data)
- [x] mac-for-local-llms
- [x] tesla-p40-for-local-llms
- [x] rtx-3060-12gb-for-ai: the starter card
- [x] rtx-4090-vs-two-3090s
- [x] rtx-5090-for-local-ai
- [x] amd-gpus-for-local-ai: ROCm and Vulkan in practice
- [x] intel-arc-for-local-ai
- [x] used-workstation-builds: T7810, Z840 and friends
- [x] cooling-passive-data-center-cards: shrouds and fans (rack data)
- [x] power-supplies-for-multi-gpu
- [x] mining-cards-for-ai: CMP cards, what works (rack data)
- [x] best-gpu-under-300
- [x] best-gpu-under-1000
- [x] laptop-for-local-ai
- [x] mini-pc-and-strix-halo-for-ai: unified memory x86
- [x] how-to-check-a-used-gpu: stress test, VRAM test, what to look for
- [x] home-ai-server-build: quiet, always-on
- [x] the-90-gpu-rack: what we learned (lab note)

## serve: Run and serve it
- [x] ollama-vs-llama-cpp-vs-lm-studio
- [x] open-webui-setup
- [x] llama-cpp-server-guide
- [x] lm-studio-guide
- [x] ollama-api-guide: OpenAI-compatible endpoint
- [x] ollama-on-your-network: OLLAMA_HOST, phones, other PCs
- [x] increase-ollama-context-length
- [x] import-gguf-into-ollama: Modelfile
- [x] run-ollama-in-docker
- [x] vllm-for-a-team: when to move beyond Ollama
- [x] serve-a-team-on-used-gpus (rack data)
- [x] secure-your-local-ai-server: auth, tunnels, don't expose 11434
- [x] remote-access-with-tailscale-or-cloudflare
- [x] speculative-decoding: faster with a draft model
- [x] fix-ollama-using-cpu-instead-of-gpu
- [x] fix-out-of-memory-errors

## use: Make it useful
- [x] chat-with-your-documents-locally
- [x] local-coding-assistant-in-vs-code: Continue, Cline and friends
- [x] local-ai-for-obsidian-notes
- [x] local-voice-assistant: Whisper + model + TTS
- [x] local-ai-agents: tools, MCP, what works on small models
- [x] local-ai-for-home-assistant
- [x] summarize-meetings-locally
- [x] local-ai-for-email
- [x] batch-jobs-with-a-local-model: process a folder of files
- [x] local-ai-for-small-business
- [x] local-ai-for-families-and-kids
- [x] local-image-generation-guide: link the Studio
- [x] structured-output-json-with-ollama
- [x] local-rag-that-actually-works: chunking, embeddings, reranking
