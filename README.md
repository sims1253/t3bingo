# t3bingo 🎱

> Theo's Twitch Stream Bingo — mark the moments as they happen live.

![t3bingo screenshot](public/screenshot.png)

## What is this?

A **5×5 bingo game** for [Theo's](https://www.twitch.tv/theo) Twitch livestreams. Visitors get a randomly generated board filled with funny recurring Theo moments, mark squares as they happen, and share their board with friends via URL.

**No database. No API. Just vibes and deterministic seeds.**

## How it works

- Boards are **deterministically generated from a seed** in the URL (`/game?seed=abc123`)
- Same seed → same board, so boards are **instantly shareable**
- Mark state lives in `sessionStorage` (per-tab, survives refresh)
- **Bingo** is detected on any complete row, column, or diagonal
- 🎉 Confetti celebration on bingo (respects `prefers-reduced-motion`)
- Center square is always "Gets nerdsniped" (not a free space — you still gotta earn it)
- Share button copies the board URL to your clipboard
- Fully responsive, keyboard accessible, with proper ARIA attributes
- SSR for SEO and instant first paint

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) v1 (React SSR) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) |
| Runtime | [Bun](https://bun.sh) |
| Bundler | Vite |
| Testing | Vitest + Testing Library |
| Deploy | Vercel (hobby/free tier) via Nitro adapter |

## Getting Started

```bash
bun install
bun run dev     # → http://localhost:3000
```

## Scripts

```bash
bun run dev          # Start dev server on port 3000
bun run build        # Production build
bun run test         # Run 201 tests with vitest
bun run typecheck    # tsc --noEmit
bun run lint         # tsc --noEmit
```

## Deployment

Push to GitHub — Vercel auto-deploys via the Nitro adapter. No extra config needed.

## License

MIT
