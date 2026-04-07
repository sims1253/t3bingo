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
