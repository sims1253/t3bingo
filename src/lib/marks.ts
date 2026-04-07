/**
 * Mark state management for bingo squares.
 *
 * Mark state is stored in sessionStorage keyed by seed, e.g.
 * `t3ingo-marks-{seed}`. The value is a JSON array of marked indices.
 *
 * This module provides pure functions for managing mark state.
 * All session storage access is isolated in load/save functions
 * for easy testing.
 */

/** Session storage key prefix */
export const MARKS_KEY_PREFIX = 't3ingo-marks-'

/** Build the full sessionStorage key for a given seed */
export function getMarksKey(seed: string): string {
  return `${MARKS_KEY_PREFIX}${seed}`
}

/** Parse raw marks from JSON string, returns a Set of indices */
export function parseMarks(raw: string | null): Set<number> {
  if (!raw) return new Set()
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    const valid = parsed.filter(
      (n): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < 25,
    )
    return new Set(valid)
  } catch {
    return new Set()
  }
}

/** Serialize a Set of marked indices to a JSON string */
export function serializeMarks(marks: Set<number>): string {
  return JSON.stringify([...marks].sort((a, b) => a - b))
}

/** Toggle a single index in the marks set */
export function toggleMark(marks: Set<number>, index: number): Set<number> {
  const next = new Set(marks)
  if (next.has(index)) {
    next.delete(index)
  } else {
    next.add(index)
  }
  return next
}

/** Load marks from a storage-like interface (for testability) */
export function loadMarks(
  seed: string,
  getItem: (key: string) => string | null,
): Set<number> {
  return parseMarks(getItem(getMarksKey(seed)))
}

/** Save marks to a storage-like interface (for testability) */
export function saveMarks(
  seed: string,
  marks: Set<number>,
  setItem: (key: string, value: string) => void,
): void {
  setItem(getMarksKey(seed), serializeMarks(marks))
}
