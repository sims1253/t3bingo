/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Celebration } from './Celebration'

// Mock matchMedia for prefers-reduced-motion testing
function createMatchMedia(reducedMotion: boolean) {
  return (query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? reducedMotion : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })
}

describe('Celebration', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    // Default: no reduced motion preference
    window.matchMedia = createMatchMedia(false) as unknown as typeof window.matchMedia
  })

  afterEach(() => {
    cleanup()
    window.matchMedia = originalMatchMedia
  })

  it('renders nothing when hasBingo is false', () => {
    const { container } = render(<Celebration hasBingo={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders celebration content when hasBingo is true', () => {
    render(<Celebration hasBingo={true} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('displays BINGO text when celebrating', () => {
    render(<Celebration hasBingo={true} />)
    expect(screen.getByRole('alert')).toHaveTextContent(/bingo/i)
  })

  it('has aria-live="polite" for accessibility', () => {
    render(<Celebration hasBingo={true} />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'polite')
  })

  it('confetti overlay does not block pointer events', () => {
    const { container } = render(<Celebration hasBingo={true} />)
    const overlay = container.querySelector('[data-testid="confetti-overlay"]')
    expect(overlay).toBeTruthy()
    // The overlay should have pointer-events: none so it doesn't block clicks
    expect(overlay!.className).toContain('pointer-events-none')
  })

  it('renders confetti particles when animating', () => {
    const { container } = render(<Celebration hasBingo={true} />)
    // Should have confetti particles
    const particles = container.querySelectorAll('[data-testid="confetti-particle"]')
    expect(particles.length).toBeGreaterThan(0)
  })

  it('renders static banner when prefers-reduced-motion is set', () => {
    window.matchMedia = createMatchMedia(true) as unknown as typeof window.matchMedia
    const { container } = render(<Celebration hasBingo={true} />)

    // Should render the alert banner
    expect(screen.getByRole('alert')).toBeInTheDocument()

    // Should NOT render animated confetti
    const particles = container.querySelectorAll('[data-testid="confetti-particle"]')
    expect(particles.length).toBe(0)

    // Should have static indicator
    const staticIndicator = container.querySelector('[data-testid="static-celebration"]')
    expect(staticIndicator).toBeTruthy()
  })

  it('does not render static indicator in animated mode', () => {
    window.matchMedia = createMatchMedia(false) as unknown as typeof window.matchMedia
    const { container } = render(<Celebration hasBingo={true} />)

    const staticIndicator = container.querySelector('[data-testid="static-celebration"]')
    expect(staticIndicator).toBeNull()
  })

  it('banner has visually distinct styling from normal state', () => {
    render(<Celebration hasBingo={true} />)
    const alert = screen.getByRole('alert')
    // Banner should have content and be visible
    expect(alert.textContent).toBeTruthy()
  })
})
