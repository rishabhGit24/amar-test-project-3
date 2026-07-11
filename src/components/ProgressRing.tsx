/**
 * ProgressRing.tsx
 * SVG countdown ring with animated progress arc, mm:ss display,
 * paused pulse animation, and session-complete scale burst.
 */

import './ProgressRing.css'
import { getModeDuration, type Mode } from '../engine/timerEngine'

// ── Types ──────────────────────────────────────────────────────────────────

interface ProgressRingProps {
  progress:    number  // 0 (start) → 1 (complete)
  secondsLeft: number
  isRunning:   boolean
  mode:        Mode
}

// ── Constants ──────────────────────────────────────────────────────────────

const VIEW_BOX_SIZE = 300
const CENTER        = VIEW_BOX_SIZE / 2   // 150
const RADIUS        = 128                  // leaves room for stroke-width 10 + glow
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ≈ 804.25

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const MODE_LABELS: Record<Mode, string> = {
  focus: 'Focus',
  short: 'Short Break',
  long:  'Long Break',
}

// ── Component ──────────────────────────────────────────────────────────────

export function ProgressRing({
  progress,
  secondsLeft,
  isRunning,
  mode,
}: ProgressRingProps) {
  // Stroke offset: 0 = full ring, CIRCUMFERENCE = empty ring
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  // Determine animation class
  const isPausedMidSession =
    !isRunning &&
    secondsLeft > 0 &&
    secondsLeft < getModeDuration(mode)

  const isComplete = secondsLeft === 0

  const ringClass = [
    'ring-wrapper',
    isPausedMidSession ? 'ring--paused'   : '',
    isComplete         ? 'ring--complete' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const timeDisplay = formatTime(secondsLeft)
  const modeLabel   = MODE_LABELS[mode]

  return (
    <div
      className={ringClass}
      role="img"
      aria-label={`${timeDisplay} remaining — ${modeLabel}`}
    >
      {/* SVG ring */}
      <svg
        className="ring-svg"
        viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        {/* Background track */}
        <circle
          className="ring-track"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
        />

        {/* Progress arc */}
        <circle
          className="ring-progress"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={dashOffset}
        />
      </svg>

      {/* Time display — absolutely positioned over SVG */}
      <div className="ring-time" aria-hidden="true">
        <span className="ring-time__display">{timeDisplay}</span>
        <span className="ring-time__label">{modeLabel}</span>
      </div>
    </div>
  )
}
