/**
 * timerEngine.ts
 * Pure, side-effect-free timer logic.
 * No imports, no globals — fully unit-testable.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type Mode = 'focus' | 'short' | 'long'

// ── Constants ──────────────────────────────────────────────────────────────

const DURATIONS: Record<Mode, number> = {
  focus: 1500, // 25 minutes
  short: 300,  // 5 minutes
  long:  900,  // 15 minutes
}

// ── Pure functions ─────────────────────────────────────────────────────────

/**
 * Returns the duration in seconds for a given mode.
 *
 * @example
 * getModeDuration('focus') // 1500
 * getModeDuration('short') // 300
 * getModeDuration('long')  // 900
 */
export function getModeDuration(mode: Mode): number {
  return DURATIONS[mode]
}

/**
 * Computes the next mode after a session completes.
 *
 * The `focusCount` parameter is the CURRENT accumulated focus session count
 * (already reflecting the session that just finished when mode === 'focus').
 *
 * Auto-advance rules (per spec):
 *  - After 'focus': if (focusCount % 4 === 0 && focusCount > 0) → LongBreak
 *                   else → ShortBreak
 *  - After any break ('short' | 'long') → Focus
 *
 * focusCount is passed through unchanged (caller manages incrementing it
 * before calling this function for focus sessions).
 *
 * @example
 * getNextMode('focus', 4)  // { nextMode: 'long',  nextFocusCount: 4 }
 * getNextMode('focus', 1)  // { nextMode: 'short', nextFocusCount: 1 }
 * getNextMode('short', 2)  // { nextMode: 'focus', nextFocusCount: 2 }
 * getNextMode('long',  4)  // { nextMode: 'focus', nextFocusCount: 4 }
 */
export function getNextMode(
  mode: Mode,
  focusCount: number,
): { nextMode: Mode; nextFocusCount: number } {
  if (mode === 'focus') {
    const nextMode: Mode =
      focusCount % 4 === 0 && focusCount > 0 ? 'long' : 'short'
    return { nextMode, nextFocusCount: focusCount }
  }

  // After any break, return to focus without changing focusCount
  return { nextMode: 'focus', nextFocusCount: focusCount }
}
