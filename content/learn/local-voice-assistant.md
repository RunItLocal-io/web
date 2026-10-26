---
title: "Build a local voice assistant: Whisper, a local LLM and text-to-speech"
description: How a private voice assistant works on your own hardware, which parts to use for speech, thinking and speaking, and how to make it answer fast.
track: use
order: 4
date: 2026-10-26
models: qwen3-4b, qwen3-8b, gpt-oss-20b
---
**A local voice assistant is three models in a row: speech-to-text, a language model, and text-to-speech.** Whisper turns your voice into text, a model like Qwen3 writes the reply, and a TTS engine reads it out. All three run on one ordinary PC, and nothing you say leaves it.

The hard part isn't getting it to work. It's getting it to answer quickly enough to feel like a conversation.

## The three parts

| Step | Job | Common choices |
|---|---|---|
| Listen | Speech to text | Whisper, via whisper.cpp or faster-whisper |
| Think | Write the reply | A small chat model in Ollama, like [Qwen3 8B](/model/qwen3-8b) |
| Speak | Text to speech | A local TTS engine, such as Piper |

Many setups add a fourth piece in front: a **wake word** detector that listens for a phrase and only then starts recording. It runs on the CPU and uses almost nothing.

## Where the delay comes from

Every pause adds up. You stop talking, the system waits to be sure you've finished, Whisper transcribes, the model thinks, and the TTS speaks. The tricks that matter:

- **Use a smaller Whisper.** The bigger sizes are more accurate but slower. For short commands in a quiet room, a small or medium size is usually enough. See [local speech-to-text models](/learn/local-speech-to-text-models).
- **Stream the reply into the voice.** Don't wait for the full answer. Send each sentence to the TTS as soon as it's written, so it starts speaking while the model keeps going.
- **Turn off thinking.** Reasoning before answering can add seconds of silence. With Qwen3, put `/no_think` in the system prompt.
- **Keep answers short.** A system prompt like "Reply in one or two spoken sentences. No lists, no markdown." helps more than any hardware upgrade.
- **Keep the model loaded.** The first request after a model unloads is slow. Ollama unloads idle models after a few minutes by default; you can keep them in memory longer with its keep-alive setting.

## Which model to use

For voice, speed beats smarts. Spoken answers are short, and a fast small model feels far better than a clever slow one.

- **[Qwen3 4B](/model/qwen3-4b):** the fastest option worth using, and fine for timers, facts and quick questions.
- **[Qwen3 8B](/model/qwen3-8b):** the best balance for most people.
- **[gpt-oss 20B](/model/gpt-oss-20b):** if you have 16 GB and want better answers. It's a mixture-of-experts model, so it's quicker than its size suggests.

Here's an 8 GB RTX 4060 from our calculator:

{{lineup rtx-4060}}

At about 60 tok/s for Qwen3 4B and 29 tok/s for Qwen3 8B, a two-sentence reply is written in a second or two. Both are faster than anyone speaks.

## Fitting it all in memory

All three parts want space on the same card. Plan for the language model first, then leave a few GB for Whisper and the TTS. On an 8 GB card that means Qwen3 4B or 8B, not bigger. If you're short, run Whisper and the TTS on the CPU; whisper.cpp is fast on modern processors for short clips, and most local TTS engines are light.

On a Mac, everything shares one pool of memory, so a 16 GB machine runs the whole stack comfortably with an 8B model. See [Macs for local LLMs](/learn/mac-for-local-llms).

## Ways to put it together

**The easy way: Open WebUI.** It has a voice mode where you talk and it talks back, using speech recognition and TTS you can set to run locally. It's the fastest way to try a voice chat with your own model. See [our setup guide](/learn/open-webui-setup).

**For the house: Home Assistant.** Its voice pipeline can use local Whisper and Piper, and connect to Ollama for the conversation. That gets you a voice assistant that can also turn off the lights. See [local AI for Home Assistant](/learn/local-ai-for-home-assistant).

**Build your own.** A short Python script can record from the microphone, call Whisper, send the text to Ollama's API at `http://localhost:11434`, and pipe the reply to a TTS engine. It's a good weekend project, and you control every step.

## Where it falls short

- **Noisy rooms and far-field microphones** hurt accuracy more than model choice. A decent USB microphone or speakerphone helps a lot.
- **Interrupting** it mid-sentence is hard to do well at home. Most DIY setups make you wait.
- **Voices** from local TTS are clear but less natural than the best cloud voices. See [local text-to-speech models](/learn/local-text-to-speech-models).

Not sure your machine can run all three? See what it handles on the [homepage](/) or browse [every GPU](/gpu).
