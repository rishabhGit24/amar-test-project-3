/**
 * useTimer.ts
 * Core Pomodoro timer hook.
 *
 * Manages mode, countdown, running state, focus count, and stats.
 * Wires keyboard shortcuts and document title updates.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { getModeDuration, getNextMode, type Mode } from '../engine/timerEngine'
import { loadStats, recordSession, type Stats } from '../engine/stats'
import { playChime } from '../engine/chime'

// ── Types ──────────────────────────────────────────────────────────────────

export interface TimerState {
  mode:        Mode
  secondsLeft: number
  isRunning:   boolean
  focusCount:  number
  stats:       Stats
  progress:    number // 0 (start) → 1 (complete)
}

export interface TimerActions {
  start:   () => void
  pause:   () => void
  reset:   () => void
  setMode: (mode: Mode) => void
}

export type UseTimerReturn = TimerState & TimerActions

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useTimer(): UseTimerReturn {
  const [mode,        setModeState]  = useState<Mode>('focus')
  const [secondsLeft, setSecondsLeft] = useState<number>(getModeDuration('focus'))
  const [isRunning,   setIsRunning]  = useState<boolean>(false)
  const [focusCount,  setFocusCount] = useState<number>(0)
  const [stats,       setStats]      = useState<Stats>(loadStats)

  // Stable refs to avoid stale closures in the interval
  const modeRef        = useRef<Mode>(mode)
  const secondsLeftRef = useRef<number>(secondsLeft)
  const isRunningRef   = useRef<boolean>(isRunning)
  const focusCountRef  = useRef<number>(focusCount)
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null)

  // Keep refs in sync with state
  useEffect(() => { modeRef.current        = mode        }, [mode])
  useEffect(() => { secondsLeftRef.current = secondsLeft }, [secondsLeft])
  useEffect(() => { isRunningRef.current   = isRunning   }, [isRunning])
  useEffect(() => { focusCountRef.current  = focusCount  }, [focusCount])

  // ── Interval tick ────────────────────────────────────────────────────────

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startInterval = useCallback(() => {
    clearTimer()
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        const next = prev - 1

        if (next <= 0) {
          // Session complete
          clearTimer()

          const currentMode  = modeRef.current
          const currentCount = focusCountRef.current

          // Play chime
          playChime()

          // Record stats only for focus sessions
          let newFocusCount = currentCount
          if (currentMode === 'focus') {
            newFocusCount = currentCount + 1
            setFocusCount(newFocusCount)
            focusCountRef.current = newFocusCount
            const updatedStats = recordSession(getModeDuration('focus'))
            setStats(updatedStats)
          }

          // Advance to next mode
          const { nextMode, nextFocusCount } = getNextMode(currentMode, newFocusCount)
          setModeState(nextMode)
          modeRef.current = nextMode
          setFocusCount(nextFocusCount)
          focusCountRef.current = nextFocusCount

          const nextDuration = getModeDuration(nextMode)
          secondsLeftRef.current = nextDuration

          // Auto-start next interval
          setTimeout(() => {
            startInterval()
          }, 0)

          return nextDuration
        }

        return next
      })
    }, 1000)
  }, [clearTimer])

  // ── Actions ──────────────────────────────────────────────────────────────

  const start = useCallback(() => {
    if (isRunningRef.current) return
    setIsRunning(true)
    isRunningRef.current = true
    startInterval()
  }, [startInterval])

  const pause = useCallback(() => {
    setIsRunning(false)
    isRunningRef.current = false
    clearTimer()
  }, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    isRunningRef.current = false
    const duration = getModeDuration(modeRef.current)
    setSecondsLeft(duration)
    secondsLeftRef.current = duration
  }, [clearTimer])

  const setMode = useCallback((newMode: Mode) => {
    clearTimer()
    setIsRunning(false)
    isRunningRef.current = false
    setModeState(newMode)
    modeRef.current = newMode
    const duration = getModeDuration(newMode)
    setSecondsLeft(duration)
    secondsLeftRef.current = duration
  }, [clearTimer])

  // ── Document title ───────────────────────────────────────────────────────

  useEffect(() => {
    document.title = `${formatTime(secondsLeft)} – Amar Focus`
  }, [secondsLeft])

  // ── Keyboard shortcuts ───────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when focus is inside an input/textarea/select
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return
      }

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (isRunningRef.current) {
            pause()
          } else {
            start()
          }
          break
        case 'r':
        case 'R':
          reset()
          break
        case '1':
          setMode('focus')
          break
        case '2':
          setMode('short')
          break
        case '3':
          setMode('long')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [start, pause, reset, setMode])

  // ── Cleanup on unmount ───────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [clearTimer])

  // ── Derived state ────────────────────────────────────────────────────────

  const totalDuration = getModeDuration(mode)
  const progress = Math.min(
    1,
    Math.max(0, (totalDuration - secondsLeft) / totalDuration),
  )

  return {
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
  }
}
