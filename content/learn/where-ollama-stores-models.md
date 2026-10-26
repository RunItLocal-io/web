---
title: "Where Ollama stores models, and how to change the location"
description: The default Ollama model folder on Windows, Mac and Linux, how to move it to another drive with OLLAMA_MODELS, and how to bring your existing models along.
track: start
order: 11
date: 2026-10-26
models: qwen3-8b, gpt-oss-20b, llama-3-3-70b
---
Ollama keeps models in a folder called `.ollama/models` in your home directory, except on Linux, where the install script's service keeps them under `/usr/share/ollama`. To put them somewhere else, set the `OLLAMA_MODELS` environment variable to a new folder and restart Ollama.

## The default locations

| System | Folder |
|---|---|
| Windows | `C:\Users\<you>\.ollama\models` |
| macOS | `~/.ollama/models` |
| Linux, installed with the script | `/usr/share/ollama/.ollama/models` |
| Linux, running `ollama serve` yourself | `~/.ollama/models` |
| Docker | `/root/.ollama` inside the container, usually a named volume |

The folder starting with a dot is hidden by default. On a Mac, press Cmd+Shift+. in Finder to show it. On Windows, turn on hidden items in File Explorer's View menu.

## What's inside

Two folders:

- **`blobs`** holds the actual data: weights, templates and settings, each in a file named after its checksum, like `sha256-...`. The weights are one big file per model.
- **`manifests`** holds small files that say which blobs make up each model name and tag.

Don't rename or delete blobs by hand. Use `ollama rm` to remove a model and let Ollama clean up. See [how to update and delete models](/learn/how-to-update-and-delete-models).

## How much space you need

Plan for more than you think. A starter set of [Qwen3 8B](/model/qwen3-8b) and [gpt-oss 20B](/model/gpt-oss-20b) is about 19 GB. Add [Llama 3.3 70B](/model/llama-3-3-70b) and it's 62 GB. Every build on our [builds page](/builds) includes at least a 1 TB SSD for this reason.

Keep models on an SSD if you can. A model loads from disk into memory every time it starts, so on a slow hard drive a 20 GB model takes noticeably longer to load. Once loaded, the drive doesn't affect speed.

## Change the location on Windows

1. Quit Ollama from its tray icon.
2. From the Start menu, open **Edit environment variables for your account**.
3. Add a variable `OLLAMA_MODELS` set to your new folder, for example `D:\ollama\models`.
4. Start Ollama again.

More Windows setup in [run AI locally on Windows](/learn/run-ai-locally-on-windows).

## Change the location on a Mac

```sh
launchctl setenv OLLAMA_MODELS /Volumes/External/ollama-models
```

Quit Ollama from the menu bar and reopen it. This setting doesn't survive a restart, so you'll need to run it again after rebooting, or use a login script. If the folder is on an external drive, Ollama can't see your models while the drive is unplugged. See [run AI locally on a Mac](/learn/run-ai-locally-on-a-mac).

## Change the location on Linux

The install script runs Ollama as a systemd service under its own `ollama` user. Make the folder and give that user ownership:

```sh
sudo mkdir -p /data/ollama/models && sudo chown -R ollama:ollama /data/ollama
```

Then add the variable to the service:

```sh
sudo systemctl edit ollama.service
```

In the editor, add these two lines, save, and close:

```
[Service]
Environment="OLLAMA_MODELS=/data/ollama/models"
```

Restart the service:

```sh
sudo systemctl restart ollama
```

If Ollama fails to start afterwards, it's almost always permissions. Check with `journalctl -u ollama` and make sure the `ollama` user can reach every folder in the path. More in [run AI locally on Linux](/learn/run-ai-locally-on-linux).

## Bring your existing models along

Setting `OLLAMA_MODELS` points Ollama at an empty folder, so your models seem to vanish. They're still in the old place. To keep them, quit Ollama, then move the contents of the old `models` folder, both `blobs` and `manifests`, into the new one before you start Ollama again. Then `ollama list` should show everything.

If you'd rather start fresh, delete the old folder once the new one works and pull what you need.

## Recent desktop apps

Newer versions of the Windows and Mac apps also have a settings window. If yours has a model location option there, it does the same job as `OLLAMA_MODELS`.

## Where to go next

- **Running low on space?** See [how to update and delete models](/learn/how-to-update-and-delete-models).
- **All the commands:** the [Ollama cheat sheet](/learn/ollama-commands-cheat-sheet).
- **Which models are worth the disk space on your card?** Check [every GPU](/gpu).
