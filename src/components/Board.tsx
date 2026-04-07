import { Square } from './Square'

interface BoardProps {
  /** Flat array of 25 bingo items (row-major order) */
  items: string[]
}

/**
 * 5×5 bingo board rendered as a CSS grid.
 *
 * Each cell is a Square component (clickable <button>).
 * The grid is horizontally centered by its parent container.
 */
export function Board({ items }: BoardProps) {
  return (
    <div
      className="grid grid-cols-5 gap-1 sm:gap-2"
      role="grid"
      aria-label="Bingo board"
    >
      {items.map((item, index) => (
        <Square key={index} text={item} />
      ))}
    </div>
  )
}
