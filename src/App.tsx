/**
 * App.tsx
 * Root application component.
 * The full UI will be built in the UI story; this shell ensures
 * `npm run dev` serves without errors and the timer engine is wired.
 */

import './tokens.css'
import { useTimer } from './hooks/useTimer'

function App() {
  const {
    mode,
    secondsLeft,
    isRunning,
    focusCount,
    stats,
    progress,
    start,
    pause,
    reset,
    setMode,
  } = useTimer()

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0')
  const seconds = (secondsLeft % 60).toString().padStart(2, '0')

  return (
    <div
      data-mode={mode}
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-sans)',
        gap: 'var(--space-6)',
        padding: 'var(--space-8)',
      }}
    >
      {/* Mode selector */}
      <nav
        role="tablist"
        aria-label="Timer mode"
        style={{ display: 'flex', gap: 'var(--space-2)' }}
      >
        {(['focus', 'short', 'long'] as const).map(m => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              transition: 'all var(--transition-base)',
              background: mode === m ? 'var(--color-accent)' : 'var(--color-surface)',
              color: mode === m ? 'var(--color-neutral-0)' : 'var(--color-text-secondary)',
            }}
          >
            {m === 'focus' ? 'Focus' : m === 'short' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </nav>

      {/* Timer display */}
      <div
        role="timer"
        aria-live="polite"
        aria-label={`${minutes} minutes ${seconds} seconds remaining`}
        style={{
          fontSize: 'var(--text-6xl)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 'var(--font-bold)',
          letterSpacing: 'var(--tracking-tight)',
          color: 'var(--color-text-primary)',
        }}
      >
        {minutes}:{seconds}
      </div>

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          width: '320px',
          height: '4px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-surface-2)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: 'var(--color-accent)',
            borderRadius: 'var(--radius-full)',
            transition: 'width var(--transition-base)',
          }}
        />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button
          onClick={isRunning ? pause : start}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          style={{
            padding: 'var(--space-4) var(--space-8)',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-semibold)',
            background: 'var(--color-accent)',
            color: 'var(--color-neutral-0)',
            transition: 'all var(--transition-base)',
          }}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          aria-label="Reset timer"
          style={{
            padding: 'var(--space-4) var(--space-6)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-medium)',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            transition: 'all var(--transition-base)',
          }}
        >
          Reset
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-8)',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)',
        }}
      >
        <span>Today: <strong style={{ color: 'var(--color-text-primary)' }}>{stats.todayCount}</strong></span>
        <span>Total: <strong style={{ color: 'var(--color-text-primary)' }}>{stats.totalMinutes}m</strong></span>
        <span>Streak: <strong style={{ color: 'var(--color-text-primary)' }}>{stats.streak}d</strong></span>
        <span>Sessions: <strong style={{ color: 'var(--color-text-primary)' }}>{focusCount}</strong></span>
      </div>

      {/* Keyboard hint */}
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-xs)',
          textAlign: 'center',
          margin: 0,
        }}
      >
        <kbd>Space</kbd> start/pause · <kbd>R</kbd> reset · <kbd>1</kbd> focus · <kbd>2</kbd> short · <kbd>3</kbd> long
      </p>
    </div>
  )
}

export default App
