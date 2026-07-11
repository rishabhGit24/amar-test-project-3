import '@testing-library/jest-dom'

// Stub AudioContext for jsdom environment
class AudioContextStub {
  createOscillator() {
    return {
      type: 'sine' as OscillatorType,
      frequency: { setValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {},
    }
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => {},
    }
  }
  get currentTime() {
    return 0
  }
  get destination() {
    return {} as AudioDestinationNode
  }
  close() {
    return Promise.resolve()
  }
}

// @ts-expect-error – stub for test environment
globalThis.AudioContext = AudioContextStub
// @ts-expect-error – webkit prefix stub
globalThis.webkitAudioContext = AudioContextStub
