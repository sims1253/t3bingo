# User Testing

Testing surface, required testing skills/tools, and resource cost classification.

**What belongs here:** Testing surface details, tool requirements, concurrency limits, runtime discoveries.
**What does NOT belong here:** Service ports/commands (use `.factory/services.yaml`).

---

## Validation Surface

- **Surface:** Web browser (desktop and mobile viewports)
- **Tool:** agent-browser
- **URLs to test:**
  - `/` — Landing page
  - `/game?seed=XXXXX` — Game page (any valid seed)
  - `/nonexistent-page` — Error page

## Required Testing Skills/Tools

- **agent-browser** — Primary validation tool for all browser-based assertions
- **Playwright** — Underlying browser automation (already installed, v1.59.1)
- No special setup needed beyond the dev server running on port 3000

## Validation Concurrency

**Machine specs:** 31 GB RAM, 24 CPU cores, ~20 GB available

**Per-validator resources:**
- Each agent-browser instance: ~300 MB RAM
- Dev server: ~200 MB RAM
- CPU: ~3 cores per browser instance

**Calculation:**
- Available headroom: ~20 GB RAM * 0.7 = 14 GB usable
- CPU-limited: 24 cores / 3 per instance = 8 instances max
- RAM supports: 14 GB / 300 MB ≈ 47 instances

**Max concurrent validators: 5** (conservative, leaving room for dev server and other processes)

## Testing Notes

- All assertions can be tested via agent-browser on the local dev server
- No external services to mock or set up
- SSR content can be verified via `curl` or view-source
- Mobile testing via viewport emulation in agent-browser (no physical devices needed)
- **networkidle warning:** `agent-browser wait --load networkidle` times out (~25s) on the dev server because Vite's hot-reload WebSocket keeps the network active. Use a fixed wait (e.g., `sleep 2000`) or `--load domcontentloaded` instead.

## Playwright Click Workaround

- **Playwright clicks timeout** on board squares, especially during celebration overlay or with special characters (quotes) in square text. The first click usually succeeds, but subsequent chained clicks fail.
- **Workaround:** Use JS eval to click squares directly: `document.querySelectorAll('button[aria-pressed]')[index].click()` or `element.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}))`.
- **React state delay:** After JS clicks, wait ~500ms before checking DOM state (React batches updates).
- **sessionStorage setup:** For tests needing specific mark states, set marks via JS eval (`sessionStorage.setItem(key, JSON.stringify(marksArray))`) and reload, rather than clicking each square individually.

## Known Console Warnings

- **React hydration mismatch:** SSR renders all squares unmarked; client hydrates with marks from sessionStorage. This causes `"Rendered more hooks than during the previous render"` or hydration mismatch warnings. **Non-blocking** — functional behavior is correct; React re-renders with proper client state.

## Flow Validator Guidance: browser

**Isolation rules:**
- Each flow validator gets its own agent-browser session (named session, never "default")
- Validators operate on the same dev server (port 3000) — no separate instances needed
- The landing page is read-only; multiple validators can navigate to `/` concurrently without state conflicts
- Game page mark state uses sessionStorage (per-tab) — different sessions are automatically isolated

**Shared state to avoid:**
- Do not modify any source files, configuration, or service state
- Do not kill or restart the dev server
- Do not clear browser storage belonging to other sessions

**Resources off-limits:**
- Port 3000 is reserved for the dev server — do not start other servers on this port
- `/tmp/t3ingo-dev.log` is the dev server log — read-only

**Constraints for safe concurrent testing:**
- Use unique agent-browser session names to avoid browser context collisions
- Take screenshots for evidence; do not modify the application
- If a validator needs to test click interactions (e.g., Play button), be aware the seed is random — just verify the pattern, not specific values
