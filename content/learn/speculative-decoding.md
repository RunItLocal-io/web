---
title: "Speculative decoding: make local LLMs faster with a draft model"
description: How speculative decoding uses a small draft model to speed up a big one with no quality loss, when it helps, and how to turn it on in llama.cpp.
track: serve
order: 14
date: 2026-10-26
models: qwen3-4b, qwen3-32b, llama-3-3-70b
---
**Speculative decoding pairs a big model with a small "draft" model from the same family.** The small one quickly guesses the next several tokens; the big one checks all of them in a single pass and keeps the ones it agrees with. The output is exactly what the big model would have written alone, just sooner. It helps most with big dense models on predictable text like code, and it costs some extra memory for the second model.

## Why it works

Generating a token is limited by memory bandwidth: the GPU has to read every weight of the model for each token. See [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed). But checking several tokens at once costs about the same as generating one, because the weights are read once either way.

So if a tiny model guesses five tokens and the big model agrees with four, you got four tokens for roughly the cost of one big-model step plus five cheap small-model steps. When the guesses are wrong, the big model's answer is used instead and nothing is lost but a little time.

Our calculator shows the gap the trick exploits. On an RTX 3090:

{{lineup rtx-3090}}

The 3090 runs [Qwen3 4B](/model/qwen3-4b) at an estimated 206 tok/s and [Qwen3 32B](/model/qwen3-32b) at about 26. The small one can make several guesses in the time the big one takes for one token.

## When it helps and when it doesn't

| Situation | Benefit |
|---|---|
| Big dense model, like Qwen3 32B or Llama 3.3 70B | Biggest |
| Code, structured text, rewriting or quoting the input | Big: guesses are often right |
| Free-form creative writing at high temperature | Small: guesses are often wrong |
| Mixture-of-experts models, like Qwen3 30B-A3B | Small: they're already fast |
| Model barely fits your memory | None: there's no room for the draft |
| Many users at once | Less: batching already uses the spare compute |

The draft must share the main model's tokenizer, which in practice means the same family: a small Qwen3 for a big Qwen3, a small Llama for a big Llama. The smaller and faster the draft, the better, as long as it guesses well. Qwen3 4B or a smaller Qwen3 is a natural draft for Qwen3 32B.

## Turn it on in llama.cpp

`llama-server` takes a draft model with `-md`:

```sh
llama-server -m Qwen3-32B-Q4_K_M.gguf -md Qwen3-4B-Q4_K_M.gguf -ngl 99 -ngld 99 -c 16384
```

- `-m` is the main model; `-md` is the draft.
- `-ngl 99` and `-ngld 99` put all layers of each model on the GPU.
- `--draft-max` sets how many tokens the draft guesses at a time. The default is a reasonable start; try a few values and measure.

Both models must fit in memory together, along with context for each. On a 24 GB card, a 4-bit Qwen3 32B takes about 22 GB on its own, so a 4B draft won't fit beside it. Use a much smaller draft with less context, or two cards. See the [llama.cpp server guide](/learn/llama-cpp-server-guide) for the rest of the flags.

## Other tools

- **LM Studio** has a speculative decoding option in a model's settings: choose a compatible draft model and it pairs them. See the [LM Studio guide](/learn/lm-studio-guide).
- **vLLM** supports it too, for team servers. See [vLLM for a team](/learn/vllm-for-a-team).
- **Ollama** doesn't offer a draft-model setting at the time of writing. If you want it, use llama.cpp or LM Studio.

## Measure, don't assume

The gain depends on your hardware, your models and your prompts, so test it on your own work. Run the same prompt with and without the draft and compare the tokens per second that llama-server reports. If the speed doesn't improve, the draft is guessing wrong too often or is too slow; try a smaller draft or a lower `--draft-max`.

Big dense models are where this matters most. For running [Llama 3.3 70B](/model/llama-3-3-70b) across two cards, see the [70B hardware guide](/learn/llama-3-3-70b-hardware-guide). If you'd rather have speed without the fuss, a mixture-of-experts model is the simpler path; see [mixture of experts explained](/learn/mixture-of-experts-explained).
