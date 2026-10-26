---
title: "Local AI for families and kids: private, but not automatically safe"
description: What running AI at home means for a family. The real privacy benefits, the safety filters you lose, which models to use, and how to set it up for children.
track: use
order: 11
date: 2026-10-26
models: qwen3-8b, gemma-3-12b, qwen3-4b
---
**Running AI at home keeps your family's questions private, with no accounts, no ads and no training on your kids' chats. But a local model has no company moderating it, so it is not automatically safe for children.** You become the moderator. With a bit of setup, that's very manageable.

## What you gain

- **Privacy.** Homework questions, health worries and family photos stay on your computer. Nothing is logged by a company.
- **No accounts for children.** Many cloud AI services have minimum ages. A local model needs no sign-up.
- **No ads, no upsells, no surprise changes.** The model you install stays the same until you change it.
- **It works offline.** Useful on trips and in places with bad internet.

## What you lose

Cloud chatbots have extra safety systems around the model: filters on what goes in and out, and staff watching for abuse. A local model has only what was trained into it.

- **Mainstream models from Google, Alibaba and OpenAI are trained to refuse clearly harmful requests**, and they're polite by default. That covers most of what parents worry about.
- **They can still get things wrong**, confidently. A wrong date in a history essay is the most common real problem.
- **Some downloadable models have had their refusals removed on purpose.** Stick to the official models below. See [what "uncensored" models are](/learn/best-uncensored-local-model) so you can recognise them.

## The setup we'd use at home

1. **Install Ollama** on the family computer and pull one or two official models. See [how to run AI locally](/learn/how-to-run-ai-locally).
2. **Install Open WebUI** for a friendly chat window. See [our setup guide](/learn/open-webui-setup).
3. **Make yourself the admin.** The first account created is the admin. Create separate accounts for the children; the admin decides who can sign up and which models are available to other users.
4. **Set a system prompt** for the kids' model. For example: "You are a patient tutor for a 10-year-old. Explain step by step. Don't just give homework answers; ask questions that help them work it out. Keep language suitable for children. If asked about something unsafe, suggest talking to a parent."
5. **Keep it in a shared room,** like any family computer.

Open WebUI keeps each user's chat history, so you can look over what's being asked. Tell your kids you can. It's a conversation starter, not spying.

## Which model to use

| Memory | Pick | Good for |
|---|---|---|
| Laptop, 8 to 16 GB | [Qwen3 4B](/model/qwen3-4b) | Quick questions, spelling, simple explanations |
| 8 GB GPU | [Qwen3 8B](/model/qwen3-8b) | Homework help, stories, explaining ideas |
| 12 GB and up | [Gemma 3 12B](/model/gemma-3-12b) | Reading photos of worksheets, many languages |

Gemma 3 can look at images, which is handy for "what's wrong with my working on this maths question?" from a phone photo. It's also strong in many languages, good for families who speak more than one at home.

Here's an 8 GB RTX 4060, a common card in family PCs, from our calculator:

{{lineup rtx-4060}}

Qwen3 8B at about 29 tok/s writes faster than a child reads. Gemma 3 12B doesn't fit on 8 GB; it needs a 12 GB card.

## Good uses for kids

- **A tutor that asks questions back,** instead of handing over answers.
- **Story time.** "Write a bedtime story about a fox who's scared of the dark, with my daughter as the hero."
- **Practising a language** in conversation.
- **Explaining the news** or a hard topic at their level.
- **Image making** for fun. The [Studio](/studio) generates pictures on your own GPU right in the browser; see the [image generation guide](/learn/local-image-generation-guide).

## Teach them it can be wrong

The most useful thing a child can learn about AI is that it sounds sure even when it's wrong. Try it together: ask about something they know well, like their favourite game or animal, and spot the mistakes. Then make "check it in a book or ask a person" the house rule for anything that matters.

## Where to go next

Not sure your family computer is up to it? Check it on the [homepage](/) or browse [every GPU](/gpu). For the privacy details, see [what stays on your machine](/learn/local-ai-privacy-what-stays-on-your-machine).
