import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimer } from '../useTimer'
import { getModeDuration } from '../../engine/timerEngine'

// ── Setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  document.title = ''
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// ── Initial state ──────────────────────────────────────────────────────────

describe('useTimer — initial state', () => {
  it('starts in focus mode', () => {
    const { result } = renderHook(() => useTimer())
    expect(result.current.mode).toBe('focus')
  })

  it('starts with correct secondsLeft for focus', () => {
    const { result } = renderHook(() => useTimer())
    expect(result.current.secondsLeft).toBe(1500)
  })

  it('starts not running', () => {
    const { result } = renderHook(() => useTimer())
    expect(result.current.isRunning).toBe(false)
  })

  it('starts with focusCount of 0', () => {
    const { result } = renderHook(() => useTimer())
    expect(result.current.focusCount).toBe(0)
  })

  it('progress is 0 at start', () => {
    const { result } = renderHook(() => useTimer())
    expect(result.current.progress).toBe(0)
  })
})

// ── progress ───────────────────────────────────────────────────────────────

describe('useTimer — progress', () => {
  it('progress is between 0 and 1 inclusive at start', () => {
    const { result } = renderHook(() => useTimer())
    expect(result.current.progress).toBeGreaterThanOrEqual(0)
    expect(result.current.progress).toBeLessThanOrEqual(1)
  })

  it('progress increases as timer runs', () => {
    const { result } = renderHook(() => useTimer())

    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(5000) }) // 5 seconds

    expect(result.current.progress).toBeGreaterThan(0)
    expect(result.current.progress).toBeLessThanOrEqual(1)
  })

  it('progress is 0 after reset', () => {
    const { result } = renderHook(() => useTimer())

    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(5000) })
    act(() => { result.current.reset() })

    expect(result.current.progress).toBe(0)
  })
})

// ── start / pause ──────────────────────────────────────────────────────────

describe('useTimer — start and pause', () => {
  it('sets isRunning to true on start', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start() })
    expect(result.current.isRunning).toBe(true)
  })

  it('decrements secondsLeft while running', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(3000) })
    expect(result.current.secondsLeft).toBe(1497)
  })

  it('sets isRunning to false on pause', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start() })
    act(() => { result.current.pause() })
    expect(result.current.isRunning).toBe(false)
  })

  it('stops decrementing after pause', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(3000) })
    act(() => { result.current.pause() })
    const secondsAfterPause = result.current.secondsLeft
    act(() => { vi.advanceTimersByTime(3000) })
    expect(result.current.secondsLeft).toBe(secondsAfterPause)
  })
})

// ── reset ──────────────────────────────────────────────────────────────────

describe('useTimer — reset', () => {
  it('resets secondsLeft to full duration', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(10000) })
    act(() => { result.current.reset() })
    expect(result.current.secondsLeft).toBe(getModeDuration('focus'))
  })

  it('sets isRunning to false on reset', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start() })
    act(() => { result.current.reset() })
    expect(result.current.isRunning).toBe(false)
  })
})

// ── setMode ────────────────────────────────────────────────────────────────

describe('useTimer — setMode', () => {
  it('switches to short break mode', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.setMode('short') })
    expect(result.current.mode).toBe('short')
    expect(result.current.secondsLeft).toBe(300)
  })

  it('switches to long break mode', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.setMode('long') })
    expect(result.current.mode).toBe('long')
    expect(result.current.secondsLeft).toBe(900)
  })

  it('switches back to focus mode', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.setMode('short') })
    act(() => { result.current.setMode('focus') })
    expect(result.current.mode).toBe('focus')
    expect(result.current.secondsLeft).toBe(1500)
  })

  it('stops the timer when mode changes', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start() })
    act(() => { result.current.setMode('short') })
    expect(result.current.isRunning).toBe(false)
  })
})

// ── document title ─────────────────────────────────────────────────────────

describe('useTimer — document title', () => {
  it('sets document title in mm:ss – Amar Focus format', () => {
    renderHook(() => useTimer())
    expect(document.title).toBe('25:00 – Amar Focus')
  })

  it('updates document title as timer ticks', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(1000) })
    expect(document.title).toBe('24:59 – Amar Focus')
  })

  it('shows correct format for short break', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.setMode('short') })
    expect(document.title).toBe('05:00 – Amar Focus')
  })
})

// ── keyboard shortcuts ─────────────────────────────────────────────────────

describe('useTimer — keyboard shortcuts', () => {
  function fireKey(key: string) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true })
    window.dispatchEvent(event)
  }

  it('Space toggles isRunning from false to true', () => {
    const { result } = renderHook(() => useTimer())
    expect(result.current.isRunning).toBe(false)
    act(() => { fireKey(' ') })
    expect(result.current.isRunning).toBe(true)
  })

  it('Space toggles isRunning from true to false', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start() })
    expect(result.current.isRunning).toBe(true)
    act(() => { fireKey(' ') })
    expect(result.current.isRunning).toBe(false)
  })

  it('R resets the timer', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(5000) })
    act(() => { fireKey('R') })
    expect(result.current.secondsLeft).toBe(getModeDuration('focus'))
    expect(result.current.isRunning).toBe(false)
  })

  it('r (lowercase) also resets the timer', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.start() })
    act(() => { vi.advanceTimersByTime(5000) })
    act(() => { fireKey('r') })
    expect(result.current.secondsLeft).toBe(getModeDuration('focus'))
  })

  it('1 switches to focus mode', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { result.current.setMode('short') })
    act(() => { fireKey('1') })
    expect(result.current.mode).toBe('focus')
  })

  it('2 switches to short break mode', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { fireKey('2') })
    expect(result.current.mode).toBe('short')
  })

  it('3 switches to long break mode', () => {
    const { result } = renderHook(() => useTimer())
    act(() => { fireKey('3') })
    expect(result.current.mode).toBe('long')
  })
})
