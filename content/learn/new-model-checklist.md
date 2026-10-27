---
title: "How to judge a new local model in one evening"
description: A new open model just dropped. A practical checklist to decide in a few hours whether it fits your hardware, works with your tools, and beats what you run now.
track: models
order: 21
date: 2026-10-26
models: qwen3-30b-a3b, gpt-oss-20b
---
**Don't trust the launch chart. Check that it fits, check that your tools can run it, then test it on your own prompts against the model you already use.** That takes an evening, and it answers the only question that matters: is it better for *you*?

New open models come out every week. Most are fine, a few are great, and almost all of them are announced with a benchmark chart where they win. Here's the routine we use.

## 1. Read the numbers that decide if it fits

Open the model card (see [how to read a model card](/learn/how-to-read-a-model-card)) and find three things:

- **Total parameters.** This sets memory. At 4-bit, budget about 0.6 GB per billion, plus a gigabyte or two for context.
- **Active parameters.** If it's a mixture-of-experts model, this sets speed. A 30B model with 3B active runs like a 3B model, if it fits. See [mixture of experts explained](/learn/mixture-of-experts-explained).
- **Context length.** Useful, but long context costs extra memory.

Then work out the speed. Tok/s is roughly your memory bandwidth divided by the gigabytes read per token. Our [GPU pages](/gpu) do this for the models we track, so compare against a model of similar size. Here's a 3090 for reference:

{{lineup rtx-3090}}

## 2. Check the license

Thirty seconds now saves trouble later. Apache 2.0 and MIT are the simple ones. Custom licenses can limit commercial use, set conditions for large companies, or apply rules to anything built from the model. See [open model licenses explained](/learn/open-model-licenses-explained).

## 3. Check your tools can run it

This is where most new releases trip people up.

- **Is there a GGUF?** Ollama, llama.cpp and LM Studio all use GGUF files. Popular releases usually get community GGUFs within days.
- **Is there an Ollama tag?** If so it's one command. If not, you can [import a GGUF into Ollama](/learn/import-gguf-into-ollama) yourself.
- **Does your runtime support the architecture?** A genuinely new design can need a llama.cpp update before it loads. Update Ollama or LM Studio first.
- **Does it need newer hardware?** Some official files use number formats only recent cards handle.

A live example from our rack: NVIDIA Nemotron 3.5 Bolt, a 74B mixture-of-experts model with 9B active, trained to run at 2-bit so it's about 24 GB, with vision built in. NVIDIA's own file needs an Ada or Blackwell card. The Unsloth GGUF works on older cards. Same model, different file, very different hardware list. It's queued for testing on our rack now.

## 4. Wait a few days if you can

The first files for a new model are often a little wrong: a broken chat template, a bad tokenizer setting, a quant made before a fix landed. The symptoms are rambling, answering itself, or ignoring the system prompt. If a hyped model seems oddly bad on day one, re-download it a week later before you judge it.

## 5. Test it on your own prompts

This is the part that counts. Write down five prompts from your real work, for example:

1. A coding or spreadsheet task you did this week.
2. A summary of a document you know well, so you can spot mistakes.
3. A factual question about your field, where you know the answer.
4. A piece of writing in your own style or tone.
5. Something that needs reasoning, like a planning problem or a tricky bug.

Run each on the new model and on your current one, same settings, fresh chat. Open WebUI can show two models side by side, which makes this quick; see [Open WebUI setup](/learn/open-webui-setup).

Score each answer: right or wrong, then which you'd rather use. Don't let speed or confidence sway you. A fluent wrong answer is still wrong.

## 6. Check the practical stuff

- **Speed on your machine.** Run `ollama ps` while it's loaded to check it's fully on the GPU and not spilling onto the CPU.
- **Thinking mode.** If it reasons first, is the wait worth it for your tasks? Can you turn it off?
- **Long context.** Paste in a long document and ask about something near the start.
- **Tool calling**, if you use agents. Many models claim it; fewer do it reliably.

## 7. Decide

If it won on at least three of your five prompts and runs at a speed you can live with, switch. If it's a tie, stay with what you have: your setup already works. Either way, delete what you don't use:

```sh
ollama rm <model-name>
```

Ran a new model on interesting hardware? [Send us your numbers](/learn/posts#share). For a starting point by memory size, see [best local LLM for 24 GB](/learn/best-local-llm-for-24gb-vram).
