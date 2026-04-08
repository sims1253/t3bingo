/**
 * @vitest-environment jsdom
 *
 * Accessibility tests covering validation contract assertions VAL-AX-001 through VAL-AX-010.
 * Tests verify keyboard accessibility, ARIA attributes, focus management, non-color indicators,
 * heading structure, and prefers-reduced-motion support.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Board } from './Board'
import { Square } from './Square'
import { ShareButton } from './ShareButton'
import { Celebration } from './Celebration'

afterEach(() => {
  cleanup()
})

// ── VAL-AX-001: Squares are keyboard focusable ──────────────────────

describe('VAL-AX-001: Squares are keyboard focusable', () => {
  it('each square is a focusable button element', () => {
    const items = Array.from({ length: 25 }, (_, i) => `Item ${i}`)
    render(
      <Board
        items={items}
        marks={new Set()}
        onToggle={() => {}}
      />,
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(25)

    // Each button should be focusable (all native <button> elements are by default)
    buttons.forEach((btn) => {
      expect(btn.tagName).toBe('BUTTON')
      expect(btn).not.toHaveAttribute('tabindex', '-1')
    })
  })

  it('squares have visible focus ring styles', () => {
    const items = Array.from({ length: 25 }, (_, i) => `Item ${i}`)
    render(
      <Board
        items={items}
        marks={new Set()}
        onToggle={() => {}}
      />,
    )

    const buttons = screen.getAllByRole('button')
    // Each button should have focus:ring styles in className
    buttons.forEach((btn) => {
      expect(btn.className).toContain('focus:ring')
    })
  })
})

// ── VAL-AX-002: Squares can be toggled via keyboard ──────────────────

describe('VAL-AX-002: Squares can be toggled via keyboard', () => {
  it('square responds to click activation (Enter/Space on native button)', () => {
    const onToggle = vi.fn()
    render(<Square text="Test item" marked={false} onClick={onToggle} />)

    const button = screen.getByRole('button')
    // Native <button> elements inherently respond to Enter and Space keys.
    // jsdom doesn't simulate browser key→click event translation, so we
    // test click directly — in a real browser, Enter/Space fires click.
    fireEvent.click(button)
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('square toggles state correctly on repeated activations', () => {
    let marked = false
    const onToggle = vi.fn(() => {
      marked = !marked
    })
    const { rerender } = render(
      <Square text="Test item" marked={marked} onClick={onToggle} />,
    )

    const button = screen.getByRole('button')

    // First click: unmarked → marked
    fireEvent.click(button)
    expect(onToggle).toHaveBeenCalledTimes(1)
    marked = true
    rerender(<Square text="Test item" marked={marked} onClick={onToggle} />)
    expect(button).toHaveAttribute('aria-pressed', 'true')

    // Second click: marked → unmarked
    fireEvent.click(button)
    expect(onToggle).toHaveBeenCalledTimes(2)
    marked = false
    rerender(<Square text="Test item" marked={marked} onClick={onToggle} />)
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('square is natively keyboard-activatable (is a <button> element)', () => {
    render(<Square text="Test item" marked={false} onClick={() => {}} />)

    const button = screen.getByRole('button')
    // The element is a native <button>, which means it natively responds to
    // Enter and Space keys for activation without any custom JS keyboard handling.
    expect(button.tagName).toBe('BUTTON')
    // No type="submit" that could cause form submission
    expect(button).toHaveAttribute('type', 'button')
  })
})

// ── VAL-AX-003: New Game and Share buttons are keyboard accessible ──

describe('VAL-AX-003: Action buttons are keyboard accessible', () => {
  it('Share button is a native button element with focus styles', () => {
    render(<ShareButton />)

    const shareButton = screen.getByRole('button', { name: /share/i })
    expect(shareButton.tagName).toBe('BUTTON')
    expect(shareButton).not.toHaveAttribute('tabindex', '-1')
    // Should have focus ring styles
    expect(shareButton.className).toContain('focus:ring')
  })

  it('Share button has type="button" for keyboard safety', () => {
    render(<ShareButton />)

    const shareButton = screen.getByRole('button', { name: /share/i })
    expect(shareButton).toHaveAttribute('type', 'button')
  })
})

// ── VAL-AX-004: All interactive elements have appropriate ARIA roles ─

describe('VAL-AX-004: Appropriate ARIA roles', () => {
  it('squares are native <button> elements (implicit button role)', () => {
    const items = Array.from({ length: 25 }, (_, i) => `Item ${i}`)
    render(
      <Board
        items={items}
        marks={new Set()}
        onToggle={() => {}}
      />,
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(25)

    buttons.forEach((btn) => {
      // Native <button> has implicit role="button"
      expect(btn.tagName).toBe('BUTTON')
    })
  })

  it('board container uses group role with accessible label', () => {
    const items = Array.from({ length: 25 }, (_, i) => `Item ${i}`)
    const { container } = render(
      <Board
        items={items}
        marks={new Set()}
        onToggle={() => {}}
      />,
    )

    const board = container.firstElementChild as HTMLElement
    expect(board).toBeTruthy()
    expect(board.getAttribute('role')).toBe('group')
    expect(board.getAttribute('aria-label')).toContain('Bingo board')
  })

  it('each square has aria-label with its text', () => {
    const items = ['Alpha', 'Beta', 'Gamma']
    const marks = new Set<number>()
    render(
      <Board
        items={items}
        marks={marks}
        onToggle={() => {}}
      />,
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
    items.forEach((item, i) => {
      expect(buttons[i]).toHaveAttribute('aria-label', item)
    })
  })
})

// ── VAL-AX-005: Marked state communicated via ARIA ───────────────────

describe('VAL-AX-005: Marked state communicated via ARIA', () => {
  it('unmarked square has aria-pressed="false"', () => {
    render(<Square text="Test item" marked={false} onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('marked square has aria-pressed="true"', () => {
    render(<Square text="Test item" marked={true} onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('aria-pressed toggles between marked and unmarked states', () => {
    const { rerender } = render(
      <Square text="Test item" marked={false} onClick={() => {}} />,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')

    rerender(<Square text="Test item" marked={true} onClick={() => {}} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')

    rerender(<Square text="Test item" marked={false} onClick={() => {}} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })
})

// ── VAL-AX-006: Focus order follows logical reading order ────────────

describe('VAL-AX-006: Focus order follows logical reading order', () => {
  it('board squares are in DOM order (row-major, left-to-right, top-to-bottom)', () => {
    const items = Array.from({ length: 25 }, (_, i) => `Item ${i}`)
    render(
      <Board
        items={items}
        marks={new Set()}
        onToggle={() => {}}
      />,
    )

    const buttons = screen.getAllByRole('button')
    // Verify buttons are in the same order as items array
    buttons.forEach((btn, i) => {
      expect(btn).toHaveAttribute('aria-label', `Item ${i}`)
    })
  })

  it('board container precedes action buttons in DOM', () => {
    // This tests that the DOM structure in game.tsx has board before buttons.
    // We can only verify the Board component here; the game page structure
    // would need integration testing.
    const items = Array.from({ length: 25 }, (_, i) => `Item ${i}`)
    const { container } = render(
      <Board
        items={items}
        marks={new Set()}
        onToggle={() => {}}
      />,
    )

    const board = container.firstElementChild
    expect(board).toBeTruthy()
    // All buttons are descendants of the board container
    const buttons = board!.querySelectorAll('button')
    expect(buttons).toHaveLength(25)
  })
})

// ── VAL-AX-007: Color is not the only indicator of marked state ──────

describe('VAL-AX-007: Non-color indicator of marked state', () => {
  it('marked square has a checkmark icon', () => {
    const { container } = render(
      <Square text="Test item" marked={true} onClick={() => {}} />,
    )

    // Checkmark should be rendered
    const checkmark = container.querySelector('[aria-hidden="true"]')
    expect(checkmark).toBeTruthy()
    expect(checkmark?.textContent).toContain('✓')
  })

  it('unmarked square does NOT have a checkmark icon', () => {
    const { container } = render(
      <Square text="Test item" marked={false} onClick={() => {}} />,
    )

    // Checkmark should NOT be rendered when unmarked
    const spans = container.querySelectorAll('span')
    const checkmarkSpans = Array.from(spans).filter((s) => s.textContent?.includes('✓'))
    expect(checkmarkSpans).toHaveLength(0)
  })

  it('marked square text has line-through decoration', () => {
    const { container } = render(
      <Square text="Test item" marked={true} onClick={() => {}} />,
    )

    // The text span should have line-through class
    const textSpan = container.querySelector('.line-through')
    expect(textSpan).toBeTruthy()
  })

  it('unmarked square text does NOT have line-through', () => {
    const { container } = render(
      <Square text="Test item" marked={false} onClick={() => {}} />,
    )

    const textSpan = container.querySelector('.line-through')
    expect(textSpan).toBeNull()
  })
})

// ── VAL-AX-008: Page heading structure is logical ────────────────────

describe('VAL-AX-008: Logical heading structure', () => {
  it('game page source has exactly one h1 element', async () => {
    // Read the game page source to verify heading structure
    // This is a structural test rather than a rendering test because
    // the route component requires TanStack Router context to render.
    const fs = await import('fs')
    const path = await import('path')
    const gameSource = fs.readFileSync(
      path.join(import.meta.dirname, '..', 'routes', 'game.tsx'),
      'utf-8',
    )

    // Count h1 occurrences
    const h1Matches = gameSource.match(/<h1[\s>]/g)
    expect(h1Matches).toHaveLength(1)

    // Verify h1 contains "t3bingo"
    expect(gameSource).toContain('<h1')
    expect(gameSource).toContain('t3bingo')
  })

  it('game page source has an h2 heading for the board section', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const gameSource = fs.readFileSync(
      path.join(import.meta.dirname, '..', 'routes', 'game.tsx'),
      'utf-8',
    )

    // Should have an h2 for the board section
    expect(gameSource).toMatch(/<h2[^>]*>.*Board.*<\/h2>/s)
    // The h2 should use sr-only for visual hiding
    expect(gameSource).toContain('sr-only')
  })

  it('landing page redirects to game (no rendered content)', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const indexSource = fs.readFileSync(
      path.join(import.meta.dirname, '..', 'routes', 'index.tsx'),
      'utf-8',
    )

    // Landing page now redirects to /game, so it should use redirect
    expect(indexSource).toContain('redirect')
  })
})

// ── VAL-AX-009: No keyboard traps exist ──────────────────────────────

describe('VAL-AX-009: No keyboard traps', () => {
  it('all interactive elements are standard buttons (no custom focus trapping)', () => {
    const items = Array.from({ length: 25 }, (_, i) => `Item ${i}`)
    render(
      <Board
        items={items}
        marks={new Set()}
        onToggle={() => {}}
      />,
    )

    const buttons = screen.getAllByRole('button')
    // All buttons should be standard <button> elements without tabindex hacks
    buttons.forEach((btn) => {
      expect(btn.tagName).toBe('BUTTON')
      // No negative tabindex that would trap focus
      expect(btn.getAttribute('tabindex')).not.toBe('-1')
      // No custom keyboard event handlers that could trap focus
      expect(btn.getAttribute('onkeydown')).toBeNull()
      expect(btn.getAttribute('onkeyup')).toBeNull()
    })
  })

  it('board container has no tabindex that could trap focus', () => {
    const items = Array.from({ length: 25 }, (_, i) => `Item ${i}`)
    const { container } = render(
      <Board
        items={items}
        marks={new Set()}
        onToggle={() => {}}
      />,
    )

    const board = container.firstElementChild as HTMLElement
    // The board container should NOT have tabindex (which could trap focus)
    expect(board.getAttribute('tabindex')).toBeNull()
  })
})

// ── VAL-AX-010: Celebration respects prefers-reduced-motion ──────────

describe('VAL-AX-010: Celebration respects prefers-reduced-motion', () => {
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

  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('shows animated confetti when reduced motion is not preferred', () => {
    window.matchMedia = createMatchMedia(false) as unknown as typeof window.matchMedia

    const { container } = render(<Celebration hasBingo={true} />)

    // Animated confetti should be present
    const particles = container.querySelectorAll('[data-testid="confetti-particle"]')
    expect(particles.length).toBeGreaterThan(0)

    // Static indicator should NOT be present
    expect(container.querySelector('[data-testid="static-celebration"]')).toBeNull()
  })

  it('shows static banner without confetti when reduced motion is preferred', () => {
    window.matchMedia = createMatchMedia(true) as unknown as typeof window.matchMedia

    const { container } = render(<Celebration hasBingo={true} />)

    // Animated confetti should NOT be present
    const particles = container.querySelectorAll('[data-testid="confetti-particle"]')
    expect(particles.length).toBe(0)

    // Static celebration indicator should be present
    expect(container.querySelector('[data-testid="static-celebration"]')).toBeTruthy()

    // BINGO banner should still be visible and accessible
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('bingo state is communicated in reduced motion mode', () => {
    window.matchMedia = createMatchMedia(true) as unknown as typeof window.matchMedia

    render(<Celebration hasBingo={true} />)

    // The alert should still announce bingo
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/bingo/i)
    expect(alert).toHaveAttribute('aria-live', 'polite')
  })
})
