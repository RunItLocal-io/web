# runitlocal.io

Website for Run It Local. Next.js (App Router), TypeScript, plain CSS, pnpm. Pushing to `main` deploys (see `deploy/follow.sh`).

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3737
pnpm build      # production build; every page prerenders as static
pnpm lint
```

## Layout

- `src/app/page.tsx`: homepage. Detects the visitor's GPU, says what it can run and how fast, and offers to run a model in the tab
- `src/app/{builds,learn,notes,leaderboard,try,people}/`: subpages
- `src/lib/gpus.ts`: GPU table (VRAM, bandwidth) and matching against the browser's renderer string
- `src/lib/detect.ts`: browser-side detection (WebGL renderer string, WebGPU adapter, phone check). Nothing is sent anywhere
- `src/lib/estimate.ts`: Ollama model list and the speed estimate (bandwidth ÷ active weights × efficiency)
- `src/components/RunInBrowser.tsx`: WebLLM demo; Llama 3.2 1B/3B from Hugging Face, cached by the browser after the first load
- `src/lib/builds.ts`, `src/lib/bench.ts`: reference builds, the benchmark prompt and its validator
- `src/components/DieField.tsx`: the animated cell field behind the hero; call `pulse()` to send a ripple through it
- `src/app/globals.css` (tokens, shared), `sections.css` (subpage sections), `home.css`, `people/people.css`
- `design/`: the original single-file HTML designs, kept for reference

## Not wired up yet

- **Rig submissions and email signup** validate in the browser but don't save anything; they need a backend.
- The leaderboard and full-bench links still point to the Claude artifacts. Social links on the People page are placeholders (`#`).
