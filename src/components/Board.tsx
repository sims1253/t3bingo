import { Square } from './Square'

interface BoardProps {
  /** Flat array of 25 bingo items (row-major order) */
  items: string[]
  /** Set of currently marked square indices */
  marks: Set<number>
  /** Callback when a square is clicked (receives the square index) */
  onToggle: (index: number) => void
}

/**
 * 5×5 bingo board rendered as a CSS grid.
 *
 * Each cell is a Square component (clickable <button> with mark toggle).
 * The grid is horizontally centered by its parent container.
 *
 * Uses role="group" (not role="grid") because all 25 squares are
 * individually Tab-focusable. A role="grid" would require arrow-key
 * navigation with roving tabindex, which we don't implement.
 */
export function Board({ items, marks, onToggle }: BoardProps) {
  return (
    <div
      className="bingo-grid grid grid-cols-5 gap-1.5 sm:gap-2 w-full"
      role="group"
      aria-label="Bingo board, 5 by 5 grid"
    >
      {items.map((item, index) => (
        <Square
          key={index}
          text={item}
          marked={marks.has(index)}
          onClick={() => onToggle(index)}
        />
      ))}
    </div>
  )
}
