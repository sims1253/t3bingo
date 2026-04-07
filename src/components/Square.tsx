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
        /* layout */
        'relative flex min-h-[4.5rem] sm:min-h-20 w-full items-center justify-center ' +
        'rounded-lg border px-1.5 py-2 sm:px-2 sm:py-3 ' +
        /* text */
        'text-center text-[11px] sm:text-xs leading-snug font-medium ' +
        /* interaction */
        'cursor-pointer transition-all duration-150 ' +
        'focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] focus:ring-offset-1 ' +
        /* unmarked state */
        (marked
          ? 'border-[var(--lagoon)] bg-[var(--lagoon)]/20 text-[var(--sea-ink)] ' +
            'hover:bg-[var(--lagoon)]/30 hover:border-[var(--lagoon-deep)]'
          : 'border-[rgba(50,143,151,0.2)] bg-[var(--surface)] text-[var(--sea-ink)] ' +
            'hover:bg-[rgba(79,184,178,0.12)] hover:border-[rgba(79,184,178,0.35)]')
      }
    >
      {/* Checkmark stamp — visible only when marked, provides non-color indicator */}
      {marked && (
        <span
          className="absolute top-0.5 right-1 text-[var(--lagoon-deep)] text-sm sm:text-base font-bold select-none"
          aria-hidden="true"
        >
          ✓
        </span>
      )}
      <span className={marked ? 'line-through opacity-80' : ''}>{text}</span>
    </button>
  )
}
