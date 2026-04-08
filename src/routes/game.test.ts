/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

/**
 * Tests for the game route's search param schema.
 *
 * These tests verify the edge-case seed handling fixes:
 * 1. Numeric seeds (0, 1) are accepted without crashing or URL re-serialization
 * 2. Missing seed param defaults to empty string
 * 3. Empty seed param stays as empty string
 * 4. Normal string seeds pass through unchanged
 * 5. Special characters and Unicode work correctly
 *
 * Key insight: TanStack Router's qss.toValue() coerces purely numeric query
 * params to numbers (e.g. seed=0 → 0). The schema uses z.union to accept both
 * types without transforming, preventing TanStack Router from re-serializing
 * the URL with JSON.stringify quotes (seed=%220%22).
 */

// Replicate the schema from game.tsx to test it in isolation
const gameSearchSchema = z.object({
  seed: z.union([z.string(), z.number()]).optional().default(''),
})

describe('gameSearchSchema — numeric seed handling', () => {
  it('accepts number 0 without transforming (prevents URL re-serialization)', () => {
    const result = gameSearchSchema.parse({ seed: 0 })
    expect(result.seed).toBe(0)
    expect(typeof result.seed).toBe('number')
  })

  it('accepts number 1 without transforming', () => {
    const result = gameSearchSchema.parse({ seed: 1 })
    expect(result.seed).toBe(1)
    expect(typeof result.seed).toBe('number')
  })

  it('accepts large number without transforming', () => {
    const result = gameSearchSchema.parse({ seed: 123456789 })
    expect(result.seed).toBe(123456789)
    expect(typeof result.seed).toBe('number')
  })

  it('preserves string "0" unchanged', () => {
    const result = gameSearchSchema.parse({ seed: '0' })
    expect(result.seed).toBe('0')
    expect(typeof result.seed).toBe('string')
  })

  it('preserves string "1" unchanged', () => {
    const result = gameSearchSchema.parse({ seed: '1' })
    expect(result.seed).toBe('1')
    expect(typeof result.seed).toBe('string')
  })
})

describe('gameSearchSchema — missing and empty seed', () => {
  it('defaults undefined (no seed param) to empty string', () => {
    const result = gameSearchSchema.parse({ seed: undefined })
    expect(result.seed).toBe('')
  })

  it('preserves empty string seed param', () => {
    const result = gameSearchSchema.parse({ seed: '' })
    expect(result.seed).toBe('')
  })

  it('handles object without seed key (defaults to empty string)', () => {
    const result = gameSearchSchema.parse({})
    expect(result.seed).toBe('')
  })
})

describe('gameSearchSchema — normal seeds pass through', () => {
  it('handles normal alphanumeric seed', () => {
    const result = gameSearchSchema.parse({ seed: 'abc123XYZ' })
    expect(result.seed).toBe('abc123XYZ')
  })

  it('handles special characters in seed', () => {
    const result = gameSearchSchema.parse({ seed: '<script>alert(1)</script>' })
    expect(result.seed).toBe('<script>alert(1)</script>')
  })

  it('handles URL-encoded characters', () => {
    const result = gameSearchSchema.parse({ seed: 'abc+def' })
    expect(result.seed).toBe('abc+def')
  })

  it('handles unicode emoji seed', () => {
    const result = gameSearchSchema.parse({ seed: '🎮' })
    expect(result.seed).toBe('🎮')
  })

  it('handles accented unicode seed', () => {
    const result = gameSearchSchema.parse({ seed: 'café' })
    expect(result.seed).toBe('café')
  })

  it('handles very long seed', () => {
    const longSeed = 'verylongstringthatgoesonandonandonandonandonandonandonandonandonandon'
    const result = gameSearchSchema.parse({ seed: longSeed })
    expect(result.seed).toBe(longSeed)
  })

  it('handles seed with spaces', () => {
    const result = gameSearchSchema.parse({ seed: 'hello world' })
    expect(result.seed).toBe('hello world')
  })

  it('handles seed with all zeros', () => {
    const result = gameSearchSchema.parse({ seed: '00000' })
    expect(result.seed).toBe('00000')
  })

  it('handles seed that is a single character', () => {
    const result = gameSearchSchema.parse({ seed: 'a' })
    expect(result.seed).toBe('a')
  })
})

describe('gameSearchSchema — beforeLoad redirect logic', () => {
  // These tests verify the logic used in beforeLoad:
  // if (search.seed === '' || search.seed === undefined) { redirect }

  it('empty string triggers redirect condition', () => {
    const result = gameSearchSchema.parse({})
    expect(result.seed === '' || result.seed === undefined).toBe(true)
  })

  it('undefined triggers redirect condition', () => {
    const result = gameSearchSchema.parse({ seed: undefined })
    expect(result.seed === '' || result.seed === undefined).toBe(true)
  })

  it('number 0 does NOT trigger redirect (!0 is true, but 0 !== "" and 0 !== undefined)', () => {
    const result = gameSearchSchema.parse({ seed: 0 })
    expect(result.seed === '' || result.seed === undefined).toBe(false)
  })

  it('string "0" does NOT trigger redirect', () => {
    const result = gameSearchSchema.parse({ seed: '0' })
    expect(result.seed === '' || result.seed === undefined).toBe(false)
  })

  it('normal string does NOT trigger redirect', () => {
    const result = gameSearchSchema.parse({ seed: 'abc' })
    expect(result.seed === '' || result.seed === undefined).toBe(false)
  })
})

describe('gameSearchSchema — deterministic board generation from numeric seeds', () => {
  it('numeric seed 0 produces a valid board after String() conversion', async () => {
    const { generateBoard } = await import('#/lib/bingo')
    const seed = String(0) // Simulates component's String(rawSeed ?? '')
    const board = generateBoard(seed)
    expect(board).toHaveLength(25)
  })

  it('numeric seed 1 produces a valid board after String() conversion', async () => {
    const { generateBoard } = await import('#/lib/bingo')
    const seed = String(1)
    const board = generateBoard(seed)
    expect(board).toHaveLength(25)
  })

  it('numeric seed conversion is deterministic', async () => {
    const { generateBoard } = await import('#/lib/bingo')
    const board1 = generateBoard(String(0))
    const board2 = generateBoard(String(0))
    expect(board1).toEqual(board2)
  })

  it('different numeric seeds produce different boards', async () => {
    const { generateBoard } = await import('#/lib/bingo')
    const board0 = generateBoard(String(0))
    const board1 = generateBoard(String(1))
    expect(board0).not.toEqual(board1)
  })
})
