import { useEffect, useState } from 'react'

interface CelebrationProps {
  /** Whether bingo has been achieved */
  hasBingo: boolean
}

/**
 * Confetti particle configuration for the celebration animation.
 * Each particle has a random position, color, size, and animation delay.
 */
interface ConfettiParticle {
  id: number
  x: number
  y: number
  color: string
  size: number
  delay: number
  duration: number
  rotation: number
}

const CONFETTI_COLORS = [
  'var(--accent)',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#fbbf24',
  '#3b82f6',
]

/** Number of confetti particles to generate */
const PARTICLE_COUNT = 40

/**
 * Generate confetti particles with random properties.
 * Deterministic-ish randomness via Math.random (visual effect only, not game logic).
 */
function generateParticles(count: number): ConfettiParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * -50, // start above viewport
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]!,
    size: Math.random() * 8 + 4, // 4-12px
    delay: Math.random() * 2, // 0-2s delay
    duration: Math.random() * 2 + 2, // 2-4s duration
    rotation: Math.random() * 360,
  }))
}

/**
 * Hook to detect prefers-reduced-motion media query.
 * Returns true if the user prefers reduced motion.
 */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return reduced
}

/**
 * Celebration effect component that activates when bingo is detected.
 *
 * Features:
 * - Confetti particles animation (CSS-based, no external deps)
 * - Animated "BINGO!" banner with glow effect
 * - Does NOT block board interaction (pointer-events: none on overlay)
 * - Respects prefers-reduced-motion (static banner instead of confetti)
 * - Persists while bingo condition holds, stops when broken
 * - Re-triggers when bingo is re-achieved
 */
export function Celebration({ hasBingo }: CelebrationProps) {
  const reducedMotion = useReducedMotion()

  if (!hasBingo) return null

  return (
    <>
      {/* Confetti overlay - does not block clicks */}
      <ConfettiOverlay reducedMotion={reducedMotion} />

      {/* BINGO banner */}
      <div
        role="alert"
        aria-live="polite"
        data-testid={reducedMotion ? 'static-celebration' : undefined}
        className={
          'mb-4 rounded-lg border-2 border-[var(--accent)]/40 bg-[var(--marked-bg)] px-4 py-3 text-center slide-in-up ' +
          (reducedMotion
            ? ''
            : 'celebration-glow')
        }
      >
        <p className="display-title text-xl font-bold tracking-wide text-[var(--accent)]">
          BINGO!
        </p>
      </div>
    </>
  )
}

/**
 * Confetti overlay with falling particles.
 * Uses pointer-events-none so clicks pass through to the board.
 */
function ConfettiOverlay({ reducedMotion }: { reducedMotion: boolean }) {
  // Don't render animated confetti if reduced motion is preferred
  if (reducedMotion) {
    return null
  }

  const particles = generateParticles(PARTICLE_COUNT)

  return (
    <div
      data-testid="confetti-overlay"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          data-testid="confetti-particle"
          className="absolute rounded-sm confetti-fall"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
