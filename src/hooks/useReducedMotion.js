import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'

/**
 * Hook to detect user's reduced motion preference
 * Wraps Framer Motion's useReducedMotion for consistent usage across the app
 *
 * @returns {boolean} true if user prefers reduced motion
 */
export function useReducedMotion() {
  return useFramerReducedMotion()
}

/**
 * Returns animation props that respect reduced motion preference
 * Use this to create motion-safe animation variants
 *
 * @param {object} normalAnimation - Animation to use when motion is allowed
 * @param {object} reducedAnimation - Animation to use when motion should be reduced (default: no animation)
 * @returns {object} The appropriate animation props
 */
export function useMotionSafe(normalAnimation, reducedAnimation = {}) {
  const prefersReducedMotion = useFramerReducedMotion()
  return prefersReducedMotion ? reducedAnimation : normalAnimation
}

export default useReducedMotion
