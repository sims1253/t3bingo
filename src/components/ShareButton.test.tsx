/**
 * @vitest-environment jsdom
 */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ShareButton } from './ShareButton'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

/**
 * Helper to set up location.href mock for tests.
 * jsdom defines location as read-only, so we use a spy approach.
 */
function mockLocationHref(href: string) {
  // In jsdom, window.location is special. We need to override it for tests.
  Object.defineProperty(window, 'location', {
    value: { href },
    writable: true,
    configurable: true,
  })
}

describe('ShareButton', () => {
  it('renders with "Share" label', () => {
    render(<ShareButton />)
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
  })

  it('copies window.location.href to clipboard on click', async () => {
    mockLocationHref('http://localhost:3000/game?seed=abc123')

    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    render(<ShareButton />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('http://localhost:3000/game?seed=abc123')
    })
  })

  it('shows "Copied!" feedback after successful copy', async () => {
    mockLocationHref('http://localhost:3000/game?seed=test')

    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    render(<ShareButton />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument()
    })
  })

  it('uses Web Share API when available', async () => {
    mockLocationHref('http://localhost:3000/game?seed=mobile')

    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', {
      value: share,
      writable: true,
      configurable: true,
    })
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    render(<ShareButton />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(share).toHaveBeenCalledWith({
        title: 't3ingo — Theo Twitch Bingo',
        url: 'http://localhost:3000/game?seed=mobile',
      })
    })
    expect(writeText).not.toHaveBeenCalled()
  })

  it('falls back to clipboard when Web Share API is not available', async () => {
    mockLocationHref('http://localhost:3000/game?seed=test')

    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    render(<ShareButton />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('http://localhost:3000/game?seed=test')
    })
  })

  it('shows error feedback when clipboard fails', async () => {
    mockLocationHref('http://localhost:3000/game?seed=test')

    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    const writeText = vi.fn().mockRejectedValue(new Error('Clipboard denied'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    render(<ShareButton />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /could not copy/i })).toBeInTheDocument()
    })
  })

  it('does not crash when navigator.clipboard is undefined', async () => {
    mockLocationHref('http://localhost:3000/game?seed=test')

    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    render(<ShareButton />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /could not copy/i })).toBeInTheDocument()
    })
  })

  it('reverts to "Share" when Web Share API is aborted by user', async () => {
    mockLocationHref('http://localhost:3000/game?seed=test')

    const share = vi.fn().mockRejectedValue(new DOMException('User aborted', 'AbortError'))
    Object.defineProperty(navigator, 'share', {
      value: share,
      writable: true,
      configurable: true,
    })

    render(<ShareButton />)
    fireEvent.click(screen.getByRole('button'))

    // User cancellation should not show error, just stay as "Share"
    await waitFor(() => {
      expect(share).toHaveBeenCalled()
    })
    // After abort, button should revert to idle state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^share$/i })).toBeInTheDocument()
    })
  })
})

describe('ShareButton — feedback timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('reverts to "Share" after feedback timeout', async () => {
    mockLocationHref('http://localhost:3000/game?seed=test')

    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    render(<ShareButton />)
    fireEvent.click(screen.getByRole('button'))

    // Flush microtasks to resolve the clipboard promise, then advance timers
    // to let React process the async state update
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    // Should show "Copied!" after clipboard resolves
    expect(screen.getByRole('button')).toHaveTextContent('Copied!')

    // Advance past the feedback duration (2s)
    act(() => {
      vi.advanceTimersByTime(2100)
    })

    // Should revert to "Share"
    expect(screen.getByRole('button')).toHaveTextContent('Share')
  })

  it('reverts from error state after timeout', async () => {
    mockLocationHref('http://localhost:3000/game?seed=test')

    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    const writeText = vi.fn().mockRejectedValue(new Error('Clipboard denied'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    render(<ShareButton />)
    fireEvent.click(screen.getByRole('button'))

    // Flush microtasks to resolve the rejected clipboard promise
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    // Should show error
    expect(screen.getByRole('button')).toHaveTextContent('Could not copy')

    // Advance past the feedback duration (2s)
    act(() => {
      vi.advanceTimersByTime(2100)
    })

    // Should revert to "Share"
    expect(screen.getByRole('button')).toHaveTextContent('Share')
  })
})
