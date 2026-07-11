import { describe, it, expect, vi } from 'vitest'
import { playChime } from '../chime'

describe('playChime', () => {
  it('executes without throwing in jsdom environment (AudioContext stubbed)', () => {
    // The AudioContext stub is set up in src/test/setup.ts
    expect(() => playChime()).not.toThrow()
  })

  it('calls AudioContext constructor', () => {
    const spy = vi.spyOn(globalThis, 'AudioContext')
    playChime()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('no-ops gracefully when AudioContext is unavailable', () => {
    const original = globalThis.AudioContext
    // @ts-expect-error – intentionally removing for test
    delete globalThis.AudioContext
    // @ts-expect-error – intentionally removing for test
    delete globalThis.webkitAudioContext

    expect(() => playChime()).not.toThrow()

    // Restore
    globalThis.AudioContext = original
  })
})
