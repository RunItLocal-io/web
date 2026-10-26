# Learn: the 100-article plan

Not published (files starting with _ are skipped). One line per article: slug, then the search it answers.
[x] = written. Publish in batches of 10 to 20, and only when an article has something of ours in it:
a rack measurement, a calculator embed ({{lineup gpu-slug}}), a real parts list, or a thing that broke.

## start: Get started
- [x] how-to-run-ai-locally: how to run an LLM locally
- [x] is-local-ai-worth-it: local LLM vs ChatGPT, cost and privacy
- [ ] ollama-commands-cheat-sheet: ollama commands list
- [ ] run-ai-on-a-laptop-without-a-gpu: run llm on cpu only
- [ ] run-ai-locally-on-windows: local llm windows setup
- [ ] run-ai-locally-on-linux: ollama linux nvidia drivers
- [ ] run-ai-locally-on-a-mac: ollama mac setup
- [ ] first-week-with-local-ai: what to actually do with a local model
- [ ] local-ai-glossary: tokens, context, quant, GGUF in plain English
- [ ] how-to-update-and-delete-models: free up disk space ollama
- [ ] where-ollama-stores-models: ollama model location change
- [ ] local-ai-privacy-what-stays-on-your-machine: does ollama send data
- [ ] run-ai-in-your-browser-webgpu: WebLLM, no install (link the Studio)

## basics: Know what matters
- [x] how-much-vram-do-you-need: how much vram for llm
- [x] quantization-explained: Q4_K_M vs Q8 vs FP16
- [x] memory-bandwidth-and-llm-speed: why is my llm slow / tokens per second
- [x] mixture-of-experts-explained: what is MoE, active parameters
- [ ] context-length-and-kv-cache: why long context uses more vram
- [ ] gguf-vs-safetensors-vs-mlx: model file formats
- [ ] tokens-per-second-explained: what is a good tok/s
- [ ] prompt-processing-vs-generation-speed: prefill vs decode
- [ ] cpu-offloading-explained: model bigger than vram partial offload
- [ ] multi-gpu-explained: two GPUs, layer split vs tensor parallel
- [ ] does-pcie-bandwidth-matter-for-llms: PCIe x1 risers, x4 slots
- [ ] system-ram-for-local-ai: how much RAM do I need
- [ ] thinking-models-explained: reasoning mode, /think, effort levels
- [ ] what-is-a-system-prompt: and how to set one locally
- [ ] temperature-and-sampling: settings that matter
- [ ] power-and-heat-of-local-ai: watts, electricity cost per million tokens (rack data)
- [ ] what-the-leaderboard-measures: how we benchmark

## models: Pick a model
- [x] best-local-llm-for-8gb-vram
- [ ] best-local-llm-for-12gb-vram
- [ ] best-local-llm-for-16gb-vram
- [x] best-local-llm-for-24gb-vram
- [ ] best-local-llm-for-32gb-and-up
- [ ] best-local-llm-for-mac-16gb
- [ ] best-local-llm-for-mac-64gb-and-up
- [x] best-local-llm-for-coding
- [ ] best-local-llm-for-writing
- [ ] best-local-llm-for-reasoning-and-math
- [ ] best-local-vision-model: read images and screenshots
- [ ] best-local-model-for-translation
- [ ] best-small-model-for-scripts: classify, extract, JSON
- [ ] best-local-model-for-agents-and-tool-calling
- [ ] best-uncensored-local-model: what "abliterated" means and the tradeoffs
- [ ] qwen3-vs-gemma-3
- [ ] gpt-oss-20b-vs-qwen3-30b
- [ ] qwen3-32b-vs-llama-3-3-70b
- [ ] gpt-oss-120b-on-a-mac
- [ ] llama-3-3-70b-hardware-guide
- [ ] new-model-checklist: how to judge a new release in an evening
- [ ] how-to-read-a-model-card
- [ ] open-model-licenses-explained: Apache, Llama, Gemma terms
- [ ] local-embedding-models: nomic-embed-text and friends
- [ ] local-speech-to-text-models: Whisper sizes and speeds
- [ ] local-text-to-speech-models
- [ ] local-image-generation-models: SDXL, Flux, VRAM needs

## hardware: Pick your hardware
- [x] used-rtx-3090-buying-guide
- [x] tesla-p100-for-local-llms (rack data)
- [x] mac-for-local-llms
- [ ] tesla-p40-for-local-llms
- [ ] rtx-3060-12gb-for-ai: the starter card
- [ ] rtx-4090-vs-two-3090s
- [ ] rtx-5090-for-local-ai
- [ ] amd-gpus-for-local-ai: ROCm and Vulkan in practice
- [ ] intel-arc-for-local-ai
- [ ] used-workstation-builds: T7810, Z840 and friends
- [ ] cooling-passive-data-center-cards: shrouds and fans (rack data)
- [ ] power-supplies-for-multi-gpu
- [ ] mining-cards-for-ai: CMP cards, what works (rack data)
- [ ] best-gpu-under-300
- [ ] best-gpu-under-1000
- [ ] laptop-for-local-ai
- [ ] mini-pc-and-strix-halo-for-ai: unified memory x86
- [ ] how-to-check-a-used-gpu: stress test, VRAM test, what to look for
- [ ] home-ai-server-build: quiet, always-on
- [ ] the-90-gpu-rack: what we learned (lab note)

## serve: Run and serve it
- [x] ollama-vs-llama-cpp-vs-lm-studio
- [x] open-webui-setup
- [ ] llama-cpp-server-guide
- [ ] lm-studio-guide
- [ ] ollama-api-guide: OpenAI-compatible endpoint
- [ ] ollama-on-your-network: OLLAMA_HOST, phones, other PCs
- [ ] increase-ollama-context-length
- [ ] import-gguf-into-ollama: Modelfile
- [ ] run-ollama-in-docker
- [ ] vllm-for-a-team: when to move beyond Ollama
- [ ] serve-a-team-on-used-gpus (rack data)
- [ ] secure-your-local-ai-server: auth, tunnels, don't expose 11434
- [ ] remote-access-with-tailscale-or-cloudflare
- [ ] speculative-decoding: faster with a draft model
- [ ] fix-ollama-using-cpu-instead-of-gpu
- [ ] fix-out-of-memory-errors

## use: Make it useful
- [x] chat-with-your-documents-locally
- [ ] local-coding-assistant-in-vs-code: Continue, Cline and friends
- [ ] local-ai-for-obsidian-notes
- [ ] local-voice-assistant: Whisper + model + TTS
- [ ] local-ai-agents: tools, MCP, what works on small models
- [ ] local-ai-for-home-assistant
- [ ] summarize-meetings-locally
- [ ] local-ai-for-email
- [ ] batch-jobs-with-a-local-model: process a folder of files
- [ ] local-ai-for-small-business
- [ ] local-ai-for-families-and-kids
- [ ] local-image-generation-guide: link the Studio
- [ ] structured-output-json-with-ollama
- [ ] local-rag-that-actually-works: chunking, embeddings, reranking
