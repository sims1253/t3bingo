import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { generateBoard } from '#/lib/bingo'
import { loadMarks, saveMarks, toggleMark } from '#/lib/marks'
import { Board } from '#/components/Board'
import { RotateCcw, Share2 } from 'lucide-react'

const gameSearchSchema = z.object({
  seed: z.string().optional().default(''),
})

export const Route = createFileRoute('/game')({
  validateSearch: gameSearchSchema,
  head: () => ({
    meta: [{ title: 't3ingo — Playing' }],
  }),
  component: GamePage,
})

function generateRandomSeed(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const length = 10
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => chars[byte % chars.length]).join('')
}

function GamePage() {
  const { seed: rawSeed } = Route.useSearch()
  const navigate = useNavigate()

  // If no seed provided (empty string), generate a random one and navigate
  const seed = rawSeed || ''

  // Mark state: initialized from sessionStorage, synced on every change
  const [marks, setMarks] = useState<Set<number>>(() => {
    if (typeof window === 'undefined' || !seed) return new Set()
    return loadMarks(seed, (key) => window.sessionStorage.getItem(key))
  })

  // Reload marks when seed changes (e.g. URL manually edited)
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

  if (!seed) {
    const newSeed = generateRandomSeed()
    void navigate({
      to: '/game',
      search: { seed: newSeed },
      replace: true,
    })
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <p className="text-[var(--sea-ink-soft)]">Loading board...</p>
      </main>
    )
  }

  const board = generateBoard(seed)

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg">
        <h1 className="display-title mb-6 text-center text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          t3ingo
        </h1>

        <Board items={board} marks={marks} onToggle={handleToggle} />

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--surface)] px-5 py-2 text-sm font-medium text-[var(--lagoon-deep)] transition-colors hover:bg-[rgba(79,184,178,0.15)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            New Game
          </button>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[rgba(50,143,151,0.3)] bg-[var(--surface)] px-5 py-2 text-sm font-medium text-[var(--lagoon-deep)] transition-colors hover:bg-[rgba(79,184,178,0.15)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Share
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--sea-ink-soft)]">
          Seed: {seed}
        </p>
      </div>
    </main>
  )
}
