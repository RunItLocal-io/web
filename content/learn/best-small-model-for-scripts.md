---
title: The best small local model for scripts, classification and JSON
description: Which small open model to use when a script calls it thousands of times to classify text, extract fields or return JSON, and how to get reliable structured output.
track: models
order: 13
date: 2026-10-26
models: qwen3-4b, qwen3-8b, qwen3-14b
---
When a script calls a model thousands of times, you want small, fast and predictable, not brilliant. For sorting support emails, tagging products, pulling fields out of invoices or turning messy text into JSON, **Qwen3 4B** is the pick, with **Qwen3 8B** when 4B makes too many mistakes.

## The pick: Qwen3 4B

```sh
ollama pull qwen3:4b
```

About 2.5 GB at 4-bit, so it fits on almost anything, including laptops with no graphics card, and leaves lots of room for long inputs. It follows instructions well for its size and handles structured output reliably when you give it a schema.

## When to step up

- **Qwen3 8B** when the categories are subtle, the text is messy, or 4B keeps getting edge cases wrong. About half the speed.
- **Qwen3 14B** when the task needs real judgment, like "is this review complaining about shipping or the product?" with sarcasm involved.

Test on a sample first. Label 50 to 100 examples by hand, run each model over them, and count the mistakes. Use the smallest model that's accurate enough.

## How fast it runs

Speed is the whole point here. Estimated from our calculator:

| Hardware | Qwen3 4B | Qwen3 8B |
|---|---|---|
| [RTX 3060 12 GB](/gpu/rtx-3060) | ~79 tok/s | ~38 tok/s |
| [RTX 4060](/gpu/rtx-4060) | ~60 tok/s | ~29 tok/s |
| [RTX 3090](/gpu/rtx-3090) | ~206 tok/s | ~99 tok/s |
| [Apple M4](/gpu/apple-m4), 16 GB | ~26 tok/s | ~13 tok/s |

A classification answer is a handful of tokens, so even a modest card handles many items a minute. Most of the time goes into reading the input, so shorter inputs mean faster jobs.

{{lineup rtx-3060 12}}

## Turn thinking off

Qwen3's thinking mode writes out its reasoning before answering. For classification and extraction that's usually wasted time. Add `/no_think` to the end of your prompt. Only turn thinking back on if accuracy on your test set clearly improves.

## Get JSON you can trust

Ollama can force the model's output to match a JSON schema, using the `format` field in its API. The model can't answer in any other shape, so your script doesn't break on a stray sentence:

```sh
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3:4b",
  "stream": false,
  "messages": [{"role": "user", "content": "Classify this email: My order arrived broken. /no_think"}],
  "format": {
    "type": "object",
    "properties": {
      "category": {"type": "string", "enum": ["billing", "shipping", "damaged", "other"]},
      "urgent": {"type": "boolean"}
    },
    "required": ["category", "urgent"]
  }
}'
```

The answer comes back in the `message.content` field as a JSON string matching the schema. The same works from Python and JavaScript through Ollama's libraries, or through the OpenAI-compatible endpoint at `http://localhost:11434/v1`. More in [structured output with Ollama](/learn/structured-output-json-with-ollama).

## Tips for reliable results

- **Use an `enum` for categories.** The model can only pick from your list.
- **Set the temperature to 0.** You want the same answer every time for the same input. See [temperature and sampling](/learn/temperature-and-sampling).
- **Put instructions in the system prompt** and only the item in the user message. Keeps every call identical.
- **Give two or three examples** of input and correct output. This helps small models more than anything else.
- **Allow "other" or "unsure".** Forcing a choice on unclear items creates confident wrong answers.
- **Spot-check the output.** Sample a few dozen results after every big run.

## Running a big batch

Loop over your files and call the API once per item. Ollama keeps the model loaded between calls, so there's no startup cost per item. For more throughput, Ollama can handle several requests at once if you have memory to spare. For the full pattern, see [batch jobs with a local model](/learn/batch-jobs-with-a-local-model).

On our rack we ran a billion tokens through 90 used GPUs in 2.9 days, and power came to about 6 to 8 cents per million tokens. Big jobs on cheap local hardware are very cheap to run.

## What small models are bad at

- **Facts.** Don't ask a 4B model what something is; give it the text and ask it to extract.
- **Long, multi-step reasoning.** Split it into steps, or use a bigger model.
- **Very long inputs.** Accuracy drops on long documents. Chunk them.

For tasks where the model calls tools or takes actions, see [the best local model for agents and tool calling](/learn/best-local-model-for-agents-and-tool-calling).
