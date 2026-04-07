# TanStack Start Research

> **Research date**: April 7, 2026
> **Sources**: Official docs (tanstack.com/start), GitHub (TanStack/router), npm, blog posts, community

---

## 1. Current Status

- **Stage**: **v1.0 Release Candidate (RC)** as of September 2025. Reported as having **shipped v1.0 in March 2026** per byteiota.com.
- **npm package**: `@tanstack/start` — latest version `1.120.20` (on the TanStack Router monorepo, versioned alongside router)
- **Stability**: API considered stable and feature-complete. The RC notice states: *"TanStack Start is currently in the Release Candidate stage! This means it is considered feature-complete and its API is considered stable."*
- **GitHub repo**: Lives inside [github.com/TanStack/router](https://github.com/TanStack/router) (monorepo with router + start)
- **Docs badge**: Still shows "RC" on the site as of April 2026, but the framework is considered production-ready.

**Verdict for t3ingo**: Safe to use. API is stable, feature-complete, and the ecosystem (examples, deployment guides, add-ons) is mature.

---

## 2. Project Setup & Scaffolding

### CLI (Recommended)

```bash
npx @tanstack/cli@latest create my-app
```

Interactive prompts guide you through:
- **Framework**: React or Solid
- **Template**: Basic, Basic+Auth, Counter, etc.
- **Package manager**: npm, pnpm, yarn, bun
- **Add-ons**: Tailwind, ESLint, auth, databases, deployment targets, monitoring
- **Toolchain options**

### Non-Interactive Mode

```bash
npx @tanstack/cli create my-app --framework react --template basic --toolchain npm --deployment node-server
```

### Clone an Example

```bash
npx gitpick TanStack/router/tree/main/examples/react/start-basic start-basic
cd start-basic
npm install
npm run dev
```

### Available Examples
- `start-basic` — Minimal starter
- `start-basic-auth` — Auth integration
- `start-basic-cloudflare` — Cloudflare Workers deployment
- `start-basic-react-query` — With TanStack Query
- `start-clerk-basic` — Clerk auth
- `start-convex-trellaux` — Convex + full app example
- `start-supabase-basic` — Supabase integration
- `start-trellaux` — Trello-like full-stack app
- `start-workos` — WorkOS auth
- `start-material-ui` — Material UI integration
- `start-bun` — Bun runtime deployment

### Core Project Structure

```
my-app/
├── app/
│   ├── routes/          # File-based route definitions
│   │   ├── __root.tsx   # Root layout
│   │   ├── index.tsx    # Home page (/)
│   │   └── about.tsx    # About page (/about)
│   ├── routeTree.gen.ts # Auto-generated route tree
│   ├── router.tsx       # Router configuration
│   ├── client.tsx       # Client entry point
│   └── ssr.tsx          # SSR entry point
├── vite.config.ts
├── package.json
└── tsconfig.json
```

---

## 3. Routing (File-Based)

TanStack Start uses **TanStack Router** with file-based routing. Routes are defined in `app/routes/`.

### Route File Naming Convention

| File Path | Route | Notes |
|---|---|---|
| `__root.tsx` | — | Root layout (wraps everything) |
| `index.tsx` | `/` | Home page |
| `about.tsx` | `/about` | Static route |
| `posts.tsx` | `/posts` | Posts layout |
| `posts/$postId.tsx` | `/posts/:postId` | Dynamic param |
| `posts_/$postId.edit.tsx` | `/posts/:postId/edit` | Nested path (pathless layout + nested) |
| `_layout.tsx` | — | Pathless layout group |
| `_layout/foo.tsx` | `/foo` | Under pathless layout |

### Key Routing Patterns

```tsx
// app/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return <div>Welcome Home!</div>
}
```

### Route with Loader (Data Fetching)

```tsx
// app/routes/bingo/$seed.tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

// Server function for data fetching
const getBoard = createServerFn({ method: 'GET' })
  .validator((seed: string) => seed)
  .handler(async ({ data: seed }) => {
    // Generate bingo board from seed on the server
    return generateBoard(seed)
  })

export const Route = createFileRoute('/bingo/$seed')({
  loader: async ({ params }) => {
    const board = await getBoard({ data: params.seed })
    return { board }
  },
  component: BingoBoardPage,
})

function BingoBoardPage() {
  const { board } = Route.useLoaderData()
  return <Board data={board} />
}
```

### Navigation

```tsx
import { Link } from '@tanstack/react-router'

// Type-safe link
<Link to="/bingo/$seed" params={{ seed: 'abc123' }}>
  View Board
</Link>

// Programmatic navigation
import { useNavigate } from '@tanstack/react-router'
const navigate = useNavigate()
navigate({ to: '/bingo/$seed', params: { seed: 'abc123' } })
```

---

## 4. Rendering: SSR, CSR, Streaming

### Default: Full-Document SSR

TanStack Start defaults to **server-side rendering** with hydration on the client. Every route is rendered on the server by default.

### Streaming SSR

Built-in support for **streaming SSR** — the page starts sending HTML before all data is loaded, with async chunks streamed in as they resolve.

```tsx
// Deferred data loading with streaming
export const Route = createFileRoute('/game/$seed')({
  loader: async ({ params }) => {
    // This data streams in as it resolves
    return {
      board: await getBoard({ data: params.seed }),
      // Deferred data can be loaded separately
    }
  },
  component: GamePage,
})
```

### CSR-Only Mode

You can opt specific routes into client-only rendering:

```tsx
export const Route = createFileRoute('/client-only')({
  component: ClientOnlyPage,
})
// Or configure at the router level for SPA mode
```

### Rendering Architecture

- **Dual-bundle architecture**: Separate bundles for server and client
- **Vite-powered**: Uses Vite Environments API for server/client bundling
- **Hydration**: React 18/19 hydration on the client
- **Server Functions**: Code that runs only on the server but can be called from client components

---

## 5. Deployment Adapters

### Official Partners (First-Class Support)

| Target | Support Level | Notes |
|---|---|---|
| **Cloudflare Workers** | ⭐ Official Partner | `@cloudflare/vite-plugin` + `wrangler`. Dedicated plugin, full production emulation in dev. |
| **Netlify** | ⭐ Official Partner | `@netlify/vite-plugin-tanstack-start`. Auto-detection, one-click deploy. |
| **Railway** | ⭐ Official Partner | Zero-config via Nitro. Auto-deploy from GitHub. Built-in databases, preview envs. |

### Other Supported Targets

| Target | Method | Notes |
|---|---|---|
| **Vercel** | Via Nitro adapter | Follow Nitro deployment instructions, then deploy via Vercel CLI or git integration. Has official Vercel docs page. |
| **Node.js / Docker** | Via Nitro adapter | Build output is a standalone Node.js server. Works with any Docker host. |
| **Bun** | Via Nitro adapter | Bun-specific preset available. Custom Bun server implementation also supported. |
| **Fly.io** | Via Docker/Node.js | Build Docker image from Node.js output, deploy to Fly.io. No dedicated adapter, but works seamlessly. |
| **Render** | Via Docker/Node.js | Same as Fly.io — build the Node.js server, deploy as a Docker or Node service on Render. |
| **Appwrite Sites** | Native support | Dedicated setup guide in docs. |

### Nitro Integration

TanStack Start uses [Nitro](https://nitro.build/) as the universal deployment layer. Add it to your Vite config:

```ts
// vite.config.ts
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [tanstackStart(), nitro(), viteReact()],
})
```

Nitro supports [a wide range of deployment presets](https://nitro.build/deploy) beyond what's listed above.

### t3ingo Deployment Recommendation

For a bingo game app:
- **Simplest**: **Vercel** or **Netlify** — git push to deploy, free tier
- **Edge performance**: **Cloudflare Workers** — closest to users, generous free tier
- **Full control**: **Railway** — built-in Postgres if needed, easy scaling

---

## 6. Styling

### Tailwind CSS (First-Class, Recommended)

Tailwind is a first-class add-on in the TanStack CLI. Full guides exist for both **Tailwind v3 and v4**.

```bash
# Automatically configured via CLI
npx @tanstack/cli@latest create my-app
# Select Tailwind as an add-on
```

Or manual setup:

```ts
// vite.config.ts — already handled by CLI
```

Official docs: https://tanstack.com/start/latest/docs/framework/react/guide/tailwind-integration
Official Tailwind guide: https://tailwindcss.com/docs/installation/framework-guides/tanstack-start

### shadcn/ui

Full support with dedicated installation guide:
https://ui.shadcn.com/docs/installation/tanstack

### CSS Modules

⚠️ **CSS Modules have known issues** — there's an open GitHub issue (#3023) about styles loading only on the client, causing a flash of unstyled content (FOUC) with SSR. **Not recommended for SSR apps** until resolved.

### Other Options

- **Vanilla CSS** — works fine, imported normally
- **CSS-in-JS** (styled-components, emotion) — works but may require additional SSR configuration
- **Panda CSS** — zero-runtime CSS-in-JS, should work well
- **Material UI** — has an official example (`start-material-ui`)

### t3ingo Styling Recommendation

**Tailwind CSS v4 + shadcn/ui** — both have first-class TanStack Start support, work perfectly with SSR, and provide a great DX for building a game UI.

---

## 7. State Management

### No Built-In State Manager

TanStack Start uses standard React state patterns. There is no built-in global state management.

### Recommended Patterns

1. **URL/Search Params as State** (see section 8) — built-in and type-safe
2. **React's built-in state** — `useState`, `useReducer`, `useContext` for component-level state
3. **TanStack Query** — for server state / async data. Has official integration example (`start-basic-react-query`)
4. **TanStack Store** (alpha) — new reactive store from TanStack, but still alpha
5. **Zustand / Jotai** — community favorites, work fine with TanStack Start

### Server Functions for Server State

```tsx
import { createServerFn } from '@tanstack/react-start'

// Define a server function
const getGameData = createServerFn({ method: 'GET' })
  .validator((seed: string) => seed)
  .handler(async ({ data: seed }) => {
    // Runs on the server only
    return { board: generateBoard(seed), called: getCalledNumbers(seed) }
  })

// Use in route loader for SSR
export const Route = createFileRoute('/game/$seed')({
  loader: async ({ params }) => {
    return await getGameData({ data: params.seed })
  },
  component: GamePage,
})

// Or call from client component
function GamePage() {
  const handleNewGame = async () => {
    const data = await getGameData({ data: newSeed })
    // Update local state
  }
}
```

### t3ingo State Recommendation

- **URL params** for shareable game state (seed, board ID)
- **React useState/useReducer** for ephemeral UI state (selected cells, game progress)
- **TanStack Query** if adding a database for game persistence
- Server functions for any game logic that needs to run server-side

---

## 8. URL/Search Params (Critical for t3ingo)

This is TanStack Router's **killer feature** — type-safe, validated search params that act as first-class state.

### Basic Search Params

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/game')({
  validateSearch: (search) => ({
    seed: (search.seed as string) || generateRandomSeed(),
    mode: (search.mode as string) || 'classic',
  }),
  component: GamePage,
})

function GamePage() {
  const { seed, mode } = Route.useSearch()
  return <div>Game seed: {seed}, mode: {mode}</div>
}
```

### With Zod Schema Validation

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const gameSearchSchema = z.object({
  seed: z.string().min(1).default(() => crypto.randomUUID().slice(0, 8)),
  mode: z.enum(['classic', 'blackout', 'four-corners']).default('classic'),
  freeSpace: z.boolean().default(true),
})

export const Route = createFileRoute('/game')({
  validateSearch: gameSearchSchema,
  component: GamePage,
})

function GamePage() {
  const search = Route.useSearch()
  // search is fully typed: { seed: string, mode: 'classic' | 'blackout' | 'four-corners', freeSpace: boolean }
  
  const navigate = useNavigate()
  
  const newGame = () => {
    navigate({
      to: '/game',
      search: { seed: crypto.randomUUID().slice(0, 8), mode: search.mode, freeSpace: search.freeSpace }
    })
  }
  
  return (
    <div>
      <p>Seed: {search.seed}</p>
      <p>Mode: {search.mode}</p>
      <button onClick={newGame}>New Game</button>
      {/* Share this URL and someone gets the exact same board! */}
    </div>
  )
}
```

### Link with Search Params

```tsx
<Link
  to="/game"
  search={{ seed: 'abc123', mode: 'classic', freeSpace: true }}
>
  Play this board
</Link>
```

### Shareable URLs for t3ingo

This is **perfect** for a bingo game. The URL becomes the shareable game state:

```
https://t3ingo.app/game?seed=abc123&mode=classic&freeSpace=true
```

Anyone who opens this URL gets the **exact same bingo board** because the seed deterministically generates the board. This means:

- ✅ No database needed for basic shared games
- ✅ Fully shareable via URL (text message, social media, etc.)
- ✅ Type-safe search params with Zod validation
- ✅ SSR-friendly — the server can generate the board during SSR
- ✅ Bookmarkable — come back to the same board later
- ✅ Custom serializers/deserializers for complex params

### Search Param Features

- **Schema validation**: Zod, Valibot, ArkType support
- **Custom serialization**: Control how params are serialized to/from URL
- **Nested objects**: Serialize complex state into search params
- **Default values**: Provide defaults for missing params
- **Type-safe navigation**: `navigate()` and `<Link>` enforce search param types
- **Location masking**: Show clean URLs while using different internal routes

---

## 9. Server Functions

Server functions are the primary way to write server-only code:

```tsx
import { createServerFn } from '@tanstack/react-start'

// GET server function (can be called from loaders)
const getBoard = createServerFn({ method: 'GET' })
  .validator((data: { seed: string }) => data)
  .handler(async ({ data }) => {
    // This code only runs on the server
    // Can access databases, file system, env vars, etc.
    return generateBingoBoard(data.seed)
  })

// POST server function (for mutations)
const saveGame = createServerFn({ method: 'POST' })
  .validator((data: { seed: string; calledNumbers: number[] }) => data)
  .handler(async ({ data }) => {
    await db.saveGame(data)
    return { success: true }
  })
```

### Server Routes (API Endpoints)

For raw HTTP handling (webhooks, API endpoints):

```tsx
// app/routes/api/health.ts
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/health')({
  GET: () => new Response(JSON.stringify({ status: 'ok' })),
})
```

---

## 10. Key Architectural Decisions for t3ingo

### ✅ Why TanStack Start is a Great Fit

1. **URL as state** — Bingo board seeds in URL params are first-class, type-safe, and shareable
2. **SSR** — Boards can be generated server-side for instant paint and SEO
3. **Lightweight** — No heavy framework overhead; just React + Router + Vite
4. **Type safety** — End-to-end TypeScript from routes to server functions to search params
5. **Deployment flexibility** — Deploy anywhere (Vercel, Cloudflare, Railway, etc.)
6. **Tailwind + shadcn/ui** — First-class support for rapid UI development
7. **Server functions** — Easy server-side game logic without API boilerplate

### 📋 Recommended Stack for t3ingo

| Layer | Choice | Why |
|---|---|---|
| Framework | TanStack Start (React) | Type-safe full-stack with SSR |
| Styling | Tailwind CSS v4 + shadcn/ui | First-class support, fast dev |
| Game State (URL) | TanStack Router search params + Zod | Shareable boards via URL |
| UI State | React useState/useReducer | Ephemeral game interaction state |
| Server Logic | Server functions | Board generation, validation |
| Deployment | Vercel or Cloudflare Workers | Free tier, git-push deploy |
| Language | TypeScript | End-to-end type safety |

### 🎲 Bingo-Specific URL Design

```
/                          → Home page (generate new game)
/game?seed=abc123          → Play a specific board
/game?seed=abc123&mode=blackout  → Play with a variant
```

The seed deterministically generates the board, so:
- No database needed for the basic "share a board" flow
- The URL IS the game state
- Server-side board generation from seed ensures the same board every time

---

## 11. Potential Concerns

1. **RC Status**: While the API is stable, the "RC" badge on docs may concern some teams. The March 2026 v1.0 release report mitigates this.
2. **CSS Modules**: FOUC issues with SSR — avoid for now.
3. **Smaller ecosystem**: Fewer community packages/examples than Next.js, but growing fast.
4. **Nitro adapter is still under active development**: The Nitro Vite plugin works but receives regular updates. Report any issues.
5. **No built-in database ORM**: You'll need to bring your own (Drizzle, Prisma, or go URL-only state for t3ingo).

---

## Key Links

- **Docs**: https://tanstack.com/start/latest
- **Quick Start**: https://tanstack.com/start/latest/docs/framework/react/quick-start
- **GitHub**: https://github.com/TanStack/router (monorepo)
- **Hosting Guide**: https://tanstack.com/start/latest/docs/framework/react/guide/hosting
- **Search Params**: https://tanstack.com/router/v1/docs/framework/react/guide/search-params
- **Server Functions**: https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
- **Tailwind Integration**: https://tanstack.com/start/latest/docs/framework/react/guide/tailwind-integration
- **shadcn/ui Install**: https://ui.shadcn.com/docs/installation/tanstack
- **CLI**: https://tanstack.com/cli/latest/docs/overview
- **Vercel Guide**: https://vercel.com/docs/frameworks/full-stack/tanstack-start
- **Cloudflare Guide**: https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start
- **Blog Post (v1 RC)**: https://tanstack.com/blog/announcing-tanstack-start-v1
