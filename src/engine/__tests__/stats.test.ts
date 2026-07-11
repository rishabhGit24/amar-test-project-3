/**
 * stats.test.ts
 * Comprehensive unit tests for localStorage-backed stats persistence.
 * No UI imports — pure logic coverage only.
 *
 * Acceptance criteria covered:
 *  ✓ loadStats on empty storage returns default zeros
 *  ✓ recordSession(1500) on fresh store: todayCount=1, totalMinutes=25, streak=1, lastDate=today
 *  ✓ Two consecutive recordSession calls same day: todayCount=2, totalMinutes=50
 *  ✓ recordSession on a new day after yesterday: todayCount=1, streak incremented by 1
 *  ✓ recordSession after a gap of 2+ days: streak resets to 1
 *  ✓ recordSession(90): totalMinutes incremented by Math.round(90/60) = 2
 *
 * localStorage is provided by jsdom (vitest environment: 'jsdom').
 * Date is controlled via vi.setSystemTime to pin "today" deterministically.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { loadStats, saveStats, recordSession, type Stats } from '../stats'

// ── Date helpers ───────────────────────────────────────────────────────────

/** Build a YYYY-MM-DD string for a given Date object (local time). */
function toDateString(d: Date): string {
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** Return a Date offset by `days` from the given base date. */
function offsetDate(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

// ── Fixed reference date ───────────────────────────────────────────────────
// Pin the system clock to a known date so tests are deterministic regardless
// of when they run.
const FIXED_NOW       = new Date('2024-06-15T12:00:00.000Z')
const TODAY           = toDateString(FIXED_NOW)
const YESTERDAY       = toDateString(offsetDate(FIXED_NOW, -1))
const TWO_DAYS_AGO    = toDateString(offsetDate(FIXED_NOW, -2))
const THREE_DAYS_AGO  = toDateString(offsetDate(FIXED_NOW, -3))

// ── Setup / teardown ───────────────────────────────────────────────────────

beforeEach(() => {
  // Pin the clock so todayString() inside stats.ts always returns TODAY
  vi.useFakeTimers()
  vi.setSystemTime(FIXED_NOW)
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

// ── loadStats ──────────────────────────────────────────────────────────────

describe('loadStats', () => {
  it('returns default stats when localStorage is empty', () => {
    const stats = loadStats()
    expect(stats).toEqual<Stats>({
      todayCount:   0,
      totalMinutes: 0,
      streak:       0,
      lastDate:     '',
    })
  })

  it('returns stored stats when present', () => {
    const stored: Stats = {
      todayCount:   3,
      totalMinutes: 75,
      streak:       5,
      lastDate:     TODAY,
    }
    localStorage.setItem('amar_focus_stats', JSON.stringify(stored))
    expect(loadStats()).toEqual(stored)
  })

  it('returns defaults when stored JSON is malformed', () => {
    localStorage.setItem('amar_focus_stats', 'not-json{{{')
    const stats = loadStats()
    expect(stats).toEqual<Stats>({
      todayCount:   0,
      totalMinutes: 0,
      streak:       0,
      lastDate:     '',
    })
  })

  it('fills in missing fields with defaults when partial data is stored', () => {
    // Only totalMinutes stored — other fields should default
    localStorage.setItem('amar_focus_stats', JSON.stringify({ totalMinutes: 100 }))
    const stats = loadStats()
    expect(stats.todayCount).toBe(0)
    expect(stats.streak).toBe(0)
    expect(stats.lastDate).toBe('')
    expect(stats.totalMinutes).toBe(100)
  })
})

// ── saveStats ──────────────────────────────────────────────────────────────

describe('saveStats', () => {
  it('persists stats to localStorage so loadStats can read them back', () => {
    const s: Stats = { todayCount: 2, totalMinutes: 50, streak: 3, lastDate: TODAY }
    saveStats(s)
    expect(loadStats()).toEqual(s)
  })

  it('overwrites previously stored stats', () => {
    saveStats({ todayCount: 1, totalMinutes: 25, streak: 1, lastDate: TODAY })
    saveStats({ todayCount: 5, totalMinutes: 125, streak: 7, lastDate: TODAY })
    expect(loadStats().todayCount).toBe(5)
    expect(loadStats().streak).toBe(7)
  })
})

// ── recordSession — fresh store (first ever session) ──────────────────────

describe('recordSession — first ever session (empty store)', () => {
  it('sets todayCount=1, totalMinutes=25, streak=1, lastDate=today for 1500 s', () => {
    const result = recordSession(1500)
    expect(result).toEqual<Stats>({
      todayCount:   1,
      totalMinutes: 25,
      streak:       1,
      lastDate:     TODAY,
    })
  })

  it('persists the result to localStorage', () => {
    recordSession(1500)
    const persisted = loadStats()
    expect(persisted.todayCount).toBe(1)
    expect(persisted.totalMinutes).toBe(25)
    expect(persisted.streak).toBe(1)
    expect(persisted.lastDate).toBe(TODAY)
  })
})

// ── recordSession — same-day accumulation ─────────────────────────────────

describe('recordSession — same-day accumulation', () => {
  it('two consecutive calls: todayCount=2, totalMinutes=50', () => {
    recordSession(1500) // call 1
    const result = recordSession(1500) // call 2
    expect(result.todayCount).toBe(2)
    expect(result.totalMinutes).toBe(50)
  })

  it('streak is unchanged on same-day calls', () => {
    saveStats({ todayCount: 2, totalMinutes: 50, streak: 5, lastDate: TODAY })
    const result = recordSession(1500)
    expect(result.streak).toBe(5)
  })

  it('lastDate remains today on same-day calls', () => {
    saveStats({ todayCount: 1, totalMinutes: 25, streak: 1, lastDate: TODAY })
    const result = recordSession(1500)
    expect(result.lastDate).toBe(TODAY)
  })

  it('increments todayCount and totalMinutes on same-day calls (seeded store)', () => {
    saveStats({ todayCount: 2, totalMinutes: 50, streak: 3, lastDate: TODAY })
    const result = recordSession(1500) // +25 min
    expect(result.todayCount).toBe(3)
    expect(result.totalMinutes).toBe(75)
    expect(result.streak).toBe(3)
    expect(result.lastDate).toBe(TODAY)
  })

  it('accumulates correctly across three calls', () => {
    let result = recordSession(1500)
    expect(result.todayCount).toBe(1)
    expect(result.totalMinutes).toBe(25)

    result = recordSession(1500)
    expect(result.todayCount).toBe(2)
    expect(result.totalMinutes).toBe(50)

    result = recordSession(1500)
    expect(result.todayCount).toBe(3)
    expect(result.totalMinutes).toBe(75)
  })

  it('persists updated stats after same-day call', () => {
    saveStats({ todayCount: 1, totalMinutes: 25, streak: 1, lastDate: TODAY })
    recordSession(1500)
    const persisted = loadStats()
    expect(persisted.todayCount).toBe(2)
    expect(persisted.totalMinutes).toBe(50)
  })
})

// ── recordSession — rounding ───────────────────────────────────────────────

describe('recordSession — durationSeconds rounding', () => {
  it('90 s → Math.round(90/60)=2 minutes added', () => {
    saveStats({ todayCount: 0, totalMinutes: 0, streak: 1, lastDate: TODAY })
    const result = recordSession(90)
    expect(result.totalMinutes).toBe(2)
  })

  it('30 s → Math.round(30/60)=1 minute added (rounds 0.5 up)', () => {
    saveStats({ todayCount: 0, totalMinutes: 0, streak: 1, lastDate: TODAY })
    const result = recordSession(30)
    expect(result.totalMinutes).toBe(1)
  })

  it('29 s → Math.round(29/60)=0 minutes added', () => {
    saveStats({ todayCount: 0, totalMinutes: 10, streak: 1, lastDate: TODAY })
    const result = recordSession(29)
    expect(result.totalMinutes).toBe(10) // 10 + 0
  })

  it('1500 s → exactly 25 minutes added', () => {
    saveStats({ todayCount: 0, totalMinutes: 0, streak: 1, lastDate: TODAY })
    const result = recordSession(1500)
    expect(result.totalMinutes).toBe(25)
  })
})

// ── recordSession — new consecutive day ───────────────────────────────────

describe('recordSession — new consecutive day (streak increment)', () => {
  it('resets todayCount to 1 and increments streak by 1', () => {
    saveStats({ todayCount: 5, totalMinutes: 125, streak: 3, lastDate: YESTERDAY })
    const result = recordSession(1500)
    expect(result.todayCount).toBe(1)
    expect(result.streak).toBe(4)         // 3 + 1
    expect(result.totalMinutes).toBe(150) // 125 + 25
    expect(result.lastDate).toBe(TODAY)
  })

  it('streak increments from 1 to 2 on second consecutive day', () => {
    saveStats({ todayCount: 3, totalMinutes: 75, streak: 1, lastDate: YESTERDAY })
    const result = recordSession(1500)
    expect(result.streak).toBe(2)
  })

  it('todayCount resets to 1 (not accumulated from previous day)', () => {
    saveStats({ todayCount: 10, totalMinutes: 250, streak: 7, lastDate: YESTERDAY })
    const result = recordSession(1500)
    expect(result.todayCount).toBe(1)
  })
})

// ── recordSession — streak broken (gap ≥ 2 days) ─────────────────────────

describe('recordSession — streak broken (gap ≥ 2 days)', () => {
  it('resets streak to 1 when lastDate is exactly 2 days ago', () => {
    saveStats({ todayCount: 3, totalMinutes: 75, streak: 10, lastDate: TWO_DAYS_AGO })
    const result = recordSession(1500)
    expect(result.todayCount).toBe(1)
    expect(result.streak).toBe(1)          // reset, not 11
    expect(result.totalMinutes).toBe(100)  // 75 + 25
  })

  it('resets streak to 1 when lastDate is 3 days ago', () => {
    saveStats({ todayCount: 2, totalMinutes: 50, streak: 5, lastDate: THREE_DAYS_AGO })
    const result = recordSession(1500)
    expect(result.streak).toBe(1)
  })

  it('resets streak to 1 when there is no prior date (first ever session)', () => {
    // localStorage is empty — lastDate defaults to ''
    const result = recordSession(1500)
    expect(result.todayCount).toBe(1)
    expect(result.streak).toBe(1)
    expect(result.totalMinutes).toBe(25)
    expect(result.lastDate).toBe(TODAY)
  })

  it('todayCount resets to 1 after a gap', () => {
    saveStats({ todayCount: 8, totalMinutes: 200, streak: 15, lastDate: TWO_DAYS_AGO })
    const result = recordSession(1500)
    expect(result.todayCount).toBe(1)
  })
})

// ── recordSession — return value matches persisted value ──────────────────

describe('recordSession — return value consistency', () => {
  it('returned stats match what loadStats reads back', () => {
    const returned = recordSession(1500)
    const persisted = loadStats()
    expect(returned).toEqual(persisted)
  })

  it('returned stats match after consecutive calls', () => {
    recordSession(1500)
    const returned = recordSession(900)
    const persisted = loadStats()
    expect(returned).toEqual(persisted)
  })
})
