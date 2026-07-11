/**
 * timerEngine.test.ts
 * Comprehensive unit tests for the pure-logic timer engine.
 * No UI imports — pure function coverage only.
 *
 * Acceptance criteria covered:
 *  ✓ getModeDuration: all three modes return correct seconds
 *  ✓ getNextMode from Focus: focusCount 1,2,3 → ShortBreak
 *  ✓ getNextMode from Focus: focusCount 4,8,12 → LongBreak (multiples of 4 > 0)
 *  ✓ getNextMode from ShortBreak → always Focus, focusCount unchanged
 *  ✓ getNextMode from LongBreak  → always Focus, focusCount unchanged
 *  ✓ Edge: focusCount 0 after Focus → ShortBreak (not a long break)
 */

import { describe, it, expect } from 'vitest'
import { getModeDuration, getNextMode, type Mode } from '../timerEngine'

// ── getModeDuration ────────────────────────────────────────────────────────

describe('getModeDuration', () => {
  it('returns 1500 seconds (25 min) for focus mode', () => {
    expect(getModeDuration('focus')).toBe(1500)
  })

  it('returns 300 seconds (5 min) for short-break mode', () => {
    expect(getModeDuration('short')).toBe(300)
  })

  it('returns 900 seconds (15 min) for long-break mode', () => {
    expect(getModeDuration('long')).toBe(900)
  })

  // Parametrised table — all three modes in one sweep
  it.each<[Mode, number]>([
    ['focus', 1500],
    ['short', 300],
    ['long',  900],
  ])('getModeDuration(%s) === %i', (mode, expected) => {
    expect(getModeDuration(mode)).toBe(expected)
  })
})

// ── getNextMode — from Focus ───────────────────────────────────────────────

describe('getNextMode — from Focus mode', () => {
  // Short-break cases: focusCount 1, 2, 3 (not multiples of 4)
  it.each([1, 2, 3])(
    'focusCount=%i → ShortBreak (not a multiple of 4)',
    (focusCount) => {
      const result = getNextMode('focus', focusCount)
      expect(result.nextMode).toBe('short')
      expect(result.nextFocusCount).toBe(focusCount)
    },
  )

  // Long-break cases: focusCount 4, 8, 12 (positive multiples of 4)
  it.each([4, 8, 12])(
    'focusCount=%i → LongBreak (positive multiple of 4)',
    (focusCount) => {
      const result = getNextMode('focus', focusCount)
      expect(result.nextMode).toBe('long')
      expect(result.nextFocusCount).toBe(focusCount)
    },
  )

  // Explicit individual assertions for the required counts
  it('focusCount=4 → LongBreak', () => {
    expect(getNextMode('focus', 4)).toEqual({ nextMode: 'long', nextFocusCount: 4 })
  })

  it('focusCount=8 → LongBreak', () => {
    expect(getNextMode('focus', 8)).toEqual({ nextMode: 'long', nextFocusCount: 8 })
  })

  it('focusCount=12 → LongBreak', () => {
    expect(getNextMode('focus', 12)).toEqual({ nextMode: 'long', nextFocusCount: 12 })
  })

  it('focusCount=1 → ShortBreak', () => {
    expect(getNextMode('focus', 1)).toEqual({ nextMode: 'short', nextFocusCount: 1 })
  })

  it('focusCount=2 → ShortBreak', () => {
    expect(getNextMode('focus', 2)).toEqual({ nextMode: 'short', nextFocusCount: 2 })
  })

  it('focusCount=3 → ShortBreak', () => {
    expect(getNextMode('focus', 3)).toEqual({ nextMode: 'short', nextFocusCount: 3 })
  })

  // Edge: focusCount=0 satisfies 0 % 4 === 0 but the > 0 guard must prevent LongBreak
  it('focusCount=0 → ShortBreak (edge: 0 % 4 === 0 but > 0 guard prevents LongBreak)', () => {
    const result = getNextMode('focus', 0)
    expect(result.nextMode).toBe('short')
    expect(result.nextFocusCount).toBe(0)
  })

  // focusCount is passed through unchanged (caller manages incrementing)
  it('does not mutate focusCount when returning ShortBreak', () => {
    const { nextFocusCount } = getNextMode('focus', 3)
    expect(nextFocusCount).toBe(3)
  })

  it('does not mutate focusCount when returning LongBreak', () => {
    const { nextFocusCount } = getNextMode('focus', 4)
    expect(nextFocusCount).toBe(4)
  })
})

// ── getNextMode — from Break modes ────────────────────────────────────────

describe('getNextMode — from ShortBreak mode', () => {
  it('always returns Focus regardless of focusCount', () => {
    expect(getNextMode('short', 1).nextMode).toBe('focus')
    expect(getNextMode('short', 4).nextMode).toBe('focus')
    expect(getNextMode('short', 0).nextMode).toBe('focus')
  })

  it('passes focusCount through unchanged', () => {
    expect(getNextMode('short', 2).nextFocusCount).toBe(2)
    expect(getNextMode('short', 7).nextFocusCount).toBe(7)
  })

  it('returns { nextMode: focus, nextFocusCount: 2 } for focusCount=2', () => {
    expect(getNextMode('short', 2)).toEqual({ nextMode: 'focus', nextFocusCount: 2 })
  })
})

describe('getNextMode — from LongBreak mode', () => {
  it('always returns Focus regardless of focusCount', () => {
    expect(getNextMode('long', 4).nextMode).toBe('focus')
    expect(getNextMode('long', 8).nextMode).toBe('focus')
    expect(getNextMode('long', 0).nextMode).toBe('focus')
  })

  it('passes focusCount through unchanged', () => {
    expect(getNextMode('long', 4).nextFocusCount).toBe(4)
    expect(getNextMode('long', 12).nextFocusCount).toBe(12)
  })

  it('returns { nextMode: focus, nextFocusCount: 4 } for focusCount=4', () => {
    expect(getNextMode('long', 4)).toEqual({ nextMode: 'focus', nextFocusCount: 4 })
  })
})

// ── Return-type shape ──────────────────────────────────────────────────────

describe('getNextMode — return shape', () => {
  it('always returns an object with nextMode and nextFocusCount keys', () => {
    const result = getNextMode('focus', 1)
    expect(result).toHaveProperty('nextMode')
    expect(result).toHaveProperty('nextFocusCount')
  })
})
