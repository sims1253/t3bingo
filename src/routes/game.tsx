import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const gameSearchSchema = z.object({
  seed: z.string().optional().default(''),
})

export const Route = createFileRoute('/game')({
  validateSearch: gameSearchSchema,
  component: GamePage,
})

function GamePage() {
  const { seed } = Route.useSearch()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <h1 className="display-title mb-4 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
          t3ingo
        </h1>
        <p className="mb-6 text-base text-[var(--sea-ink-soft)]">
          Game coming soon
        </p>
        {seed && (
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Seed: {seed}
          </p>
        )}
      </div>
    </main>
  )
}
