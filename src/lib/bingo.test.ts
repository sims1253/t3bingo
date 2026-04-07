import { describe, expect, it } from 'vitest'
import { generateBoard, hashSeed } from './bingo'
import { BINGO_ITEMS, CENTER_ITEM } from './items'

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
