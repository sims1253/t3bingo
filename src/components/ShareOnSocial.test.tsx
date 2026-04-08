/**
 * @vitest-environment jsdom
 */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ShareOnSocial } from './ShareOnSocial'

// Mock html2canvas - factory is hoisted so no top-level variable references
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: () => 'data:image/png;base64,test',
    toBlob: (cb: (blob: Blob | null) => void) => {
      cb(new Blob(['test'], { type: 'image/png' }))
    },
  } as unknown as HTMLCanvasElement),
}))

import html2canvas from 'html2canvas'

/** Reset html2canvas mock to default resolved value between tests */
function resetHtml2Canvas() {
  vi.mocked(html2canvas).mockResolvedValue({
    toDataURL: () => 'data:image/png;base64,test',
    toBlob: (cb: (blob: Blob | null) => void) => {
      cb(new Blob(['test'], { type: 'image/png' }))
    },
  } as unknown as HTMLCanvasElement)
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  // Must reset html2canvas AFTER restoreAllMocks, because restoreAllMocks
  // resets the mock fn's implementation to empty (returns undefined).
  resetHtml2Canvas()
  vi.useRealTimers()
})

function mockLocationHref(href: string) {
  Object.defineProperty(window, 'location', {
    value: { href },
    writable: true,
    configurable: true,
  })
}

function mockClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    writable: true,
    configurable: true,
  })
}

function mockShareApi(share: ReturnType<typeof vi.fn> | undefined) {
  Object.defineProperty(navigator, 'share', {
    value: share,
    writable: true,
    configurable: true,
  })
}

function mockCanShare(canShare: boolean) {
  Object.defineProperty(navigator, 'canShare', {
    value: () => canShare,
    writable: true,
    configurable: true,
  })
}

// Suppress URL.createObjectURL
const originalCreateObjectURL = URL.createObjectURL
beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:test')
})
afterEach(() => {
  URL.createObjectURL = originalCreateObjectURL
})

describe('ShareOnSocial', () => {
  it('renders with "Share on Social" label when bingo is true', () => {
    render(<ShareOnSocial hasBingo={true} boardRef={{ current: document.createElement('div') }} />)
    expect(screen.getByRole('button', { name: /share bingo board as image on social media/i })).toBeInTheDocument()
  })

  it('is not rendered when bingo is false', () => {
    const { container } = render(<ShareOnSocial hasBingo={false} boardRef={{ current: document.createElement('div') }} />)
    expect(container.innerHTML).toBe('')
  })

  it('is not rendered when bingo transitions from true to false', () => {
    const { rerender, container } = render(<ShareOnSocial hasBingo={true} boardRef={{ current: document.createElement('div') }} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
    rerender(<ShareOnSocial hasBingo={false} boardRef={{ current: document.createElement('div') }} />)
    expect(container.innerHTML).toBe('')
  })

  it('is a native button element with proper ARIA', () => {
    render(<ShareOnSocial hasBingo={true} boardRef={{ current: document.createElement('div') }} />)
    const btn = screen.getByRole('button')
    expect(btn.tagName).toBe('BUTTON')
    expect(btn).toHaveAttribute('aria-label', 'Share bingo board as image on social media')
  })

  it('is keyboard accessible (focusable)', () => {
    render(<ShareOnSocial hasBingo={true} boardRef={{ current: document.createElement('div') }} />)
    const btn = screen.getByRole('button')
    btn.focus()
    expect(btn).toHaveFocus()
  })

  it('shows loading state when clicked', async () => {
    // Make html2canvas slow so we can observe loading state
    vi.mocked(html2canvas).mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({
        toDataURL: () => 'data:image/png;base64,test',
        toBlob: (cb: (blob: Blob | null) => void) => {
          cb(new Blob(['test'], { type: 'image/png' }))
        },
      } as unknown as HTMLCanvasElement), 100)
    }))

    mockLocationHref('http://localhost:3000/game?seed=test')
    mockClipboard(vi.fn().mockResolvedValue(undefined))
    mockShareApi(undefined)

    render(<ShareOnSocial hasBingo={true} boardRef={{ current: document.createElement('div') }} />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)

    // Button should show loading state
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    })
  })

  it('downloads image and copies URL on desktop (no Web Share API)', async () => {
    mockLocationHref('http://localhost:3000/game?seed=abc123')
    const writeText = vi.fn().mockResolvedValue(undefined)
    mockClipboard(writeText)
    mockShareApi(undefined)

    render(<ShareOnSocial hasBingo={true} boardRef={{ current: document.createElement('div') }} />)

    // Set up download interception AFTER render
    const { clickSpy } = interceptDownload()

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('http://localhost:3000/game?seed=abc123')
    })
    expect(clickSpy).toHaveBeenCalled()
  })

  it('uses Web Share API on mobile when available', async () => {
    mockLocationHref('http://localhost:3000/game?seed=mobile')
    const writeText = vi.fn().mockResolvedValue(undefined)
    mockClipboard(writeText)
    const share = vi.fn().mockResolvedValue(undefined)
    mockShareApi(share)
    mockCanShare(true)

    render(<ShareOnSocial hasBingo={true} boardRef={{ current: document.createElement('div') }} />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(share).toHaveBeenCalled()
    })

    // Verify share was called with URL and files
    const shareCall = share.mock.calls[0]![0]
    expect(shareCall.url).toBe('http://localhost:3000/game?seed=mobile')
    expect(shareCall.files).toBeDefined()
    expect(shareCall.files[0]).toBeInstanceOf(File)
    expect(shareCall.files[0].type).toBe('image/png')

    // Clipboard should NOT have been called since Web Share succeeded
    expect(writeText).not.toHaveBeenCalled()
  })

  it('shows error message when html2canvas fails', async () => {
    vi.mocked(html2canvas).mockRejectedValue(new Error('Capture failed'))

    mockLocationHref('http://localhost:3000/game?seed=test')
    mockClipboard(vi.fn().mockResolvedValue(undefined))
    mockShareApi(undefined)

    render(<ShareOnSocial hasBingo={true} boardRef={{ current: document.createElement('div') }} />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/failed to generate image/i)
    })
  })

  it('clears error message after timeout', async () => {
    vi.useFakeTimers()
    vi.mocked(html2canvas).mockRejectedValue(new Error('Capture failed'))

    mockLocationHref('http://localhost:3000/game?seed=test')
    mockClipboard(vi.fn().mockResolvedValue(undefined))
    mockShareApi(undefined)

    render(<ShareOnSocial hasBingo={true} boardRef={{ current: document.createElement('div') }} />)
    fireEvent.click(screen.getByRole('button'))

    // Flush the rejected promise
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    // Error should be visible
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to generate image/i)

    // Advance past error timeout (3s)
    act(() => {
      vi.advanceTimersByTime(3100)
    })

    // Error should be cleared
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('returns to normal state after generation completes', async () => {
    mockLocationHref('http://localhost:3000/game?seed=test')
    mockClipboard(vi.fn().mockResolvedValue(undefined))
    mockShareApi(undefined)

    render(<ShareOnSocial hasBingo={true} boardRef={{ current: document.createElement('div') }} />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)

    // Wait for async operations to complete
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'false')
    })
    // Button should be re-enabled
    expect(btn).not.toBeDisabled()
  })

  it('can be clicked multiple times (idempotent)', async () => {
    mockLocationHref('http://localhost:3000/game?seed=test')
    mockClipboard(vi.fn().mockResolvedValue(undefined))
    mockShareApi(undefined)

    render(<ShareOnSocial hasBingo={true} boardRef={{ current: document.createElement('div') }} />)

    // Set up download interception AFTER render
    interceptDownload()

    // First click
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(html2canvas).toHaveBeenCalledTimes(1)
    })

    // Second click
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(html2canvas).toHaveBeenCalledTimes(2)
    })
  })

  it('handles Web Share API AbortError gracefully', async () => {
    mockLocationHref('http://localhost:3000/game?seed=test')
    const writeText = vi.fn().mockResolvedValue(undefined)
    mockClipboard(writeText)
    const share = vi.fn().mockRejectedValue(new DOMException('User cancelled', 'AbortError'))
    mockShareApi(share)
    mockCanShare(true)

    render(<ShareOnSocial hasBingo={true} boardRef={{ current: document.createElement('div') }} />)
    fireEvent.click(screen.getByRole('button'))

    // User cancelled share sheet — should not show error, just go idle
    await waitFor(() => {
      expect(share).toHaveBeenCalled()
    })

    // Button should return to idle state (Share on Social)
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent(/share on social/i)
    })

    // Should NOT fall back to clipboard since user intentionally cancelled
    expect(writeText).not.toHaveBeenCalled()
  })

  it('has proper type="button" attribute', () => {
    render(<ShareOnSocial hasBingo={true} boardRef={{ current: document.createElement('div') }} />)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('calls html2canvas with a clone of the board element', async () => {
    const boardElement = document.createElement('div')
    boardElement.className = 'bingo-grid'

    mockLocationHref('http://localhost:3000/game?seed=test')
    mockClipboard(vi.fn().mockResolvedValue(undefined))
    mockShareApi(undefined)

    render(<ShareOnSocial hasBingo={true} boardRef={{ current: boardElement }} />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      // Should be called with an element that is a clone (different from boardElement)
      const calls = (html2canvas as ReturnType<typeof vi.fn>).mock.calls
      expect(calls.length).toBeGreaterThanOrEqual(1)
      const capturedEl = calls[0]![0] as HTMLElement
      expect(capturedEl).not.toBe(boardElement)
      expect(capturedEl.tagName).toBe('DIV')
      expect(html2canvas).toHaveBeenCalledWith(capturedEl, expect.any(Object))
    })
  })
})

describe('ShareOnSocial — visual feedback', () => {
  it('shows "Copied!" feedback after desktop share', async () => {
    mockLocationHref('http://localhost:3000/game?seed=test')
    mockClipboard(vi.fn().mockResolvedValue(undefined))
    mockShareApi(undefined)

    render(<ShareOnSocial hasBingo={true} boardRef={{ current: document.createElement('div') }} />)

    // Set up download interception AFTER render
    interceptDownload()

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent(/copied/i)
    })
  })

  it('reverts feedback after timeout', async () => {
    vi.useFakeTimers()
    mockLocationHref('http://localhost:3000/game?seed=test')
    mockClipboard(vi.fn().mockResolvedValue(undefined))
    mockShareApi(undefined)

    render(<ShareOnSocial hasBingo={true} boardRef={{ current: document.createElement('div') }} />)

    // Set up download interception AFTER render
    interceptDownload()

    fireEvent.click(screen.getByRole('button'))

    // Flush the async
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    // Should show "Copied!"
    expect(screen.getByRole('button')).toHaveTextContent(/copied/i)

    // Advance past feedback timeout (2s)
    act(() => {
      vi.advanceTimersByTime(2100)
    })

    // Should revert to "Share on Social"
    expect(screen.getByRole('button')).toHaveTextContent(/share on social/i)
  })
})

/**
 * Helper to intercept the download link creation.
 * Must be called AFTER render() so React can use appendChild normally.
 */
function interceptDownload() {
  const clickSpy = vi.fn()

  // Spy on createElement to intercept <a> elements
  const originalCreateElement = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    const el = originalCreateElement(tag)
    if (tag === 'a') {
      el.click = clickSpy
    }
    return el
  })

  // Only intercept appendChild/removeChild for anchor elements
  const origAppendChild = document.body.appendChild.bind(document.body)
  vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
    if (node instanceof Element && node.tagName === 'A') {
      return node as HTMLElement
    }
    return origAppendChild(node)
  })

  const origRemoveChild = document.body.removeChild.bind(document.body)
  vi.spyOn(document.body, 'removeChild').mockImplementation((node: Node) => {
    if (node instanceof Element && node.tagName === 'A') {
      return node as HTMLElement
    }
    return origRemoveChild(node)
  })

  return { clickSpy }
}
