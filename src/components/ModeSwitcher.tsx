/**
 * ModeSwitcher.tsx
 * Pill-shaped tab bar for switching between Focus, Short Break, Long Break.
 * Uses role="tablist" / role="tab" for accessibility.
 */

import './ModeSwitcher.css'
import { type Mode } from '../engine/timerEngine'

// ── Types ──────────────────────────────────────────────────────────────────

interface ModeSwitcherProps {
  mode:    Mode
  setMode: (mode: Mode) => void
}

// ── Constants ──────────────────────────────────────────────────────────────

const MODES: { value: Mode; label: string; shortcut: string }[] = [
  { value: 'focus', label: 'Focus',       shortcut: '1' },
  { value: 'short', label: 'Short Break', shortcut: '2' },
  { value: 'long',  label: 'Long Break',  shortcut: '3' },
]

// ── Component ──────────────────────────────────────────────────────────────

export function ModeSwitcher({ mode, setMode }: ModeSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Timer mode"
      className="mode-switcher"
    >
      {MODES.map(({ value, label, shortcut }) => (
        <button
          key={value}
          role="tab"
          aria-selected={mode === value}
          aria-label={`${label} (press ${shortcut})`}
          className="mode-btn"
          onClick={() => setMode(value)}
          tabIndex={mode === value ? 0 : -1}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
