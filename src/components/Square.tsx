interface SquareProps {
  /** The bingo item text to display in this cell */
  text: string
  /** Whether this square is currently marked */
  marked: boolean
  /** Callback when the square is clicked */
  onClick: () => void
}

/**
 * A single bingo board cell with mark/unmark toggle.
 *
 * Renders as a native <button> for keyboard/pointer accessibility.
 * Uses aria-pressed to communicate marked state to assistive technology.
 * Marked state is shown via background color change AND a checkmark icon,
 * ensuring the state is not indicated by color alone.
 */
export function Square({ text, marked, onClick }: SquareProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={marked}
      aria-label={text}
      className={
        'bingo-cell relative flex w-full flex-col items-center justify-center ' +
        'rounded-lg border px-1.5 py-1 ' +
        'text-center text-[11px] sm:text-sm leading-snug font-medium ' +
        'cursor-pointer transition-all duration-150 ' +
        'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:ring-offset-1 focus:ring-offset-[var(--bg)] ' +
        (marked
          ? 'border-[var(--marked-border)] bg-[var(--marked-bg)] text-[var(--text-primary)] mark-pop ' +
            'hover:bg-[var(--accent-glow-strong)] hover:border-[var(--accent-dim)]'
          : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] ' +
            'hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]')
      }
    >
      {marked && (
        <span
          className="absolute top-0.5 right-1 text-[var(--accent)] text-xs sm:text-sm font-bold select-none"
          aria-hidden="true"
        >
          &#x2713;
        </span>
      )}
      <span className={marked ? 'line-through opacity-60' : ''}>{text}</span>
    </button>
  )
}
