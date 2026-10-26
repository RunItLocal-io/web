---
title: "Summarize meetings locally: transcribe and summarize without the cloud"
description: Turn a meeting recording into a transcript, summary and action items on your own computer with Whisper and a local model. Steps, models and the context-length catch.
track: use
order: 7
date: 2026-10-26
models: qwen3-14b, gemma-3-12b, qwen3-8b
---
**Transcribe the recording with Whisper, then give the transcript to a local model with a clear prompt.** Two steps, both on your machine. You get a summary, decisions and action items, and the recording never touches a meeting-bot service.

That's the main reason to do it locally. Meetings are full of things that shouldn't leave the room: salaries, client problems, plans that aren't public yet.

## Step 1: Transcribe with Whisper

Whisper is the standard open speech-to-text model. The simplest way to run it is the `openai-whisper` Python package, which also needs `ffmpeg` installed to read audio files. Then:

```sh
whisper meeting.m4a --model medium --output_format txt
```

That writes `meeting.txt` next to the recording. Bigger Whisper sizes are more accurate and slower; on a GPU even the larger ones run well faster than real time. For faster options, whisper.cpp and faster-whisper run the same models with less memory. See [local speech-to-text models](/learn/local-speech-to-text-models).

**Who said what?** Whisper on its own doesn't label speakers. Separate "diarization" tools add that, and some Whisper front ends bundle it. Without it, summaries still work well; you just won't get "Sam agreed to..." unless people say names out loud.

## Step 2: Summarize with a local model

A one-hour meeting is roughly 10,000 tokens of transcript or more. That's the catch: **Ollama's default context is shorter than that**, so without changing it the model only sees part of the meeting and summarizes that part confidently.

On Linux, start Ollama with a longer window:

```sh
OLLAMA_CONTEXT_LENGTH=32768 ollama serve
```

On Mac and Windows, set the context length in the Ollama app's settings. Long context needs memory; see [context length and the KV cache](/learn/context-length-and-kv-cache).

Then pass the transcript in with your prompt:

```sh
ollama run qwen3:14b "Summarize this meeting transcript. List decisions, then action items with owners, then open questions. Only use what is in the transcript. $(cat meeting.txt)"
```

Or paste it into [Open WebUI](/learn/open-webui-setup), which is easier to read and lets you ask follow-ups like "what did we say about the budget?"

## A prompt that works

Vague prompts get vague summaries. This structure gives consistent results:

1. **Summary:** three to five sentences on what the meeting was about.
2. **Decisions:** each one in a single line.
3. **Action items:** task, owner if named, deadline if mentioned.
4. **Open questions:** anything raised and not settled.
5. "If something isn't in the transcript, leave it out. Don't guess names or dates."

That last line matters. Small models fill gaps with plausible inventions, and an invented deadline in a summary is worse than none.

## Which model to use

| Memory | Pick | Notes |
|---|---|---|
| 8 GB | [Qwen3 8B](/model/qwen3-8b) | Fine for short meetings; check the action items |
| 12 GB | [Qwen3 14B](/model/qwen3-14b) | Noticeably more faithful to what was said |
| 12 GB, long meetings | [Gemma 3 12B](/model/gemma-3-12b) | 128K context handles multi-hour transcripts |

Here's a 12 GB RTX 4070 from our calculator:

{{lineup rtx-4070}}

Generation speed is only half the story here. The model first has to read the whole transcript, and that prompt-reading step is what you'll wait on with a long meeting. Newer RTX cards are much faster at it than older ones. See [prompt processing vs generation speed](/learn/prompt-processing-vs-generation-speed).

## Very long meetings

If a transcript is bigger than your context window, split it. Summarize each half hour on its own, then ask the model to combine the partial summaries into one. You lose a little, like connections between early and late parts, but it works on any card. To do this for a folder of recordings, script it; see [batch jobs with a local model](/learn/batch-jobs-with-a-local-model).

## Before you record

Recording laws differ by place, and some require everyone's consent. Tell people you're recording, even though it all stays on your machine.

## Where to go next

See what your card handles on [every GPU](/gpu), or use the same approach on documents with [chat with your documents](/learn/chat-with-your-documents-locally).
