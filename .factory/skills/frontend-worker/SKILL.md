---
name: frontend-worker
description: Builds TanStack Start React features — UI components, game logic, styling, and tests.
---

# Frontend Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Any feature involving:
- TanStack Start route implementation
- React component development
- Game logic (board generation, bingo detection, marking)
- Tailwind CSS styling and shadcn/ui components
- Client-side state management (sessionStorage, URL params)
- SEO meta tags, accessibility improvements
- Unit tests with Vitest

## Required Skills

None beyond standard file-editing and shell tools.

## Work Procedure

### Step 1: Understand the Feature

Read the feature description carefully. Identify:
- Which files need to be created or modified
- Which validation contract assertions this feature fulfills
- Dependencies on other features/files that should already exist

### Step 2: Write Tests First (Red)

1. **Identify testable logic** — Board generation, bingo detection, seed hashing, etc. all need unit tests.
2. **Write failing tests** in a test file co-located with the source (e.g., `app/lib/bingo.test.ts` for `app/lib/bingo.ts`).
3. **Run tests** to confirm they fail: `bun test`
4. Tests should cover:
   - Happy path (expected behavior)
   - Edge cases (empty input, special characters, boundary values)
   - Error cases where applicable

### Step 3: Implement (Green)

1. **Write the minimum code** to make all tests pass.
2. Follow the architecture described in `.factory/library/architecture.md`.
3. Follow the conventions in `AGENTS.md`.
4. **For UI components:**
   - Use Tailwind CSS utility classes for styling
   - Use shadcn/ui components where appropriate (`Button`, `Card`, etc.)
   - Ensure components are accessible (proper ARIA attributes, keyboard navigable)
   - Test responsive behavior by checking the component at different viewport sizes
5. **For game logic:**
   - Keep logic pure and testable (no React dependencies in `app/lib/` files)
   - Follow the seeded PRNG pattern for deterministic board generation
   - Ensure center square is always "Gets nerdsniped" at position index 12

### Step 4: Verify

1. **Run unit tests:** `bun test` — all tests must pass
2. **Run typecheck:** `bun run typecheck` — no errors
3. **Run lint:** `bun run lint` — no errors (if configured)
4. **Start dev server:** Ensure `PORT=3000 bun run dev` starts without errors
5. **Manual verification:** Open the app in a browser and verify the feature works:
   - For board features: verify the board renders correctly
   - For marking features: verify squares can be toggled
   - For bingo detection: manually complete a line and verify bingo triggers
   - For UI features: verify the visual design matches expectations

### Step 5: Commit

Commit your changes with a descriptive message referencing the feature.

## Example Handoff

```json
{
  "salientSummary": "Implemented board generation with seeded PRNG (mulberry32), 5x5 grid rendering with center square 'Gets nerdsniped', and square marking with sessionStorage persistence. All 14 unit tests pass. Verified board renders correctly with multiple seeds including edge cases.",
  "whatWasImplemented": "Created app/lib/bingo.ts with seeded PRNG (mulberry32 hash), board generation (shuffles 45-item pool, places 'Gets nerdsniped' at center), and bingo detection (checks 12 possible lines). Created app/lib/items.ts with 45 curated Theo bingo items. Created app/components/Board.tsx (5x5 CSS grid) and app/components/Square.tsx (clickable toggle with visual marked state using aria-pressed). Created app/routes/game.tsx with TanStack Router search param validation (Zod schema for seed). Mark state persisted in sessionStorage keyed by seed.",
  "whatWasLeftUndone": "",
  "verification": {
    "commandsRun": [
      { "command": "bun test", "exitCode": 0, "observation": "14 tests passing — board generation (deterministic, edge-case seeds, Unicode), bingo detection (all rows/cols/diags, partial lines, center square requirement)" },
      { "command": "bun run typecheck", "exitCode": 0, "observation": "No type errors" },
      { "command": "PORT=3000 bun run dev", "exitCode": 0, "observation": "Dev server starts, board renders at /game?seed=abc123" }
    ],
    "interactiveChecks": [
      { "action": "Navigated to /game?seed=test123, verified 5x5 grid with 25 squares", "observed": "Grid renders correctly, center square shows 'Gets nerdsniped'" },
      { "action": "Clicked squares to mark/unmark them", "observed": "Visual toggle works, marked state persists after page refresh" },
      { "action": "Completed first row (5 squares marked)", "observed": "No celebration yet (not this feature's scope — celebration feature pending)" },
      { "action": "Opened same seed in new tab", "observed": "Same board, marks are independent per tab" }
    ]
  },
  "tests": {
    "added": [
      {
        "file": "app/lib/bingo.test.ts",
        "cases": [
          { "name": "generates deterministic board from seed", "verifies": "Same seed always produces same board" },
          { "name": "different seeds produce different boards", "verifies": "Seed variation changes output" },
          { "name": "board has exactly 25 items", "verifies": "5x5 grid size" },
          { "name": "center square is 'Gets nerdsniped'", "verifies": "Center position (index 12) is always nerdsniped" },
          { "name": "all items are from the curated pool", "verifies": "No garbage or placeholder text" },
          { "name": "handles edge-case seeds (empty, special chars, unicode)", "verifies": "Graceful handling of unusual inputs" },
          { "name": "detects bingo on complete row", "verifies": "Row detection works" },
          { "name": "detects bingo on complete column", "verifies": "Column detection works" },
          { "name": "detects bingo on main diagonal", "verifies": "Diagonal detection works" },
          { "name": "detects bingo on anti-diagonal", "verifies": "Anti-diagonal detection works" },
          { "name": "does not trigger on partial line", "verifies": "Partial lines are not false positives" },
          { "name": "center must be explicitly marked (not free)", "verifies": "Center square is not auto-marked" },
          { "name": "unmarking clears bingo", "verifies": "Bingo state is reactive" },
          { "name": "full blackout triggers bingo", "verifies": "All-marked state works" }
        ]
      }
    ]
  },
  "discoveredIssues": []
}
```

## When to Return to Orchestrator

- The TanStack Start project structure doesn't exist yet and you can't create it (first feature should handle scaffolding)
- A dependency from another feature is missing and blocking your work
- You discover a design flaw in the architecture that affects other features
- Environment issues prevent the dev server from starting
