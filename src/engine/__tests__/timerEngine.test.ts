import { describe, it, expect } from 'vitest'
import { getModeDuration, getNextMode } from '../timerEngine'

describe('getModeDuration', () => {
  it('returns 1500 for focus', () => {
    expect(getModeDuration('focus')).toBe(1500)
  })

  it('returns 300 for short', () => {
    expect(getModeDuration('short')).toBe(300)
  })

  it('returns 900 for long', () => {
    expect(getModeDuration('long')).toBe(900)
  })
})

describe('getNextMode', () => {
  it('returns long break after 4th focus session (focusCount=4)', () => {
    const result = getNextMode('focus', 4)
    expect(result).toEqual({ nextMode: 'long', nextFocusCount: 4 })
  })

  it('returns short break after 1st focus session (focusCount=1)', () => {
    const result = getNextMode('focus', 1)
    expect(result).toEqual({ nextMode: 'short', nextFocusCount: 1 })
  })

  it('returns short break after 2nd focus session (focusCount=2)', () => {
    const result = getNextMode('focus', 2)
    expect(result).toEqual({ nextMode: 'short', nextFocusCount: 2 })
  })

  it('returns short break after 3rd focus session (focusCount=3)', () => {
    const result = getNextMode('focus', 3)
    expect(result).toEqual({ nextMode: 'short', nextFocusCount: 3 })
  })

  it('returns long break after 8th focus session (focusCount=8)', () => {
    const result = getNextMode('focus', 8)
    expect(result).toEqual({ nextMode: 'long', nextFocusCount: 8 })
  })

  it('returns focus after short break (focusCount=2)', () => {
    const result = getNextMode('short', 2)
    expect(result).toEqual({ nextMode: 'focus', nextFocusCount: 2 })
  })

  it('returns focus after long break (focusCount=4)', () => {
    const result = getNextMode('long', 4)
    expect(result).toEqual({ nextMode: 'focus', nextFocusCount: 4 })
  })

  it('does not trigger long break when focusCount=0', () => {
    // 0 % 4 === 0 but focusCount > 0 guard prevents long break
    const result = getNextMode('focus', 0)
    expect(result).toEqual({ nextMode: 'short', nextFocusCount: 0 })
  })
})
