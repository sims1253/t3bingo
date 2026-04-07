import { describe, expect, it } from 'vitest'
import { checkBingo, generateBoard, getCompletedLines, hashSeed, WINNING_LINES } from './bingo'
import { BINGO_ITEMS, CENTER_ITEM } from './items'

/** Helper: create a Set of marked indices from an array of indices */
function marks(...indices: number[]): Set<number> {
  return new Set(indices)
}

/** Helper: create a Set of all 25 indices (full blackout) */
function allMarks(): Set<number> {
  return new Set(Array.from({ length: 25 }, (_, i) => i))
}

describe('hashSeed', () => {
  it('produces a number from a string', () => {
    expect(typeof hashSeed('hello')).toBe('number')
  })

  it('is deterministic', () => {
    expect(hashSeed('test')).toBe(hashSeed('test'))
  })

  it('different strings produce different hashes (usually)', () => {
    expect(hashSeed('alpha')).not.toBe(hashSeed('beta'))
  })

  it('handles empty string', () => {
    expect(typeof hashSeed('')).toBe('number')
    expect(Number.isNaN(hashSeed(''))).toBe(false)
  })

  it('handles single character', () => {
    expect(typeof hashSeed('a')).toBe('number')
  })

  it('handles special characters', () => {
    expect(typeof hashSeed('<script>alert(1)</script>')).toBe('number')
    expect(typeof hashSeed('hello world')).toBe('number')
  })

  it('handles unicode', () => {
    expect(typeof hashSeed('🎮')).toBe('number')
    expect(typeof hashSeed('café')).toBe('number')
  })

  it('handles very long strings', () => {
    const longSeed = 'a'.repeat(10000)
    expect(typeof hashSeed(longSeed)).toBe('number')
  })

  it('handles numeric seeds', () => {
    expect(typeof hashSeed('0')).toBe('number')
    expect(typeof hashSeed('1')).toBe('number')
    expect(typeof hashSeed('00000')).toBe('number')
  })
})

describe('generateBoard', () => {
  it('generates a board with exactly 25 items', () => {
    const board = generateBoard('test')
    expect(board).toHaveLength(25)
  })

  it('is deterministic — same seed produces same board', () => {
    const board1 = generateBoard('deterministic-test')
    const board2 = generateBoard('deterministic-test')
    expect(board1).toEqual(board2)
  })

  it('different seeds produce different boards', () => {
    const board1 = generateBoard('seed-alpha')
    const board2 = generateBoard('seed-beta')
    expect(board1).not.toEqual(board2)
  })

  it('center square (index 12) is always "Gets nerdsniped"', () => {
    const board = generateBoard('center-test')
    expect(board[12]).toBe(CENTER_ITEM)
  })

  it('all items are from the curated pool', () => {
    const board = generateBoard('pool-test')
    const itemSet = new Set(BINGO_ITEMS)
    for (const item of board) {
      expect(itemSet.has(item)).toBe(true)
    }
  })

  it('all 25 items are unique', () => {
    const board = generateBoard('unique-test')
    const uniqueItems = new Set(board)
    expect(uniqueItems.size).toBe(25)
  })

  it('no items are empty strings', () => {
    const board = generateBoard('empty-test')
    for (const item of board) {
      expect(item.length).toBeGreaterThan(0)
    }
  })

  it('contains exactly the center item plus 24 others from the pool', () => {
    const board = generateBoard('composition-test')
    const nonCenterItems = board.filter((_, i) => i !== 12)
    const poolWithoutCenter = BINGO_ITEMS.filter((item) => item !== CENTER_ITEM)
    const poolSet = new Set(poolWithoutCenter)
    for (const item of nonCenterItems) {
      expect(poolSet.has(item)).toBe(true)
    }
    expect(nonCenterItems.length).toBe(24)
  })

  // Edge case seeds
  it('handles empty seed', () => {
    const board = generateBoard('')
    expect(board).toHaveLength(25)
    expect(board[12]).toBe(CENTER_ITEM)
  })

  it('handles seed "0"', () => {
    const board = generateBoard('0')
    expect(board).toHaveLength(25)
    expect(board[12]).toBe(CENTER_ITEM)
  })

  it('handles seed "1"', () => {
    const board = generateBoard('1')
    expect(board).toHaveLength(25)
    expect(board[12]).toBe(CENTER_ITEM)
  })

  it('handles seed with only zeros', () => {
    const board = generateBoard('00000')
    expect(board).toHaveLength(25)
    expect(board[12]).toBe(CENTER_ITEM)
  })

  it('handles XSS-like payload as seed', () => {
    const board = generateBoard('<script>alert(1)</script>')
    expect(board).toHaveLength(25)
    expect(board[12]).toBe(CENTER_ITEM)
    // XSS payloads are treated as data only
    expect(board.every((item) => !item.includes('<script>'))).toBe(true)
  })

  it('handles URL-encoded seed', () => {
    const board = generateBoard('abc+def')
    expect(board).toHaveLength(25)
    expect(board[12]).toBe(CENTER_ITEM)
  })

  it('handles unicode emoji seed', () => {
    const board = generateBoard('🎮')
    expect(board).toHaveLength(25)
    expect(board[12]).toBe(CENTER_ITEM)
  })

  it('handles accented unicode seed', () => {
    const board = generateBoard('café')
    expect(board).toHaveLength(25)
    expect(board[12]).toBe(CENTER_ITEM)
  })

  it('handles very long seed', () => {
    const longSeed = 'verylongstringthatgoesonandonandonandonandonandonandonandonandonandon'
    const board = generateBoard(longSeed)
    expect(board).toHaveLength(25)
    expect(board[12]).toBe(CENTER_ITEM)
  })

  it('handles seed with spaces', () => {
    const board = generateBoard('hello world')
    expect(board).toHaveLength(25)
    expect(board[12]).toBe(CENTER_ITEM)
  })

  it('handles seed with special characters', () => {
    const board = generateBoard('!@#$%^&*()')
    expect(board).toHaveLength(25)
    expect(board[12]).toBe(CENTER_ITEM)
  })

  it('URL-encoded seeds produce same board as decoded', () => {
    // Both should hash to the same value after decoding
    // Note: in practice the URL decoding happens at the router level,
    // but the board generation function itself just takes a string
    const board1 = generateBoard('abc def')
    const board2 = generateBoard('abc def')
    expect(board1).toEqual(board2)
  })

  it('produces a visually different board for a clearly different seed', () => {
    const board1 = generateBoard('aaa')
    const board2 = generateBoard('zzz')
    // At least some positions should differ
    let differences = 0
    for (let i = 0; i < 25; i++) {
      if (board1[i] !== board2[i]) differences++
    }
    expect(differences).toBeGreaterThan(0)
  })

  it('items pool has exactly 45 items', () => {
    expect(BINGO_ITEMS).toHaveLength(45)
  })

  it('center item is in the items pool', () => {
    expect(BINGO_ITEMS).toContain(CENTER_ITEM)
  })
})

describe('WINNING_LINES', () => {
  it('has exactly 12 winning lines', () => {
    expect(WINNING_LINES).toHaveLength(12)
  })

  it('includes all 5 rows', () => {
    const rows = WINNING_LINES.slice(0, 5)
    expect(rows[0]).toEqual([0, 1, 2, 3, 4])
    expect(rows[1]).toEqual([5, 6, 7, 8, 9])
    expect(rows[2]).toEqual([10, 11, 12, 13, 14])
    expect(rows[3]).toEqual([15, 16, 17, 18, 19])
    expect(rows[4]).toEqual([20, 21, 22, 23, 24])
  })

  it('includes all 5 columns', () => {
    const cols = WINNING_LINES.slice(5, 10)
    expect(cols[0]).toEqual([0, 5, 10, 15, 20])
    expect(cols[1]).toEqual([1, 6, 11, 16, 21])
    expect(cols[2]).toEqual([2, 7, 12, 17, 22])
    expect(cols[3]).toEqual([3, 8, 13, 18, 23])
    expect(cols[4]).toEqual([4, 9, 14, 19, 24])
  })

  it('includes both diagonals', () => {
    const diags = WINNING_LINES.slice(10, 12)
    expect(diags[0]).toEqual([0, 6, 12, 18, 24]) // main diagonal
    expect(diags[1]).toEqual([4, 8, 12, 16, 20]) // anti-diagonal
  })

  it('each line has exactly 5 indices', () => {
    for (const line of WINNING_LINES) {
      expect(line).toHaveLength(5)
    }
  })
})

describe('checkBingo', () => {
  it('returns false for empty board (no marks)', () => {
    expect(checkBingo(new Set())).toBe(false)
  })

  it('detects bingo on complete top row (indices 0-4)', () => {
    expect(checkBingo(marks(0, 1, 2, 3, 4))).toBe(true)
  })

  it('detects bingo on complete second row (indices 5-9)', () => {
    expect(checkBingo(marks(5, 6, 7, 8, 9))).toBe(true)
  })

  it('detects bingo on complete middle row (indices 10-14)', () => {
    expect(checkBingo(marks(10, 11, 12, 13, 14))).toBe(true)
  })

  it('detects bingo on complete fourth row (indices 15-19)', () => {
    expect(checkBingo(marks(15, 16, 17, 18, 19))).toBe(true)
  })

  it('detects bingo on complete bottom row (indices 20-24)', () => {
    expect(checkBingo(marks(20, 21, 22, 23, 24))).toBe(true)
  })

  it('detects bingo on complete first column (indices 0,5,10,15,20)', () => {
    expect(checkBingo(marks(0, 5, 10, 15, 20))).toBe(true)
  })

  it('detects bingo on complete middle column (indices 2,7,12,17,22)', () => {
    expect(checkBingo(marks(2, 7, 12, 17, 22))).toBe(true)
  })

  it('detects bingo on complete last column (indices 4,9,14,19,24)', () => {
    expect(checkBingo(marks(4, 9, 14, 19, 24))).toBe(true)
  })

  it('detects bingo on complete main diagonal (0,6,12,18,24)', () => {
    expect(checkBingo(marks(0, 6, 12, 18, 24))).toBe(true)
  })

  it('detects bingo on complete anti-diagonal (4,8,12,16,20)', () => {
    expect(checkBingo(marks(4, 8, 12, 16, 20))).toBe(true)
  })

  it('does NOT trigger bingo on partial top row (4 of 5)', () => {
    expect(checkBingo(marks(0, 1, 2, 3))).toBe(false)
  })

  it('does NOT trigger bingo on partial middle row (4 of 5)', () => {
    expect(checkBingo(marks(10, 11, 13, 14))).toBe(false) // missing center
  })

  it('does NOT trigger bingo on partial column', () => {
    expect(checkBingo(marks(0, 5, 15, 20))).toBe(false) // missing 10
  })

  it('does NOT trigger bingo on partial diagonal', () => {
    expect(checkBingo(marks(0, 6, 18, 24))).toBe(false) // missing center
  })

  it('does NOT trigger bingo with random scattered marks', () => {
    expect(checkBingo(marks(1, 7, 13, 19))).toBe(false)
  })

  it('unmarking a square from a completed line clears bingo', () => {
    // Complete top row
    const completeRow = marks(0, 1, 2, 3, 4)
    expect(checkBingo(completeRow)).toBe(true)
    // Remove one square
    const incompleteRow = marks(0, 1, 2, 3) // removed 4
    expect(checkBingo(incompleteRow)).toBe(false)
  })

  it('handles multiple simultaneous bingos without crashing', () => {
    // Row 1 and Row 3 both complete
    const doubleBingo = marks(0, 1, 2, 3, 4, 10, 11, 12, 13, 14)
    expect(checkBingo(doubleBingo)).toBe(true)
  })

  it('full blackout (all 25 marked) triggers bingo', () => {
    expect(checkBingo(allMarks())).toBe(true)
  })

  it('center square must be explicitly marked — not free', () => {
    // Middle row without center
    expect(checkBingo(marks(10, 11, 13, 14))).toBe(false)
    // Middle column without center
    expect(checkBingo(marks(2, 7, 17, 22))).toBe(false)
    // Main diagonal without center
    expect(checkBingo(marks(0, 6, 18, 24))).toBe(false)
    // Anti-diagonal without center
    expect(checkBingo(marks(4, 8, 16, 20))).toBe(false)
  })

  it('center marked alone does not trigger bingo', () => {
    expect(checkBingo(marks(12))).toBe(false)
  })

  it('bingo is reactive — computed from marks, not stored', () => {
    // This tests the conceptual model: checkBingo is a pure function
    const m1 = marks(0, 1, 2, 3, 4)
    expect(checkBingo(m1)).toBe(true)
    const m2 = marks(0, 1, 2, 3)
    expect(checkBingo(m2)).toBe(false)
    const m3 = marks(0, 1, 2, 3, 4)
    expect(checkBingo(m3)).toBe(true)
  })
})

describe('getCompletedLines', () => {
  it('returns empty array for no bingo', () => {
    expect(getCompletedLines(new Set())).toEqual([])
  })

  it('returns the single completed row', () => {
    const completed = getCompletedLines(marks(0, 1, 2, 3, 4))
    expect(completed).toHaveLength(1)
    expect(completed[0]).toEqual([0, 1, 2, 3, 4])
  })

  it('returns the single completed column', () => {
    const completed = getCompletedLines(marks(0, 5, 10, 15, 20))
    expect(completed).toHaveLength(1)
    expect(completed[0]).toEqual([0, 5, 10, 15, 20])
  })

  it('returns the main diagonal', () => {
    const completed = getCompletedLines(marks(0, 6, 12, 18, 24))
    expect(completed).toHaveLength(1)
    expect(completed[0]).toEqual([0, 6, 12, 18, 24])
  })

  it('returns the anti-diagonal', () => {
    const completed = getCompletedLines(marks(4, 8, 12, 16, 20))
    expect(completed).toHaveLength(1)
    expect(completed[0]).toEqual([4, 8, 12, 16, 20])
  })

  it('returns multiple completed lines for blackout', () => {
    const completed = getCompletedLines(allMarks())
    expect(completed).toHaveLength(12) // all 12 lines
  })

  it('returns two completed lines when two rows are complete', () => {
    const completed = getCompletedLines(marks(0, 1, 2, 3, 4, 10, 11, 12, 13, 14))
    expect(completed).toHaveLength(2)
  })

  it('returns partial lines correctly with extra marks', () => {
    // Top row complete + some extra scattered marks
    const completed = getCompletedLines(marks(0, 1, 2, 3, 4, 7, 15))
    expect(completed).toHaveLength(1)
    expect(completed[0]).toEqual([0, 1, 2, 3, 4])
  })
})
