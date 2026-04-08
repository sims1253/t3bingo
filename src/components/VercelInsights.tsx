import { useEffect } from 'react'
import { inject } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'

export function VercelInsights() {
  useEffect(() => {
    inject()
    injectSpeedInsights()
  }, [])
  return null
}
