---
title: "Local speech to text: Whisper model sizes and how to choose"
description: Run Whisper on your own computer to transcribe audio privately. The model sizes, the speed and accuracy trade-off, and which tools to use.
track: models
order: 25
date: 2026-10-26
models: qwen3-8b, qwen3-14b
---
**For local transcription, use Whisper.** It's OpenAI's open speech recognition model, it runs on a laptop, and it handles accents, background noise and dozens of languages well. Start with the **small** size, move up if it makes mistakes, and use the large or turbo models if you have a GPU.

## The sizes

Whisper comes in a ladder of sizes. Bigger is more accurate and slower.

| Size | Accuracy | Speed | Good for |
|---|---|---|---|
| tiny | Rough | Fastest | Voice commands, quick tests, very old hardware |
| base | Fair | Very fast | Clear speech, live captions on a CPU |
| small | Good | Fast | The best starting point on a laptop |
| medium | Very good | Moderate | Accents, noisy recordings, on a GPU |
| large | Best | Slowest | Hard audio, many languages, when accuracy matters most |
| turbo | Close to large | Much faster than large | The usual pick if you have a GPU |

The tiny to medium sizes also come in English-only versions, named with `.en`. For English audio they're a little more accurate at the same size, especially the smaller ones.

We don't publish speed numbers for Whisper because we haven't measured it on our rack. As a rough guide: even the small sizes transcribe faster than real time on most modern computers, and on a decent GPU the large models do too.

## What decides the speed

Unlike text generation, which is limited by memory bandwidth (see [why bandwidth sets speed](/learn/memory-bandwidth-and-llm-speed)), transcription leans more on raw compute. So:

- **A recent NVIDIA card** makes the big models practical.
- **Macs** run it well, especially with tools built for Apple silicon.
- **CPU only** is fine for tiny to small, slow for large.
- **Old data-center cards** like the Tesla P100 lack tensor cores and are slower at this than their text speed suggests.

Memory grows with size too. The small models need little; the large one in the reference version needs much more, while leaner tools like faster-whisper and whisper.cpp get by with less. Check your tool's docs before planning to run it next to a chat model on a small card.

## The tools

**OpenAI's whisper package** is the reference version. It needs Python and `ffmpeg`.

```sh
pip install -U openai-whisper
```

Then transcribe a file:

```sh
whisper meeting.mp3 --model small
```

It writes the transcript as text and subtitle files next to the audio.

**whisper.cpp** is a C++ port from the llama.cpp family. It's light, runs well on CPUs and Macs, and suits being built into other apps.

**faster-whisper** is a reimplementation that's noticeably quicker and uses less memory than the original, which makes it popular in self-hosted transcription apps.

Many apps wrap one of these with a friendly interface. Open WebUI, for example, can transcribe what you say into the chat box; see [Open WebUI setup](/learn/open-webui-setup).

## Tips for better transcripts

- **Pick the language** if you know it, rather than letting Whisper guess from the first few seconds.
- **Clean audio beats a bigger model.** A decent microphone close to the speaker helps more than going from medium to large.
- **Watch for made-up text in silence.** Whisper can invent words during long pauses or music. Trimming silence first helps.
- **Whisper doesn't know who's speaking.** Telling speakers apart (diarization) needs a separate tool.

## Turning transcripts into something useful

A transcript is a wall of text. Hand it to a local chat model for summaries, action items or answers. A one-hour meeting is often well over 10,000 tokens, so give the chat model enough context; see [increase Ollama context length](/learn/increase-ollama-context-length). [Qwen3 8B](/model/qwen3-8b) handles summaries well on 8 GB; [Qwen3 14B](/model/qwen3-14b) is noticeably better on 12 GB. On a 12 GB card, transcribe first and summarize second, so Whisper and the chat model don't compete for memory. Here's what a 12 GB RTX 3060 runs for the summary step:

{{lineup rtx-3060 12}}

The full workflow is in [summarize meetings locally](/learn/summarize-meetings-locally). To talk back and forth with a model, add speech output too: see [local text to speech models](/learn/local-text-to-speech-models) and [local voice assistant](/learn/local-voice-assistant).
