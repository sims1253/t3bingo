import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 't3ingo — Theo Twitch Bingo',
      },
      {
        name: 'description',
        content:
          'A bingo game for Theo Twitch livestreams. Get a random board of funny recurring Theo moments and play along!',
      },
      {
        property: 'og:title',
        content: 't3ingo — Theo Twitch Bingo',
      },
      {
        property: 'og:description',
        content:
          'A bingo game for Theo Twitch livestreams. Get a random board of funny recurring Theo moments and play along!',
      },
      {
        property: 'og:type',
        content: 'website',
      },
    ],
    links: [
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased bg-[var(--bg-base)] text-[var(--sea-ink)] min-h-screen">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <h1 className="display-title mb-4 text-6xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-8xl">
          404
        </h1>
        <p className="mb-2 text-lg font-medium text-[var(--sea-ink-soft)] sm:text-xl">
          Page not found
        </p>
        <p className="mx-auto mb-8 max-w-md text-sm text-[var(--sea-ink-soft)] sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist. Maybe you took a wrong turn
          on the way to bingo?
        </p>
        <Link
          to="/"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-8 py-3 text-base font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] focus:ring-offset-2"
        >
          Go Home
        </Link>
      </div>
    </main>
  )
}

export function ErrorPage({ error }: { error: Error }) {
  // Suppress console error for expected TanStack Router not-found errors
  // that sometimes bubble through the error component
  if (error.message?.includes('NotFound')) {
    return <NotFoundPage />
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <h1 className="display-title mb-4 text-5xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-7xl">
          Oops!
        </h1>
        <p className="mb-2 text-lg font-medium text-[var(--sea-ink-soft)] sm:text-xl">
          Something went wrong
        </p>
        <p className="mx-auto mb-8 max-w-md text-sm text-[var(--sea-ink-soft)] sm:text-base">
          An unexpected error occurred. Don&apos;t worry, it&apos;s not your fault.
          Try going back to the home page.
        </p>
        <Link
          to="/"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-8 py-3 text-base font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] focus:ring-offset-2"
        >
          Go Home
        </Link>
      </div>
    </main>
  )
}
