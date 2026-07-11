/**
 * stats.ts
 * localStorage-backed session statistics with streak tracking.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface Stats {
  todayCount:   number
  totalMinutes: number
  streak:       number
  lastDate:     string // YYYY-MM-DD
}

// ── Constants ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'amar_focus_stats'

const DEFAULT_STATS: Stats = {
  todayCount:   0,
  totalMinutes: 0,
  streak:       0,
  lastDate:     '',
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Returns today's date as a YYYY-MM-DD string (local time). */
function todayString(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Returns the difference in calendar days between two YYYY-MM-DD strings.
 * Positive means `b` is after `a`.
 */
function daysBetween(a: string, b: string): number {
  if (!a || !b) return Infinity
  const msPerDay = 24 * 60 * 60 * 1000
  const dateA = new Date(a).getTime()
  const dateB = new Date(b).getTime()
  return Math.round((dateB - dateA) / msPerDay)
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Loads stats from localStorage. Returns defaults if nothing is stored
 * or if the stored value is malformed.
 */
export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATS }
    const parsed = JSON.parse(raw) as Partial<Stats>
    return {
      todayCount:   parsed.todayCount   ?? 0,
      totalMinutes: parsed.totalMinutes ?? 0,
      streak:       parsed.streak       ?? 0,
      lastDate:     parsed.lastDate     ?? '',
    }
  } catch {
    return { ...DEFAULT_STATS }
  }
}

/**
 * Persists stats to localStorage.
 */
export function saveStats(s: Stats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // Storage quota exceeded or unavailable — silently ignore
  }
}

/**
 * Records a completed focus session and returns the updated stats.
 *
 * Logic:
 *  1. Load current stats.
 *  2. Compute today's date string.
 *  3. If lastDate !== today:
 *       - Reset todayCount to 0.
 *       - If lastDate was yesterday → increment streak.
 *       - Otherwise (gap > 1 day or no prior date) → reset streak to 1.
 *  4. Increment todayCount by 1.
 *  5. Add Math.round(durationSeconds / 60) to totalMinutes.
 *  6. Set lastDate = today.
 *  7. Save and return updated stats.
 */
export function recordSession(durationSeconds: number): Stats {
  const current = loadStats()
  const today   = todayString()

  let { todayCount, totalMinutes, streak, lastDate } = current

  if (lastDate !== today) {
    // New day — reset daily count
    todayCount = 0

    const diff = daysBetween(lastDate, today)
    if (diff === 1) {
      // Consecutive day — extend streak
      streak = streak + 1
    } else {
      // Gap or first ever session — start fresh streak
      streak = 1
    }
  }

  todayCount   += 1
  totalMinutes += Math.round(durationSeconds / 60)
  lastDate      = today

  const updated: Stats = { todayCount, totalMinutes, streak, lastDate }
  saveStats(updated)
  return updated
}
