import { useCallback, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { Camera, CheckCircle, Loader2, XCircle } from 'lucide-react'
import { createCaptureClone, removeCaptureClone } from '#/lib/capture'

/** States for the share button */
type ShareState = 'idle' | 'loading' | 'copied' | 'error'

/** Duration in ms to show feedback before reverting to idle */
const FEEDBACK_DURATION = 2000
/** Duration in ms to show error before clearing */
const ERROR_DURATION = 3000

interface ShareOnSocialProps {
  /** Whether bingo has been achieved */
  hasBingo: boolean
  /** Ref to the board DOM element for html2canvas capture */
  boardRef: React.RefObject<HTMLElement | null>
}

/**
 * Share on Social button that captures the bingo board as a PNG image
 * using html2canvas and shares it.
 *
 * Behavior:
 * - Only visible when hasBingo is true
 * - Uses html2canvas to capture the board element
 * - On desktop (no navigator.share): downloads the PNG + copies URL to clipboard
 * - On mobile (navigator.share available): uses Web Share API with image + URL
 * - Shows loading spinner during image generation
 * - Shows error message if html2canvas fails
 * - Board state is not altered by sharing
 * - Can be clicked multiple times (idempotent)
 * - Keyboard accessible with proper ARIA attributes
 */
export function ShareOnSocial({ hasBingo, boardRef }: ShareOnSocialProps) {
  const [shareState, setShareState] = useState<ShareState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resetAfterDelay = useCallback(
    (duration: number) => {
      clearTimers()
      timerRef.current = setTimeout(() => {
        setShareState('idle')
        setErrorMsg(null)
        timerRef.current = null
      }, duration)
    },
    [clearTimers],
  )

  const handleShare = useCallback(async () => {
    if (shareState === 'loading') return
    if (!boardRef.current) return

    setShareState('loading')
    setErrorMsg(null)
    clearTimers()

    try {
      // html2canvas cannot resolve CSS custom properties (var(--*)).
      // Create an offscreen clone with resolved inline styles for capture.
      const clone = createCaptureClone(boardRef.current)

      // Capture the clone using html2canvas
      const canvas = await html2canvas(clone, {
        backgroundColor: null,
        scale: 2, // Higher resolution for better quality
        useCORS: true,
        logging: false,
      }).finally(() => {
        removeCaptureClone(clone)
      })

      const url = window.location.href

      // Check if Web Share API with files is available (mobile)
      const canShareFiles =
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function'

      if (canShareFiles) {
        // Convert canvas to blob for Web Share API
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => {
              if (b) resolve(b)
              else reject(new Error('Failed to create image'))
            },
            'image/png',
            1.0,
          )
        })

        const file = new File([blob], 't3bingo-board.png', { type: 'image/png' })
        const shareData = {
          title: 't3bingo — Theo Twitch Bingo',
          text: 'Check out my t3bingo bingo board!',
          url,
          files: [file],
        }

        // Check if sharing files is supported
        if (navigator.canShare!(shareData)) {
          try {
            const controller = new AbortController()
            abortControllerRef.current = controller
            await navigator.share(shareData)
            setShareState('copied')
            resetAfterDelay(FEEDBACK_DURATION)
            return
          } catch (err) {
            // User cancelled the share sheet
            if (err instanceof DOMException && err.name === 'AbortError') {
              setShareState('idle')
              return
            }
            // Other Web Share errors — fall through to desktop fallback
          }
        }
      }

      // Desktop fallback: download image + copy URL to clipboard
      // Download the image
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 't3bingo-board.png'
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Copy URL to clipboard
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(url)
          setShareState('copied')
          resetAfterDelay(FEEDBACK_DURATION)
        } catch {
          // Clipboard failed but download succeeded — still show some feedback
          setShareState('copied')
          resetAfterDelay(FEEDBACK_DURATION)
        }
      } else {
        // Download succeeded, no clipboard available
        setShareState('copied')
        resetAfterDelay(FEEDBACK_DURATION)
      }
    } catch (err) {
      // html2canvas failed or other error
      const message =
        err instanceof Error ? err.message : 'Failed to generate image'
      setErrorMsg(`Failed to generate image: ${message}`)
      setShareState('error')
      resetAfterDelay(ERROR_DURATION)
    }
  }, [shareState, boardRef, resetAfterDelay, clearTimers])

  // Don't render if no bingo
  if (!hasBingo) return null

  const isLoading = shareState === 'loading'
  const label =
    shareState === 'loading'
      ? 'Generating…'
      : shareState === 'copied'
        ? 'Copied!'
        : shareState === 'error'
          ? 'Share on Social'
          : 'Share on Social'

  const Icon =
    shareState === 'loading'
      ? Loader2
      : shareState === 'copied'
        ? CheckCircle
        : shareState === 'error'
          ? XCircle
          : Camera

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleShare}
        disabled={isLoading}
        aria-label="Share bingo board as image on social media"
        aria-busy={isLoading}
        className={
          'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-5 py-3 ' +
          'text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 ' +
          (shareState === 'copied'
            ? 'border-[var(--accent)]/40 bg-[var(--accent-glow)] text-[var(--accent)] '
            : shareState === 'error'
              ? 'border-[var(--destructive)]/40 bg-[var(--destructive)]/10 text-[var(--destructive)] '
              : 'border-[var(--accent)]/30 bg-[var(--accent)] text-white hover:bg-[var(--accent-dim)] hover:border-[var(--accent)]/50 '
          ) +
          (isLoading ? 'opacity-60 cursor-not-allowed' : '')
        }
      >
        <Icon
          className={'h-4 w-4' + (isLoading ? ' animate-spin' : '')}
          aria-hidden="true"
        />
        {label}
      </button>
      {errorMsg && (
        <p
          role="alert"
          aria-live="polite"
          className="text-xs text-[var(--destructive)]"
        >
          {errorMsg}
        </p>
      )}
    </div>
  )
}
