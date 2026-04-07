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
- **Zod** v4.3.x (schema validation for search params — note: v4 has API differences from v3)

## Testing

- **Vitest** v3.x (test runner)
- **@testing-library/jest-dom** v6.x (DOM matchers via vitest.setup.ts)
- **@testing-library/react** (React component testing utilities)
- **jsdom** (DOM environment for component tests, enabled per-file via `@vitest-environment jsdom` docblock)
- **Note:** `lint` and `typecheck` scripts are identical (`tsc --noEmit`). No separate ESLint/Prettier is configured.

## Styling

- **Tailwind CSS** v4 (utility-first CSS)
- **shadcn/ui** (React component library)

## Browser Requirements

- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- JavaScript required for marking squares (progressive enhancement for SSR)
- Clipboard API (`navigator.clipboard`) for Share button
- sessionStorage for mark persistence
