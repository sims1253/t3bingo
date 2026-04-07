import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { generateBoard } from '#/lib/bingo'

const gameSearchSchema = z.object({
  seed: z.string().optional().default(''),
})

export const Route = createFileRoute('/game')({
  validateSearch: gameSearchSchema,
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

  if (!seed) {
    // Generate a random seed and redirect to the seeded URL
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

        <div
          className="grid grid-cols-5 gap-1.5 sm:gap-2"
          role="grid"
          aria-label="Bingo board"
        >
          {board.map((item, index) => (
            <button
              key={index}
              type="button"
              className="flex aspect-square items-center justify-center rounded-md border border-[rgba(50,143,151,0.2)] bg-[var(--bg-base)] px-1 text-center text-xs font-medium text-[var(--sea-ink)] transition-colors hover:bg-[rgba(79,184,178,0.1)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] sm:text-sm"
              aria-label={item}
            >
              <span className="line-clamp-3">{item}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-[var(--sea-ink-soft)]">
          Seed: {seed}
        </p>
      </div>
    </main>
  )
}
