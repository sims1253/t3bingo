import { describe, expect, it } from 'vitest'
import {
  getMarksKey,
  loadMarks,
  MARKS_KEY_PREFIX,
  parseMarks,
  saveMarks,
  serializeMarks,
  toggleMark,
} from './marks'

describe('getMarksKey', () => {
  it('prefixes the seed with the correct key prefix', () => {
    expect(getMarksKey('abc')).toBe('t3ingo-marks-abc')
  })

  it('handles empty seed', () => {
    expect(getMarksKey('')).toBe('t3ingo-marks-')
  })

  it('handles unicode seed', () => {
    expect(getMarksKey('🎮')).toBe('t3ingo-marks-🎮')
  })

  it('uses the MARKS_KEY_PREFIX constant', () => {
    expect(getMarksKey('test')).toBe(`${MARKS_KEY_PREFIX}test`)
  })
})

describe('parseMarks', () => {
  it('returns empty set for null', () => {
    expect(parseMarks(null)).toEqual(new Set())
  })

  it('returns empty set for empty string', () => {
    expect(parseMarks('')).toEqual(new Set())
  })

  it('parses a valid JSON array of indices', () => {
    expect(parseMarks('[0, 5, 12]')).toEqual(new Set([0, 5, 12]))
  })

  it('returns empty set for invalid JSON', () => {
    expect(parseMarks('not json')).toEqual(new Set())
  })

  it('returns empty set for non-array JSON', () => {
    expect(parseMarks('{"a":1}')).toEqual(new Set())
  })

  it('filters out non-integer numbers', () => {
    expect(parseMarks('[1.5, 2.7]')).toEqual(new Set())
  })

  it('filters out negative indices', () => {
    expect(parseMarks('[-1, 5]')).toEqual(new Set([5]))
  })

  it('filters out indices >= 25', () => {
    expect(parseMarks('[0, 25, 100]')).toEqual(new Set([0]))
  })

  it('filters out non-number entries', () => {
    expect(parseMarks('[0, "a", 5, true]')).toEqual(new Set([0, 5]))
  })

  it('handles empty array', () => {
    expect(parseMarks('[]')).toEqual(new Set())
  })

  it('handles single index', () => {
    expect(parseMarks('[12]')).toEqual(new Set([12]))
  })

  it('handles all 25 indices', () => {
    const all = Array.from({ length: 25 }, (_, i) => i)
    expect(parseMarks(JSON.stringify(all))).toEqual(new Set(all))
  })
})

describe('serializeMarks', () => {
  it('serializes an empty set to empty array', () => {
    expect(serializeMarks(new Set())).toBe('[]')
  })

  it('serializes indices in sorted order', () => {
    expect(serializeMarks(new Set([5, 0, 12]))).toBe('[0,5,12]')
  })

  it('round-trips with parseMarks', () => {
    const original = new Set([0, 3, 7, 12, 24])
    const serialized = serializeMarks(original)
    const parsed = parseMarks(serialized)
    expect(parsed).toEqual(original)
  })
})

describe('toggleMark', () => {
  it('adds a mark to empty set', () => {
    const result = toggleMark(new Set(), 5)
    expect(result).toEqual(new Set([5]))
  })

  it('removes a mark from a set that has it', () => {
    const result = toggleMark(new Set([5, 12]), 5)
    expect(result).toEqual(new Set([12]))
  })

  it('does not mutate the original set', () => {
    const original = new Set([5])
    const result = toggleMark(original, 5)
    expect(original).toEqual(new Set([5]))
    expect(result).toEqual(new Set())
  })

  it('toggles index 0 (first square)', () => {
    const result = toggleMark(new Set(), 0)
    expect(result).toEqual(new Set([0]))
  })

  it('toggles index 24 (last square)', () => {
    const result = toggleMark(new Set(), 24)
    expect(result).toEqual(new Set([24]))
  })

  it('toggles center square (index 12)', () => {
    const result = toggleMark(new Set(), 12)
    expect(result).toEqual(new Set([12]))
  })

  it('rapid toggling — 5 clicks results in marked (odd)', () => {
    let marks = new Set<number>()
    for (let i = 0; i < 5; i++) {
      marks = toggleMark(marks, 7)
    }
    expect(marks.has(7)).toBe(true)
  })

  it('rapid toggling — 4 clicks results in unmarked (even)', () => {
    let marks = new Set<number>()
    for (let i = 0; i < 4; i++) {
      marks = toggleMark(marks, 7)
    }
    expect(marks.has(7)).toBe(false)
  })

  it('toggling one index does not affect others', () => {
    const initial = new Set([0, 5, 10, 15, 20])
    const result = toggleMark(initial, 12)
    expect(result).toEqual(new Set([0, 5, 10, 12, 15, 20]))
    // Original indices are untouched
    expect(result.has(0)).toBe(true)
    expect(result.has(5)).toBe(true)
    expect(result.has(10)).toBe(true)
    expect(result.has(15)).toBe(true)
    expect(result.has(20)).toBe(true)
  })

  it('can mark all 25 squares independently', () => {
    let marks = new Set<number>()
    for (let i = 0; i < 25; i++) {
      marks = toggleMark(marks, i)
    }
    expect(marks.size).toBe(25)
    for (let i = 0; i < 25; i++) {
      expect(marks.has(i)).toBe(true)
    }
  })

  it('can unmark all 25 squares after marking them', () => {
    let marks = new Set<number>()
    // Mark all
    for (let i = 0; i < 25; i++) {
      marks = toggleMark(marks, i)
    }
    expect(marks.size).toBe(25)
    // Unmark all
    for (let i = 0; i < 25; i++) {
      marks = toggleMark(marks, i)
    }
    expect(marks.size).toBe(0)
  })
})

describe('loadMarks', () => {
  it('returns empty set when key not found', () => {
    const storage = new Map<string, string>()
    const getItem = (key: string) => storage.get(key) ?? null
    expect(loadMarks('test', getItem)).toEqual(new Set())
  })

  it('loads marks from storage', () => {
    const storage = new Map<string, string>()
    storage.set('t3ingo-marks-test', '[0, 5, 12]')
    const getItem = (key: string) => storage.get(key) ?? null
    expect(loadMarks('test', getItem)).toEqual(new Set([0, 5, 12]))
  })

  it('handles corrupt data gracefully', () => {
    const storage = new Map<string, string>()
    storage.set('t3ingo-marks-test', 'corrupt{')
    const getItem = (key: string) => storage.get(key) ?? null
    expect(loadMarks('test', getItem)).toEqual(new Set())
  })
})

describe('saveMarks', () => {
  it('persists marks to storage', () => {
    const storage = new Map<string, string>()
    const setItem = (key: string, value: string) => storage.set(key, value)
    saveMarks('test', new Set([0, 5, 12]), setItem)
    expect(storage.get('t3ingo-marks-test')).toBe('[0,5,12]')
  })

  it('persists empty marks as empty array', () => {
    const storage = new Map<string, string>()
    const setItem = (key: string, value: string) => storage.set(key, value)
    saveMarks('test', new Set(), setItem)
    expect(storage.get('t3ingo-marks-test')).toBe('[]')
  })

  it('round-trips: save then load', () => {
    const storage = new Map<string, string>()
    const getItem = (key: string) => storage.get(key) ?? null
    const setItem = (key: string, value: string) => storage.set(key, value)

    const original = new Set([0, 3, 7, 12, 24])
    saveMarks('myseed', original, setItem)
    const loaded = loadMarks('myseed', getItem)
    expect(loaded).toEqual(original)
  })

  it('different seeds use different keys', () => {
    const storage = new Map<string, string>()
    const setItem = (key: string, value: string) => storage.set(key, value)

    saveMarks('seed-a', new Set([0]), setItem)
    saveMarks('seed-b', new Set([1]), setItem)

    expect(storage.get('t3ingo-marks-seed-a')).toBe('[0]')
    expect(storage.get('t3ingo-marks-seed-b')).toBe('[1]')
  })
})
