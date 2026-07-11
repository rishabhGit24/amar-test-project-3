/**
 * chime.ts
 * Web Audio API chime — plays a short 3-note ascending tone.
 * Gracefully no-ops if AudioContext is unavailable (e.g., jsdom).
 */

// ── Types ──────────────────────────────────────────────────────────────────

interface ChimeNote {
  frequency: number
  startTime: number // seconds from AudioContext.currentTime
  duration:  number // seconds
}

// ── Constants ──────────────────────────────────────────────────────────────

/** C5 → E5 → G5 ascending triad, each note 120 ms */
const NOTES: ChimeNote[] = [
  { frequency: 523, startTime: 0.00, duration: 0.12 },
  { frequency: 659, startTime: 0.13, duration: 0.12 },
  { frequency: 784, startTime: 0.26, duration: 0.18 },
]

const GAIN_PEAK    = 0.35
const FADE_IN_MS   = 0.005 // 5 ms ramp up
const FADE_OUT_MS  = 0.04  // 40 ms ramp down (avoid clicks)

// ── Implementation ─────────────────────────────────────────────────────────

/**
 * Plays a pleasant 3-note ascending chime using the Web Audio API.
 * Silently no-ops if AudioContext is not available in the current environment.
 */
export function playChime(): void {
  // Resolve AudioContext (handle webkit prefix). Cast via `unknown` — a direct
  // cast of window to a type carrying webkitAudioContext fails strict tsc
  // (TS2352: insufficient overlap), which broke the production build.
  const w = window as unknown as {
    AudioContext?: typeof AudioContext
    webkitAudioContext?: typeof AudioContext
  }
  const AudioCtx = w.AudioContext ?? w.webkitAudioContext ?? null

  if (!AudioCtx) return

  let ctx: AudioContext
  try {
    ctx = new AudioCtx()
  } catch {
    return
  }

  const now = ctx.currentTime

  for (const note of NOTES) {
    const oscillator = ctx.createOscillator()
    const gainNode   = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(note.frequency, now + note.startTime)

    // Gain envelope: fade in → sustain → fade out
    gainNode.gain.setValueAtTime(0, now + note.startTime)
    gainNode.gain.linearRampToValueAtTime(
      GAIN_PEAK,
      now + note.startTime + FADE_IN_MS,
    )
    gainNode.gain.setValueAtTime(
      GAIN_PEAK,
      now + note.startTime + note.duration - FADE_OUT_MS,
    )
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      now + note.startTime + note.duration,
    )

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(now + note.startTime)
    oscillator.stop(now + note.startTime + note.duration)
  }

  // Close the context after all notes have played (+ small buffer)
  const totalDuration = NOTES[NOTES.length - 1].startTime +
                        NOTES[NOTES.length - 1].duration + 0.1
  setTimeout(() => {
    ctx.close().catch(() => {/* ignore */})
  }, totalDuration * 1000)
}
