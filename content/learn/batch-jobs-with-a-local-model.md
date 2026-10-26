---
title: "Batch jobs with a local model: process a folder of files with Ollama"
description: Run a local model over hundreds or thousands of files with a short Python script and Ollama's API. Summarize, tag or extract, with no per-token bill.
track: use
order: 9
date: 2026-10-26
models: qwen3-4b, qwen3-8b, qwen3-30b-a3b
---
**Loop over the files, send each one to Ollama's API, and save the answer next to it.** That's a batch job. It's where local models really pay off: there's no per-token bill, so summarizing 5,000 documents costs the same as summarizing five, just time and electricity.

## The script

This uses only Python's standard library. It reads every `.txt` file in a folder called `docs`, asks for a three-point summary, and writes the result into `summaries`. If you stop it halfway, run it again and it skips files it has already done.

```python
import json, pathlib, urllib.request

MODEL = "qwen3:8b"
URL = "http://localhost:11434/api/generate"
src = pathlib.Path("docs")
out = pathlib.Path("summaries")
out.mkdir(exist_ok=True)

for f in sorted(src.glob("*.txt")):
    target = out / f.name
    if target.exists():
        continue
    body = {
        "model": MODEL,
        "prompt": "Summarize this in three bullet points:\n\n" + f.read_text(errors="ignore"),
        "stream": False,
        "think": False,
        "options": {"num_ctx": 8192, "temperature": 0},
    }
    req = urllib.request.Request(URL, data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r:
        answer = json.loads(r.read())["response"]
    target.write_text(answer)
    print("done", f.name)
```

What the settings do:

- `"stream": False` returns the whole answer in one reply instead of word by word.
- `"think": False` turns off Qwen3's reasoning step, which is slow and not needed for summaries.
- `num_ctx` is the context window for this request. Make it big enough for your longest file plus the answer.
- `temperature: 0` makes results consistent, so a re-run gives the same output.

Make sure Ollama is running and the model is pulled first:

```sh
ollama pull qwen3:8b
```

## Ask for JSON when you'll use the results

If you're tagging or extracting, not summarizing, ask for structured output so you can load the results into a spreadsheet or database. Ollama can force replies to match a JSON schema. See [structured output with Ollama](/learn/structured-output-json-with-ollama).

## Pick the smallest model that's good enough

In a batch job, speed is multiplied by the number of files. Try your task on 20 files with [Qwen3 4B](/model/qwen3-4b) and [Qwen3 8B](/model/qwen3-8b), compare the results by eye, and only move up if the small one makes mistakes. Classifying and extracting are usually fine on 4B. Summaries are better on 8B and up.

If you have 24 GB, [Qwen3 30B-A3B](/model/qwen3-30b-a3b) is the batch favorite: much smarter than 8B and nearly as fast, because only about 3B of its weights are used per token.

Here's a used Tesla P100, the card our rack is built on, from our calculator:

{{lineup tesla-p100}}

## What our rack does with this

Batch work is exactly what we run on our rack of 90 used GPUs. In one run it processed **a billion tokens of Qwen3.6-35B-A3B in 2.9 days**, and power came to about **6 to 8 cents per million tokens**. Two Tesla P100s ran that model at 53 tok/s; two RTX A4500s at 110 tok/s. The 2016 P100s never throttled through the whole run.

The lesson for a home setup: old cards with fast memory are fine for jobs that run overnight. See [the Tesla P100 for local LLMs](/learn/tesla-p100-for-local-llms).

## Going faster

- **Run requests in parallel.** Ollama can serve several requests at once on one model, controlled by its `OLLAMA_NUM_PARALLEL` setting. Each parallel slot needs its own context memory, so start with two to four and watch memory with `nvidia-smi`. Then send requests from a few threads at once.
- **Keep the model loaded.** Model loading takes seconds. Ollama keeps a model in memory between back-to-back requests, so don't restart it mid-job.
- **Shorten the input.** Strip headers, boilerplate and repeated footers before sending. Fewer tokens in means faster results.
- **Bigger jobs:** for a whole team or millions of files, a server engine built for many requests at once may be faster. See [vLLM for a team](/learn/vllm-for-a-team).

## Checking the results

Models fail quietly. Spot-check a random sample of outputs, not just the first few. Log any file where the reply is empty or far shorter than expected, and re-run those. For PDFs and Word files, convert them to text first; the model only sees what you send.

## Where to go next

See what your card can run on [every GPU](/gpu), or see how ours compare on the [leaderboard](/leaderboard).
