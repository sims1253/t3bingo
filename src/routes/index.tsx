import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { generateRandomSeed } from '#/lib/seed'

export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  const navigate = useNavigate()

  function handlePlay() {
    const seed = generateRandomSeed()
    void navigate({ to: '/game', search: { seed } })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <h1 className="display-title mb-4 text-5xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-7xl">
          t3ingo
        </h1>
        <p className="mb-2 text-lg font-medium text-[var(--sea-ink-soft)] sm:text-xl">
          Theo Twitch Bingo
        </p>
        <p className="mx-auto mb-8 max-w-md text-sm text-[var(--sea-ink-soft)] sm:text-base">
          Play bingo with funny recurring moments from Theo&apos;s Twitch
          livestreams. Get a random board, mark squares as they happen, and
          celebrate when you complete a line!
        </p>
        <button
          type="button"
          onClick={handlePlay}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-8 py-3 text-base font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] focus:ring-offset-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Play
        </button>
      </div>
    </main>
  )
}
