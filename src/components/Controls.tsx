/**
 * Controls.tsx
 * Start/Pause (primary) and Reset (ghost) buttons with keyboard hint.
 * Pill-shaped, hover lift, focus-visible accent outline.
 */

import './Controls.css'

// ── Types ──────────────────────────────────────────────────────────────────

interface ControlsProps {
  isRunning: boolean
  onStart:   () => void
  onPause:   () => void
  onReset:   () => void
}

// ── Component ──────────────────────────────────────────────────────────────

export function Controls({ isRunning, onStart, onPause, onReset }: ControlsProps) {
  return (
    <div className="controls">
      {/* Button row */}
      <div className="controls__buttons">
        {/* Primary: Start / Pause */}
        <button
          className="ctrl-btn ctrl-btn--primary"
          onClick={isRunning ? onPause : onStart}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          aria-pressed={isRunning}
        >
          {isRunning ? (
            <>
              <PauseIcon />
              Pause
            </>
          ) : (
            <>
              <PlayIcon />
              Start
            </>
          )}
        </button>

        {/* Ghost: Reset */}
        <button
          className="ctrl-btn ctrl-btn--ghost"
          onClick={onReset}
          aria-label="Reset timer"
        >
          <ResetIcon />
          Reset
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="controls__hint" aria-label="Keyboard shortcuts">
        <kbd>Space</kbd>
        <span className="hint-sep">·</span>
        <kbd>R</kbd>
        <span className="hint-sep">·</span>
        <kbd>1</kbd>
        <kbd>2</kbd>
        <kbd>3</kbd>
      </p>
    </div>
  )
}

// ── Inline SVG icons ───────────────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 2.5a.5.5 0 0 1 .765-.424l10 5.5a.5.5 0 0 1 0 .848l-10 5.5A.5.5 0 0 1 3 13.5v-11Z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5Zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5Z" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fillRule="evenodd"
        d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1Z"
      />
      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466Z" />
    </svg>
  )
}
