import { BINGO_ITEMS, CENTER_ITEM } from './items'

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
