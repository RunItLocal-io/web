---
title: "Use your local AI from anywhere: Tailscale or Cloudflare Tunnel"
description: Reach Ollama or Open WebUI on your home GPU from your phone or laptop anywhere, without opening router ports. Tailscale vs Cloudflare Tunnel, set up.
track: serve
order: 13
date: 2026-10-26
models: qwen3-14b, qwen3-30b-a3b
---
**Use Tailscale if it's just you and people you can install an app for. Use a Cloudflare Tunnel with Cloudflare Access if you want a normal web address that anyone with a login can open.** Both let you reach your home AI server from anywhere without opening a port on your router, which is the one thing you shouldn't do. Ollama has no passwords; see [securing your local AI server](/learn/secure-your-local-ai-server).

## The two options

| | Tailscale | Cloudflare Tunnel |
|---|---|---|
| How it works | A private network between your own devices | Your server connects out to Cloudflare, which serves a public address |
| Who can reach it | Only devices signed into your network | Anyone, unless you add Cloudflare Access |
| What you need | The app on every device | A domain on Cloudflare |
| Good for | You, family, a small team | Sharing a web page like Open WebUI |
| Can expose the raw API | Yes, safely | Possible, but don't |

## Option 1: Tailscale

Install Tailscale on the AI server and on each phone or laptop, and sign into the same account on all of them. On a Linux server:

```sh
curl -fsSL https://tailscale.com/install.sh | sh
```

```sh
sudo tailscale up
```

Every device gets a private address starting with 100, and with MagicDNS turned on (the default for new networks) a name too. Find the server's address with:

```sh
tailscale ip -4
```

Now, from your phone anywhere in the world:

- Open WebUI at `http://100.x.y.z:3000` or `http://your-server-name:3000`.
- The Ollama API at `http://100.x.y.z:11434`, for apps and coding tools.

For Ollama to answer on the Tailscale address, it has to listen beyond localhost. Set `OLLAMA_HOST=0.0.0.0:11434` as described in [Ollama on your network](/learn/ollama-on-your-network). Your home firewall still blocks the internet; Tailscale traffic arrives over its own encrypted connection.

Tailscale also has a `tailscale serve` command that puts a local service on an HTTPS address inside your network. Its options have changed between versions, so check `tailscale serve --help` on yours.

## Option 2: Cloudflare Tunnel

The `cloudflared` program runs on your server and keeps a connection open to Cloudflare. Visitors go to a web address on your domain; Cloudflare passes them down the tunnel. No ports open at home.

For a quick test, this gives you a temporary random address:

```sh
cloudflared tunnel --url http://localhost:3000
```

**Be careful: that address is public.** Anyone who gets the link reaches your Open WebUI login page. Fine for five minutes of testing, not for daily use.

For a permanent setup:

1. Add your domain to Cloudflare.
2. In the Cloudflare Zero Trust dashboard, create a tunnel. It gives you a command with a token to run on your server, or a Docker container to run.
3. Add a public hostname, like `ai.example.com`, pointing at `http://localhost:3000`.
4. Add a Cloudflare Access application for that hostname, with a policy listing the email addresses allowed in.

With step 4 done, visitors must log in through Cloudflare before they ever reach your server. Open WebUI's own login then works as a second lock.

**Tunnel the chat app, not Ollama.** Point the tunnel at [Open WebUI](/learn/open-webui-setup) on port 3000, not at port 11434. A public hostname straight to Ollama is an open, password-free API with extra steps.

## Which one we'd pick

- **Just you:** Tailscale. Ten minutes, nothing public, and coding tools on your laptop can use the API directly.
- **Family who won't install apps:** Cloudflare Tunnel with Access, in front of Open WebUI.
- **A team:** either works. Tailscale if everyone uses the API from tools; Cloudflare if most people only want a chat page. See [serving a team on used GPUs](/learn/serve-a-team-on-used-gpus).

## Is it fast enough remotely?

Yes. Text is tiny; even a weak phone connection carries a model's output easily. The speed you feel is your GPU's speed. For a 24 GB RTX 3090 serving at home, our calculator estimates:

{{lineup rtx-3090}}

A model like [Qwen3 30B-A3B](/model/qwen3-30b-a3b) on that card is far faster than anyone reads, and it's just as fast from a café as from your desk.

## Checklist

- No port forwarding on your router.
- Ollama listening only on localhost or your private network.
- Cloudflare Access in front of any public hostname.
- Logins turned on in Open WebUI, with sign-ups needing approval.
