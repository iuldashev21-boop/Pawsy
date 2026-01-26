/* eslint-disable no-undef, react-refresh/only-export-components */
import { forwardRef } from 'react'

// Animation props to strip from DOM elements
const MOTION_PROPS = new Set([
  'initial', 'animate', 'exit', 'transition', 'variants',
  'whileHover', 'whileTap', 'whileFocus', 'whileDrag', 'whileInView',
  'drag', 'dragConstraints', 'dragElastic', 'dragMomentum',
  'onDragStart', 'onDragEnd', 'onDrag',
  'layout', 'layoutId', 'layoutDependency',
  'onLayoutAnimationStart', 'onLayoutAnimationComplete',
  'custom', 'inherit',
])

function filterMotionProps(props) {
  const filtered = {}
  for (const key in props) {
    if (!MOTION_PROPS.has(key)) {
      filtered[key] = props[key]
    }
  }
  return filtered
}

// Proxy-based mock: motion.div → renders plain <div>
// Cache components so the same reference is returned for each tag name,
// preventing React from unmounting/remounting on every re-render.
const componentCache = new Map()
const motionHandler = {
  get(_, tagName) {
    if (!componentCache.has(tagName)) {
      componentCache.set(
        tagName,
        forwardRef(function MotionMock(props, ref) {
          const Tag = tagName
          return <Tag ref={ref} {...filterMotionProps(props)} />
        })
      )
    }
    return componentCache.get(tagName)
  },
}

export const motion = new Proxy({}, motionHandler)

export function AnimatePresence({ children }) {
  return <>{children}</>
}

export function useReducedMotion() {
  return false
}

export function useMotionValue(initial) {
  return { get: () => initial, set: () => {}, onChange: () => () => {} }
}

export function useTransform() {
  return { get: () => 0, set: () => {}, onChange: () => () => {} }
}

export function useSpring() {
  return { get: () => 0, set: () => {}, onChange: () => () => {} }
}

export function useAnimation() {
  return { start: vi.fn(), stop: vi.fn(), set: vi.fn() }
}

export function useInView() {
  return [null, true]
}
