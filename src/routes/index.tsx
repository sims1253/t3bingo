import { createFileRoute, redirect } from '@tanstack/react-router'
import { generateRandomSeed } from '#/lib/seed'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      to: '/game',
      search: { seed: generateRandomSeed() },
    })
  },
})
