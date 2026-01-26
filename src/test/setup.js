/* eslint-disable no-undef */
import '@testing-library/jest-dom'

// Clear localStorage between tests
beforeEach(() => {
  localStorage.clear()
})

// Mock window.matchMedia (needed by Framer Motion's useReducedMotion)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = IntersectionObserverMock

// Mock ResizeObserver
class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock

// Mock scrollTo and scrollIntoView
window.scrollTo = vi.fn()
Element.prototype.scrollIntoView = vi.fn()

// Polyfill DragEvent (jsdom doesn't implement it, which breaks React drag event handling)
if (!globalThis.DragEvent) {
  globalThis.DragEvent = class DragEvent extends Event {
    constructor(type, init = {}) {
      super(type, { bubbles: true, cancelable: true, ...init })
      this.dataTransfer = init.dataTransfer || null
    }
  }
}

// Mock HTMLMediaElement methods (jsdom doesn't implement play/pause returning Promises)
HTMLMediaElement.prototype.play = vi.fn().mockReturnValue(Promise.resolve())
HTMLMediaElement.prototype.pause = vi.fn()
HTMLMediaElement.prototype.load = vi.fn()

// Mock crypto.randomUUID if absent
if (!globalThis.crypto?.randomUUID) {
  const crypto = globalThis.crypto || {}
  crypto.randomUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }
  globalThis.crypto = crypto
}
