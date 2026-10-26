# runitlocal.io

Website for Run It Local. Next.js (App Router), TypeScript, plain CSS.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build; both pages prerender as static
npm run lint
```

## Layout

- `src/app/page.tsx`: homepage (build finder, add your rig, live demo, learn, lab notes, about)
- `src/app/people/page.tsx`: people page; edit the `PEOPLE` list to add someone, and put photos in `public/people/`
- `src/app/globals.css`: color tokens (light and dark) and shared styles; `home.css` and `people/people.css` hold page styles
- `src/lib/builds.ts`: reference builds, models and prices for the finder
- `src/lib/bench.ts`: the benchmark prompt and the validator for submitted JSON
- `src/components/`: the interactive pieces (client components)
- `design/`: the original single-file HTML designs, kept for reference

## Not wired up yet

- **Rig submissions and email signup** validate in the browser but don't save anything; they need a backend.
- **Live chat demo** posts to `/api/chat` (or `NEXT_PUBLIC_RIL_API_BASE` + `/chat`) and expects `{ reply, receipt? }`. No route exists yet, so it shows the "connects at launch" message.
- The leaderboard and full-bench links still point to the Claude artifacts. Social links on the People page are placeholders (`#`).
