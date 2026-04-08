import { useCallback, useRef, useState } from 'react'
import { Share2, CheckCircle, XCircle } from 'lucide-react'

/** Feedback states for the share button */
type ShareState = 'idle' | 'copied' | 'error'

/** Duration in ms to show feedback before reverting to idle */
const FEEDBACK_DURATION = 2000

/**
 * Share button that copies the current page URL to clipboard or uses Web Share API.
 *
 * Behavior:
 * - Uses Web Share API (navigator.share) when available (typically mobile)
 * - Falls back to Clipboard API (navigator.clipboard.writeText)
 * - Shows "Copied!" feedback for 2 seconds, then reverts
 * - Shows error feedback if both methods fail
 * - Handles AbortError from Web Share API gracefully (user cancelled = no error)
 * - Disabled during share operation to prevent double-clicks
 * - Does not alter board state
 */
interface ShareButtonProps {
  /** Whether bingo has been achieved — elevates visual weight */
  hasBingo?: boolean
}

export function ShareButton({ hasBingo = false }: ShareButtonProps) {
  const [shareState, setShareState] = useState<ShareState>('idle')
  const [disabled, setDisabled] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetAfterDelay = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setShareState('idle')
      timerRef.current = null
    }, FEEDBACK_DURATION)
  }, [])

  const handleShare = useCallback(async () => {
    // Prevent double clicks
    if (disabled) return
    setDisabled(true)

    const url = window.location.href

    try {
      // Try Web Share API first (available on mobile)
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({
            title: 't3bingo — Theo Twitch Bingo',
            url,
          })
          // Web Share succeeded (or user completed share sheet)
          setShareState('copied')
          resetAfterDelay()
          return
        } catch (err) {
          // User cancelled the share sheet — not an error, just revert
          if (err instanceof DOMException && err.name === 'AbortError') {
            setShareState('idle')
            return
          }
          // Other Web Share errors — fall through to clipboard
        }
      }

      // Try Clipboard API
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        setShareState('copied')
        resetAfterDelay()
        return
      }

      // Neither API available
      setShareState('error')
      resetAfterDelay()
    } catch {
      // Clipboard API rejected or failed
      setShareState('error')
      resetAfterDelay()
    } finally {
      setDisabled(false)
    }
  }, [disabled, resetAfterDelay])

  const label = shareState === 'copied' ? 'Copied!' : shareState === 'error' ? 'Could not copy' : 'Share'

  const Icon = shareState === 'copied' ? CheckCircle : shareState === 'error' ? XCircle : Share2

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={disabled}
      aria-label={label}
      className={
        'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-5 py-2.5 ' +
        'text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 ' +
        (shareState === 'copied'
          ? 'border-[var(--accent)]/40 bg-[var(--accent-glow)] text-[var(--accent)] '
          : shareState === 'error'
            ? 'border-[var(--destructive)]/40 bg-[var(--destructive)]/10 text-[var(--destructive)] '
            : hasBingo
              ? 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] '
              : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] '
        ) +
        (disabled ? 'opacity-60 cursor-not-allowed' : '')
      }
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  )
}
