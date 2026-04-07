interface SquareProps {
  /** The bingo item text to display in this cell */
  text: string
}

/**
 * A single bingo board cell.
 *
 * Renders as a native <button> for keyboard/pointer accessibility.
 * Uses a minimum height rather than aspect-square so that longer
 * item labels can wrap naturally without being truncated.
 */
export function Square({ text }: SquareProps) {
  return (
    <button
      type="button"
      className={
        /* layout */
        'flex min-h-[4.5rem] sm:min-h-20 w-full items-center justify-center ' +
        'rounded-lg border border-[rgba(50,143,151,0.2)] bg-[var(--surface)] ' +
        /* text */
        'px-1.5 py-2 sm:px-2 sm:py-3 text-center text-[11px] sm:text-xs ' +
        'leading-snug font-medium text-[var(--sea-ink)] ' +
        /* interaction */
        'cursor-pointer transition-colors ' +
        'hover:bg-[rgba(79,184,178,0.12)] hover:border-[rgba(79,184,178,0.35)] ' +
        'focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] focus:ring-offset-1'
      }
      aria-label={text}
    >
      {text}
    </button>
  )
}
