import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadStats, saveStats, recordSession } from '../stats'

// ── Helpers ────────────────────────────────────────────────────────────────

function dateString(daysOffset = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const TODAY     = dateString(0)
const YESTERDAY = dateString(-1)
const TWO_DAYS_AGO = dateString(-2)

// ── Setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear()
})

// ── loadStats ──────────────────────────────────────────────────────────────

describe('loadStats', () => {
  it('returns default stats when localStorage is empty', () => {
    const stats = loadStats()
    expect(stats).toEqual({
      todayCount:   0,
      totalMinutes: 0,
      streak:       0,
      lastDate:     '',
    })
  })

  it('returns stored stats when present', () => {
    const stored = { todayCount: 3, totalMinutes: 75, streak: 5, lastDate: TODAY }
    localStorage.setItem('amar_focus_stats', JSON.stringify(stored))
    expect(loadStats()).toEqual(stored)
  })

  it('returns defaults when stored JSON is malformed', () => {
    localStorage.setItem('amar_focus_stats', 'not-json{{{')
    const stats = loadStats()
    expect(stats.todayCount).toBe(0)
  })
})

// ── saveStats ──────────────────────────────────────────────────────────────

describe('saveStats', () => {
  it('persists stats to localStorage', () => {
    const s = { todayCount: 2, totalMinutes: 50, streak: 3, lastDate: TODAY }
    saveStats(s)
    expect(loadStats()).toEqual(s)
  })
})

// ── recordSession ──────────────────────────────────────────────────────────

describe('recordSession — same day', () => {
  it('increments todayCount and totalMinutes on same-day calls', () => {
    // Seed with today's date
    saveStats({ todayCount: 2, totalMinutes: 50, streak: 3, lastDate: TODAY })

    const result = recordSession(1500) // 25 min
    expect(result.todayCount).toBe(3)
    expect(result.totalMinutes).toBe(75) // 50 + 25
    expect(result.streak).toBe(3)        // unchanged
    expect(result.lastDate).toBe(TODAY)
  })

  it('rounds durationSeconds to nearest minute', () => {
    saveStats({ todayCount: 0, totalMinutes: 0, streak: 1, lastDate: TODAY })
    const result = recordSession(90) // 1.5 min → rounds to 2
    expect(result.totalMinutes).toBe(2)
  })

  it('persists the updated stats', () => {
    saveStats({ todayCount: 1, totalMinutes: 25, streak: 1, lastDate: TODAY })
    recordSession(1500)
    const persisted = loadStats()
    expect(persisted.todayCount).toBe(2)
    expect(persisted.totalMinutes).toBe(50)
  })
})

describe('recordSession — new consecutive day', () => {
  it('resets todayCount to 1 and increments streak', () => {
    saveStats({ todayCount: 5, totalMinutes: 125, streak: 3, lastDate: YESTERDAY })

    const result = recordSession(1500)
    expect(result.todayCount).toBe(1)       // reset + 1
    expect(result.streak).toBe(4)           // 3 + 1
    expect(result.totalMinutes).toBe(150)   // 125 + 25
    expect(result.lastDate).toBe(TODAY)
  })
})

describe('recordSession — streak broken', () => {
  it('resets streak to 1 when lastDate is more than 1 day ago', () => {
    saveStats({ todayCount: 3, totalMinutes: 75, streak: 10, lastDate: TWO_DAYS_AGO })

    const result = recordSession(1500)
    expect(result.todayCount).toBe(1)
    expect(result.streak).toBe(1)           // reset
    expect(result.totalMinutes).toBe(100)   // 75 + 25
  })

  it('resets streak to 1 when there is no prior date (first ever session)', () => {
    // lastDate is '' — no prior session
    const result = recordSession(1500)
    expect(result.todayCount).toBe(1)
    expect(result.streak).toBe(1)
    expect(result.totalMinutes).toBe(25)
  })
})

describe('recordSession — multiple same-day calls', () => {
  it('accumulates correctly across multiple calls', () => {
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
})
