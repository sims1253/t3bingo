import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { checkBingo, generateBoard } from '#/lib/bingo'
import { loadMarks, saveMarks, toggleMark } from '#/lib/marks'
import { generateRandomSeed, generateDifferentSeed } from '#/lib/seed'
import { Board } from '#/components/Board'
import { Celebration } from '#/components/Celebration'
import { ShareButton } from '#/components/ShareButton'
import { RotateCcw } from 'lucide-react'

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
      { title: 't3ingo — Playing Bingo' },
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
    <main className="flex min-h-screen flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg">
        <h1 className="display-title mb-6 text-center text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          t3ingo
        </h1>

        <Celebration hasBingo={hasBingo} />

        <Board items={board} marks={marks} onToggle={handleToggle} />

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleNewGame}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--surface)] px-5 py-2 text-sm font-medium text-[var(--lagoon-deep)] transition-colors hover:bg-[rgba(79,184,178,0.15)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            New Game
          </button>
          <ShareButton />
        </div>

        <p className="mt-4 text-center text-xs text-[var(--sea-ink-soft)]">
          Seed: {seed}
        </p>
      </div>
    </main>
  )
}
