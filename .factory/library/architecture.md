# Architecture

How the t3ingo system works — components, relationships, data flows, invariants.

## Overview

t3ingo is a single-page web app built with TanStack Start (React SSR). There is no database, no API, no authentication. The entire game state lives in the URL and sessionStorage.

## Core Data Flow

```
User visits / → Landing page (SSR) → Clicks "Play" → /game?seed=abc123
                                                     ↓
                                              Seed → hash → PRNG → shuffle pool → 25 items
                                                     ↓
                                              5x5 grid rendered (SSR)
                                                     ↓
                                              User marks squares → sessionStorage
                                                     ↓
                                              Bingo detection on every mark change
                                                     ↓
                                              Celebration if any line complete
```

## Components

### Routes
- `src/routes/__root.tsx` — Root layout (HTML shell, global styles, meta)
- `src/routes/index.tsx` — Landing page (`/`)
- `src/routes/game.tsx` — Game page (`/game?seed=...`)

### Game Logic (`src/lib/`)
- `bingo.ts` — Seeded PRNG, board generation, bingo detection algorithms
- `items.ts` — Curated pool of 45 bingo items (flat array of strings)
- `seed.ts` — Shared seed generation utility (`generateRandomSeed`, `generateDifferentSeed`)
- `marks.ts` — Mark state management (load/save/toggle marks in sessionStorage, keyed by seed)

### UI Components (`src/components/`)
- `Board.tsx` — 5x5 grid container
- `Square.tsx` — Individual cell (clickable, toggleable)
- `Celebration.tsx` — Celebration effect (confetti/banner)

## Testing Setup

- **Vitest** is the test runner (`bun run test`)
- **Default environment:** Node (set in `vitest.config.ts`)
- **React component tests:** Use `// @vitest-environment jsdom` docblock to switch to jsdom per-file
- **Test setup:** `vitest.setup.ts` imports `@testing-library/jest-dom/vitest` for DOM matchers (`toBeInTheDocument()`, `toHaveTextContent()`, etc.)
- **Test co-location:** Test files live next to source (e.g., `src/lib/bingo.test.ts`, `src/components/Celebration.test.tsx`)

## CSS Design System

The project uses CSS custom properties for theming, defined in `src/styles.css`:
- `--lagoon` / `--lagoon-deep` — Primary teal/aqua colors
- `--sea-ink` / `--sea-ink-soft` — Dark background tones
- `--surface` — Card/cell background
- `--line` — Border/outline color

Tailwind v4 patterns used:
- `bg-[var(--lagoon)]/20` — CSS variable with Tailwind opacity modifier
- `border-[var(--lagoon-deep)]` — CSS variable for borders
- `text-[var(--sea-ink)]` — CSS variable for text colors

## Key Invariants

1. **Deterministic boards**: Same seed ALWAYS produces the same 25 items in the same positions
2. **Center square**: Position (2,2) in 0-indexed grid is ALWAYS "Gets nerdsniped"
3. **No free space**: All 25 squares are regular markable squares
4. **Seed in URL**: The seed is the only game state in the URL. Mark state is NOT in the URL.
5. **Per-tab marks**: Mark state stored in sessionStorage (per-tab), keyed by seed
6. **No external deps**: Zero API calls, zero database queries after initial page load

## Board Generation Algorithm

1. Hash the seed string to a 32-bit integer (e.g., using a string hash function)
2. Use the hash as the seed for a deterministic PRNG (e.g., mulberry32)
3. Take the 45-item pool, remove "Gets nerdsniped" (it's fixed at center)
4. Shuffle the remaining 44 items using the PRNG
5. Take the first 24 items, insert "Gets nerdsniped" at position 12 (center)
6. Result: 25-item array representing the 5x5 grid (row-major order)

## Bingo Detection

Check 12 possible lines after every mark/unmark action:
- 5 rows: indices [0-4], [5-9], [10-14], [15-19], [20-24]
- 5 columns: indices [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24]
- 2 diagonals: [0,6,12,18,24], [4,8,12,16,20]

A line is complete when all 5 squares in that line are marked.

## State Management

| State | Storage | Scope | Survives Refresh | Survives Session Close |
|-------|---------|-------|------------------|----------------------|
| Seed | URL search param | Shareable | Yes (URL persists) | Yes (bookmark) |
| Marked squares | sessionStorage keyed by seed | Per tab | Yes | No |
| Bingo status | Derived from marks + board | Ephemeral | Yes (via marks) | No |
| Celebration | Derived from bingo status | Ephemeral | Yes (via marks) | No |

## Deployment

- **Target:** Vercel (hobby/free tier)
- **Build:** TanStack Start via Nitro adapter → Vercel serverless functions
- **SSR:** Landing page and game page both server-rendered for SEO
- **Static assets:** Tailwind CSS, JS bundles via Vite
