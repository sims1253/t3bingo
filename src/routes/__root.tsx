import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
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
