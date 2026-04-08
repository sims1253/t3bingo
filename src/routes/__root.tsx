import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
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
        title: 't3bingo — Theo Twitch Bingo',
      },
      {
        name: 'description',
        content:
          'A bingo game for Theo Twitch livestreams. Get a random board of funny recurring Theo moments and play along!',
      },
      {
        property: 'og:title',
        content: 't3bingo — Theo Twitch Bingo',
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
      <body className="font-sans antialiased bg-[var(--bg)] text-[var(--text-primary)] min-h-screen">
        {children}
        <Scripts />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <h1 className="display-title mb-4 text-6xl font-bold tracking-tight text-[var(--text-primary)] sm:text-8xl">
          404
        </h1>
        <p className="mb-2 text-lg font-medium text-[var(--text-secondary)] sm:text-xl">
          Page not found
        </p>
        <p className="mx-auto mb-8 max-w-md text-sm text-[var(--text-muted)] sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist. Maybe you took a wrong turn
          on the way to bingo?
        </p>
        <Link
          to="/"
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-glow)] px-8 py-3 text-base font-semibold text-[var(--accent)] no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-glow-strong)] hover:border-[var(--accent)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
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
        <h1 className="display-title mb-4 text-5xl font-bold tracking-tight text-[var(--text-primary)] sm:text-7xl">
          Oops!
        </h1>
        <p className="mb-2 text-lg font-medium text-[var(--text-secondary)] sm:text-xl">
          Something went wrong
        </p>
        <p className="mx-auto mb-8 max-w-md text-sm text-[var(--text-muted)] sm:text-base">
          An unexpected error occurred. Don&apos;t worry, it&apos;s not your fault.
          Try going back to the home page.
        </p>
        <Link
          to="/"
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-glow)] px-8 py-3 text-base font-semibold text-[var(--accent)] no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-glow-strong)] hover:border-[var(--accent)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
        >
          Go Home
        </Link>
      </div>
    </main>
  )
}
