import { describe, expect, it } from 'vitest'
import { generateRandomSeed, generateDifferentSeed } from './seed'

describe('generateRandomSeed', () => {
  it('produces a non-empty string', () => {
    const seed = generateRandomSeed()
    expect(seed).toBeTruthy()
    expect(typeof seed).toBe('string')
    expect(seed.length).toBe(10)
  })

  it('produces a string of the specified length', () => {
    expect(generateRandomSeed(5).length).toBe(5)
    expect(generateRandomSeed(20).length).toBe(20)
    expect(generateRandomSeed(1).length).toBe(1)
  })

  it('only contains alphanumeric characters', () => {
    const seed = generateRandomSeed(100)
    expect(seed).toMatch(/^[A-Za-z0-9]+$/)
  })

  it('generates different seeds on consecutive calls', () => {
    const seeds = new Set<string>()
    for (let i = 0; i < 10; i++) {
      seeds.add(generateRandomSeed())
    }
    // With 62^10 possible values, 10 seeds should all be unique
    expect(seeds.size).toBe(10)
  })

  it('handles rapid generation without errors', () => {
    // Simulate rapid clicking: generate many seeds in quick succession
    const seeds: string[] = []
    expect(() => {
      for (let i = 0; i < 50; i++) {
        seeds.push(generateRandomSeed())
      }
    }).not.toThrow()
    // All seeds should be valid
    seeds.forEach((seed) => {
      expect(seed).toBeTruthy()
      expect(seed).toMatch(/^[A-Za-z0-9]+$/)
    })
  })
})

describe('generateDifferentSeed', () => {
  it('produces a seed different from the current seed', () => {
    const currentSeed = 'abc123'
    const newSeed = generateDifferentSeed(currentSeed)
    expect(newSeed).not.toBe(currentSeed)
  })

  it('produces a valid non-empty seed', () => {
    const newSeed = generateDifferentSeed('some-seed')
    expect(newSeed).toBeTruthy()
    expect(newSeed).toMatch(/^[A-Za-z0-9]+$/)
  })

  it('works with empty current seed', () => {
    const newSeed = generateDifferentSeed('')
    expect(newSeed).toBeTruthy()
    expect(newSeed.length).toBe(10)
  })

  it('generates unique seeds for multiple consecutive calls', () => {
    const seeds = new Set<string>()
    let current = 'initial'
    for (let i = 0; i < 10; i++) {
      const next = generateDifferentSeed(current)
      seeds.add(next)
      current = next
    }
    // All 10 should be unique
    expect(seeds.size).toBe(10)
  })
})
