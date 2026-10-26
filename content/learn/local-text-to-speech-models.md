---
title: "Local text to speech: natural voices without the cloud"
description: How local text to speech works, the kinds of models and tools available, what hardware they need, and how to pair one with a local chat model.
track: models
order: 26
date: 2026-10-26
models: qwen3-4b, qwen3-8b
---
**Local text to speech is good now, and it needs far less hardware than a chat model.** Small, fast voice engines run on a CPU or even a Raspberry Pi-class device. Larger neural voice models sound more natural and can clone a voice, but want a GPU. Pick by what you need: instant replies, or the most human-sounding voice.

## Three kinds of local voice

| Kind | Sounds | Speed | Hardware |
|---|---|---|---|
| Built into your OS | Clear, a bit robotic | Instant | Anything |
| Small neural models | Natural, steady | Faster than real time on a CPU | Any modern computer |
| Large neural models | Most natural, expressive, can clone voices | Slower, better on a GPU | A graphics card helps a lot |

**Built-in voices.** Your computer already has one. On a Mac, try it in Terminal:

```sh
say "Your model has finished downloading."
```

Windows and most Linux desktops have their own system voices too. They're fine for alerts and accessibility, less so for listening to long text.

**Small neural models** are the sweet spot for most projects. **Piper** is a popular example: it's fast, runs well on a CPU, has many voices and languages, and is widely used in Home Assistant setups. **Kokoro** is another small open model that's known for sounding natural for its size.

**Large neural models** sound closest to a real person and can often copy a voice from a short sample. Coqui TTS, an open-source toolkit, is one long-running project in this space. These need more memory, are slower, and their licenses vary a lot.

## What to look for

- **Latency.** For a voice assistant, how quickly speech starts matters more than total speed. Tools that can stream audio as they generate feel much faster.
- **Voices and languages.** Check there's a voice you like in your language before you build around a tool.
- **License.** Voice models and the voices themselves can have separate licenses, and some are non-commercial. See [open model licenses explained](/learn/open-model-licenses-explained).
- **Integration.** Does it work with what you use? Open WebUI, for example, can read replies aloud and lets you pick the speech engine in its settings. See [Open WebUI setup](/learn/open-webui-setup).

## Hardware

Text to speech is light. A small neural voice uses a fraction of the memory a chat model does, so on most machines the chat model is what decides your hardware, not the voice.

Like speech recognition, voice generation leans on compute rather than memory bandwidth. A modern NVIDIA card or an Apple silicon Mac speeds up the large models. Old data-center cards without tensor cores, like the Tesla P100 in our rack, are better spent on text generation.

## Voice cloning: be careful

Cloning a voice from a short sample is now easy with local tools. Only clone your own voice or one you have clear permission to use. Many tools and model licenses say so directly, and in many places using someone's voice without consent carries legal risk.

## Building a talking assistant

A voice assistant is three models in a row:

1. **Speech to text** turns what you say into text. Usually Whisper; see [local speech to text models](/learn/local-speech-to-text-models).
2. **A chat model** writes the reply.
3. **Text to speech** reads it out.

For it to feel conversational, the chat model has to be quick. Small models are the usual choice: [Qwen3 4B](/model/qwen3-4b) or [Qwen3 8B](/model/qwen3-8b), with thinking mode off so it answers straight away. Keep replies short with a system prompt like "Answer in one or two spoken sentences." Here's what an 8 GB RTX 4060 runs, from our calculator:

{{lineup rtx-4060}}

Qwen3 8B at the estimated speed there is plenty: the voice can start reading the first sentence while the model writes the rest.

The full build, including wake words and hardware, is in [local voice assistant](/learn/local-voice-assistant). For smart-home use, see [local AI for Home Assistant](/learn/local-ai-for-home-assistant).

## Where to start

1. Try your OS's built-in voice to see if it's good enough.
2. If not, try a small neural voice like Piper on your CPU.
3. Only move to a large model if you need a specific voice or more expression, and have a GPU free.

Not sure what your machine can run alongside it? Check [every GPU](/gpu).
