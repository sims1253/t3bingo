import { BINGO_ITEMS, CENTER_ITEM } from './items'

/**
 * All 12 possible winning lines on a 5×5 bingo board.
 *
 * Organized as: 5 rows, 5 columns, 2 diagonals.
 * Each line is an array of 5 indices into the flat 25-element board array.
 */
export const WINNING_LINES: readonly (readonly number[])[] = [
  // Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  // Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  // Diagonals
  [0, 6, 12, 18, 24], // main diagonal (top-left to bottom-right)
  [4, 8, 12, 16, 20], // anti-diagonal (top-right to bottom-left)
]

/**
 * Check if any winning line is fully marked.
 * Returns true if at least one complete line exists, false otherwise.
 * Pure function — bingo state is computed from marks, not stored.
 */
export function checkBingo(marks: Set<number>): boolean {
  return WINNING_LINES.some((line) => line.every((index) => marks.has(index)))
}

/**
 * Get all completed winning lines.
 * Returns an array of line index arrays that are fully marked.
 * Useful for highlighting which lines triggered bingo.
 */
export function getCompletedLines(marks: Set<number>): readonly (readonly number[])[] {
  return WINNING_LINES.filter((line) => line.every((index) => marks.has(index)))
}

/**
 * Hash a string seed to a 32-bit integer using a DJB2-like hash function.
 * Works with any string input including empty strings, Unicode, special chars.
 */
export function hashSeed(seed: string): number {
  let hash = 5381
  for (let i = 0; i < seed.length; i++) {
    // Use codePointAt for proper Unicode support (surrogate pairs)
    const codePoint = seed.codePointAt(i) ?? 0
    // For surrogate pairs, skip the next code unit (it's part of the same character)
    if (codePoint > 0xffff) {
      i++
    }
    hash = ((hash << 5) + hash + codePoint) | 0 // |0 keeps it as 32-bit int
  }
  // Ensure we always return a non-negative number
  return hash >>> 0
}

/**
 * Mulberry32 seeded PRNG — fast, deterministic, good distribution.
 * Returns a function that produces numbers in [0, 1).
 */
function mulberry32(seed: number): () => number {
  let state = seed | 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Shuffle an array in-place using a provided PRNG (Fisher-Yates).
 */
function shuffleWithPrng<T>(array: T[], rng: () => number): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[array[i], array[j]] = [array[j]!, array[i]!]
  }
  return array
}

/**
 * Generate a deterministic 5x5 bingo board (25 items) from a seed string.
 *
 * Algorithm:
 * 1. Hash the seed to a 32-bit integer
 * 2. Use mulberry32 PRNG with that hash
 * 3. Take all items except the center item (44 remaining)
 * 4. Shuffle those 44 items using the PRNG
 * 5. Take the first 24 items
 * 6. Insert the center item at position 12
 *
 * The center square (index 12) is ALWAYS "Gets nerdsniped".
 * The same seed always produces the same board.
 */
export function generateBoard(seed: string): string[] {
  const hash = hashSeed(seed)
  const rng = mulberry32(hash)

  // Get all items except the center item
  const otherItems = BINGO_ITEMS.filter((item) => item !== CENTER_ITEM)

  // Shuffle the remaining items
  const shuffled = shuffleWithPrng([...otherItems], rng)

  // Take first 24 items for the non-center positions
  const boardItems = shuffled.slice(0, 24)

  // Insert center item at position 12 (row 3, col 3 in 1-indexed)
  boardItems.splice(12, 0, CENTER_ITEM)

  return boardItems
}
