---
title: "Local AI for small business: a private assistant for your team"
description: What a small business can do with AI running on its own hardware, what it costs, which build to buy, and how to share one machine with the whole team.
track: use
order: 10
date: 2026-10-26
models: qwen3-14b, gpt-oss-20b, qwen3-30b-a3b, llama-3-3-70b
---
**One used PC with a 24 GB graphics card, running Ollama and Open WebUI, gives a small team a private ChatGPT-style assistant for about $900 to $1,200 in hardware.** No per-seat subscription, and client files, contracts and financials stay in your office.

It won't match the best cloud models on the hardest questions. For the everyday work most small businesses use AI for, it's more than good enough.

## What it's good for

- **Drafting:** emails, proposals, job ads, product descriptions, social posts.
- **Documents:** asking questions about contracts, policies and manuals. See [chat with your documents](/learn/chat-with-your-documents-locally).
- **Summaries:** long email threads, meeting recordings, reports. See [summarize meetings locally](/learn/summarize-meetings-locally).
- **Back-office scripts:** tagging invoices, pulling data out of forms, sorting support emails. See [batch jobs with a local model](/learn/batch-jobs-with-a-local-model).
- **Internal Q&A:** "what's our refund policy?" answered from your own handbook.

## Why local makes sense for a business

**Privacy you can explain.** Client data never leaves your premises. If a customer asks where their information goes, the answer is simple. Check your own legal and industry obligations; running locally helps, but it doesn't replace them.

**Flat cost.** You pay for the hardware once, then electricity. Heavy users don't cost more than light ones.

**No surprises.** The model doesn't change under you, prices don't change, and it works if the internet goes down.

## What to buy

These are from our [builds page](/builds), with October 2026 used-market prices:

| Team size | Build | Price | Memory | Runs well |
|---|---|---|---|---|
| 1 to 3 people | Used desktop + RTX 3060 12 GB | $300 to $400 | 12 GB | [Qwen3 14B](/model/qwen3-14b) |
| Up to about 10 | Used desktop + RTX 3090 24 GB | $900 to $1,200 | 24 GB | [Qwen3 30B-A3B](/model/qwen3-30b-a3b), [gpt-oss 20B](/model/gpt-oss-20b) |
| A busier office | Workstation + 2× RTX 3090 | $1,900 to $2,500 | 48 GB | [Llama 3.3 70B](/model/llama-3-3-70b) |

The single 3090 is the one we'd start most businesses on. Here it is from our calculator:

{{lineup rtx-3090}}

Qwen3 30B-A3B at about 164 tok/s is fast enough that several people asking at once barely notice each other. With two 3090s, Llama 3.3 70B fits, but at about 12 tok/s by our estimate; it's smarter, and noticeably slower.

If noise matters, a used Mac Studio with 64 GB is silent and draws about 100 W, at $1,500 to $2,100. It's slower than a 3090 on the same model. See [Macs for local LLMs](/learn/mac-for-local-llms).

## Sharing it with the team

1. **Install Ollama** on the machine and pull your model.
2. **Run Open WebUI** on the same machine. It gives everyone a familiar chat window, with separate logins and chat history. See [our Open WebUI setup](/learn/open-webui-setup).
3. **Staff open it in a browser** at the machine's address on your office network.
4. **Add a Knowledge collection** with your handbook, price lists and templates, so answers come from your own documents.

Keep it on the office network. For remote staff, use a private network like Tailscale rather than opening a port to the internet; see [remote access with Tailscale or Cloudflare](/learn/remote-access-with-tailscale-or-cloudflare) and [secure your local AI server](/learn/secure-your-local-ai-server).

## How many people can one machine serve?

It depends on how many ask at the same moment, not how many have accounts. Most people send a message, then spend a minute reading. A dozen staff rarely means a dozen requests at once.

On our own rack, two RTX A4500s ran Qwen3.6-35B-A3B at **110 tok/s**, and power for the whole rack came to about **6 to 8 cents per million tokens**. A small office uses a tiny fraction of that. When you outgrow one box, see [serve a team on used GPUs](/learn/serve-a-team-on-used-gpus).

## Things to set up early

- **A shared system prompt** with your company name, tone and "say you don't know rather than guess".
- **Backups** of the Open WebUI data folder, so chat history and documents survive a failed disk.
- **A rule for staff:** the AI drafts, a person checks. Especially for prices, legal wording and anything sent to customers.

## Where to go next

See what other cards can do on [every GPU](/gpu), or read [is local AI worth it](/learn/is-local-ai-worth-it) for the full cost comparison with cloud plans.
