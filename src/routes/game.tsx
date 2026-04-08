import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { checkBingo, generateBoard } from '#/lib/bingo'
import { loadMarks, saveMarks, toggleMark } from '#/lib/marks'
import { generateRandomSeed, generateDifferentSeed } from '#/lib/seed'
import { Board } from '#/components/Board'
import { Celebration } from '#/components/Celebration'
import { ShareButton } from '#/components/ShareButton'
import { ShareOnSocial } from '#/components/ShareOnSocial'
import { RotateCcw } from 'lucide-react'

const FOOTER_LINKS = [
  { href: 'https://x.com/scholzmx', label: 'X / Twitter' },
  { href: 'https://github.com/sims1253/t3bingo', label: 'GitHub' },
] as const

/**
 * Search param schema for the game route.
 *
 * TanStack Router's default URL parser (qss.toValue) coerces purely numeric
 * query params to numbers (e.g. seed=0 → 0). Using z.union([z.string(), z.number()])
 * accepts both types without transforming, which prevents TanStack Router from
 * re-serializing the URL with JSON.stringify quotes (seed=%220%22).
 * The seed is converted to string in the component.
 */
const gameSearchSchema = z.object({
  seed: z.union([z.string(), z.number()]).optional().default(''),
})

export const Route = createFileRoute('/game')({
  validateSearch: gameSearchSchema,
  /**
   * Redirect to a random seed when no seed (or empty seed) is provided.
   * Using beforeLoad ensures the redirect happens before the component
   * mounts, avoiding React hooks mismatch errors that occur with
   * client-side state-based redirects.
   *
   * Note: Check with === '' rather than !seed because seed can be 0 (number)
   * which is falsy but valid.
   */
  beforeLoad: ({ search }) => {
    if (search.seed === '' || search.seed === undefined) {
      throw redirect({
        to: '/game',
        search: { seed: generateRandomSeed() },
      })
    }
  },
  head: () => ({
    meta: [
      { title: 't3bingo — Playing Bingo' },
      {
        name: 'description',
        content:
          'Play Theo Twitch Bingo! Mark squares as funny Theo moments happen during the livestream and celebrate when you complete a line.',
      },
    ],
  }),
  component: GamePage,
})

function GamePage() {
  const { seed: rawSeed } = Route.useSearch()
  // TanStack Router may provide seed as number (e.g. seed=0 → 0) due to
  // qss.toValue coercion. Convert to string for board generation.
  const seed = String(rawSeed ?? '')
  const navigate = useNavigate()

  // Mark state: always initialize as empty Set to avoid SSR hydration mismatch.
  // Marks are loaded from sessionStorage in useEffect after hydration completes.
  const [marks, setMarks] = useState<Set<number>>(() => new Set())

  // Ref to the board DOM element for html2canvas capture
  const boardRef = useRef<HTMLDivElement>(null)

  // Load marks from sessionStorage after hydration, and when seed changes
  useEffect(() => {
    if (!seed) return
    setMarks(loadMarks(seed, (key) => window.sessionStorage.getItem(key)))
  }, [seed])

  // Persist marks to sessionStorage whenever they change
  useEffect(() => {
    if (!seed) return
    saveMarks(seed, marks, (key, value) => window.sessionStorage.setItem(key, value))
  }, [seed, marks])

  const handleToggle = useCallback((index: number) => {
    setMarks((prev) => toggleMark(prev, index))
  }, [])

  const handleNewGame = useCallback(() => {
    const newSeed = generateDifferentSeed(seed)
    void navigate({ to: '/game', search: { seed: newSeed } })
  }, [seed, navigate])

  const board = generateBoard(seed)

  // Bingo state: reactively computed from marks (not stored separately)
  const hasBingo = useMemo(() => checkBingo(marks), [marks])

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-2xl">
        <header className="mb-6 text-center">
          <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            t3bingo
          </h1>
        </header>

        <Celebration hasBingo={hasBingo} />

        <h2 className="sr-only">Bingo Board</h2>
        <Board ref={boardRef} items={board} marks={marks} onToggle={handleToggle} />

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleNewGame}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            New Game
          </button>
          <ShareButton hasBingo={hasBingo} />
          <ShareOnSocial hasBingo={hasBingo} boardRef={boardRef} />
        </div>

        <button
          type="button"
          onClick={() => void navigator.clipboard?.writeText(window.location.href)}
          className="group mt-4 mx-auto flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-mono text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-glow)] hover:text-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
          aria-label={`Copy board link. Board ID: ${seed}`}
        >
          <span className="text-[10px] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true">
            &#x2398;
          </span>
          board: {seed}
        </button>

        <footer className="mt-6 flex items-center justify-center gap-4 text-[11px] text-[var(--text-muted)]">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </footer>
      </div>
    </main>
  )
}
