# Environment

Environment variables, external dependencies, and setup notes.

**What belongs here:** Required env vars, external API keys/services, dependency quirks, platform-specific notes.
**What does NOT belong here:** Service ports/commands (use `.factory/services.yaml`).

---

## Runtime

- **Bun** v1.3.4+ (package manager + runtime)
- **Node.js** v25.8.1+ (fallback)
- **Vite** (bundler, managed by TanStack Start)

## External Dependencies

None. No API keys, no database, no third-party services.

## Framework

- **TanStack Start** v1.x (React full-stack framework)
- **TanStack Router** (file-based routing with type-safe search params)
- **Nitro** (deployment adapter for Vercel)

## Styling

- **Tailwind CSS** v4 (utility-first CSS)
- **shadcn/ui** (React component library)

## Browser Requirements

- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- JavaScript required for marking squares (progressive enhancement for SSR)
- Clipboard API (`navigator.clipboard`) for Share button
- sessionStorage for mark persistence
