/**
 * Random seed generation for bingo games.
 *
 * Seeds are used as URL search params to deterministically generate boards.
 * Each new game gets a fresh random seed, ensuring different boards.
 */

/**
 * Generate a cryptographically random seed string.
 *
 * Uses `crypto.getRandomValues` for unbiased randomness.
 * The seed is an alphanumeric string of the specified length.
 *
 * @param length - Number of characters in the seed (default: 10)
 * @returns A random alphanumeric string
 */
export function generateRandomSeed(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => chars[byte % chars.length]!).join('')
}

/**
 * Generate a new random seed that is guaranteed to differ from the current seed.
 *
 * In practice, collisions are astronomically unlikely (62^10 ≈ 8.4×10^17),
 * but we explicitly check and regenerate to be safe.
 *
 * @param currentSeed - The current seed to avoid duplicating
 * @param maxAttempts - Maximum regeneration attempts before giving up (default: 10)
 * @returns A random seed string different from currentSeed
 */
export function generateDifferentSeed(currentSeed: string, maxAttempts: number = 10): string {
  let newSeed = generateRandomSeed()
  let attempts = 0
  while (newSeed === currentSeed && attempts < maxAttempts) {
    newSeed = generateRandomSeed()
    attempts++
  }
  return newSeed
}
