/**
 * App.tsx
 * Root application component — full Pomodoro timer UI.
 *
 * Sets data-mode on <html> so CSS accent tokens apply globally.
 * Renders: ModeSwitcher → ProgressRing → Controls → StatCards
 */

import './tokens.css'
import './index.css'
import './App.css'

import { useEffect } from 'react'
import { useTimer } from './hooks/useTimer'
import { ProgressRing } from './components/ProgressRing'
import { ModeSwitcher } from './components/ModeSwitcher'
import { Controls } from './components/Controls'
import { StatCards } from './components/StatCards'

// ── Component ──────────────────────────────────────────────────────────────

function App() {
  const {
    mode,
    secondsLeft,
    isRunning,
    stats,
    progress,
    start,
    pause,
    reset,
    setMode,
  } = useTimer()

  // Apply data-mode to <html> so CSS token overrides cascade everywhere
  useEffect(() => {
    document.documentElement.dataset.mode = mode
  }, [mode])

  return (
    <main className="app" data-mode={mode}>
      <div className="app__content">

        {/* ── Wordmark ─────────────────────────────────────── */}
        <header className="app__header">
          <span className="app__wordmark" aria-label="Amar Focus">
            Amar Focus
          </span>
        </header>

        {/* ── Mode switcher ────────────────────────────────── */}
        <nav aria-label="Timer mode selection">
          <ModeSwitcher mode={mode} setMode={setMode} />
        </nav>

        {/* ── Progress ring ────────────────────────────────── */}
        <section
          className="app__ring"
          aria-label="Timer"
          role="timer"
          aria-live="polite"
          aria-atomic="true"
        >
          <ProgressRing
            progress={progress}
            secondsLeft={secondsLeft}
            isRunning={isRunning}
            mode={mode}
          />
        </section>

        {/* ── Controls ─────────────────────────────────────── */}
        <section className="app__controls" aria-label="Timer controls">
          <Controls
            isRunning={isRunning}
            onStart={start}
            onPause={pause}
            onReset={reset}
          />
        </section>

        {/* ── Divider ──────────────────────────────────────── */}
        <hr className="app__divider" aria-hidden="true" />

        {/* ── Stat cards ───────────────────────────────────── */}
        <section className="app__stats" aria-label="Your statistics">
          <StatCards stats={stats} />
        </section>

      </div>
    </main>
  )
}

export default App
