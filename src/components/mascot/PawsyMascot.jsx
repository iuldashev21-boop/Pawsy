import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

/**
 * PawsyMascot - Animated chubby corgi with head mirror
 *
 * @param {string} mood - 'happy' | 'thinking' | 'concerned' | 'alert' | 'celebrating'
 * @param {number} size - Size in pixels (default 40)
 * @param {boolean} animate - Enable animations (default true)
 */
export default function PawsyMascot({ mood = 'happy', size = 40, animate = true }) {
  const [isBlinking, setIsBlinking] = useState(false)
  const blinkTimeoutRef = useRef(null)

  // Random blinking
  useEffect(() => {
    if (!animate) return

    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsBlinking(true)
        // Store timeout ref so we can clean it up
        blinkTimeoutRef.current = setTimeout(() => setIsBlinking(false), 150)
      }
    }, 2000)

    return () => {
      clearInterval(blinkInterval)
      // Also clear any pending blink timeout
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current)
      }
    }
  }, [animate])

  // Mood-based configurations
  const moodConfig = {
    happy: {
      eyeScale: 1,
      eyeY: 0,
      mouthPath: 'M 35,52 Q 40,56 45,52', // Slight smile
      earRotateLeft: 0,
      earRotateRight: 0,
      headMirrorGlow: 0.3,
      bodyBounce: 0,
    },
    thinking: {
      eyeScale: 1,
      eyeY: -2, // Looking up
      mouthPath: 'M 35,52 Q 40,52 45,52', // Neutral
      earRotateLeft: -5,
      earRotateRight: 5,
      headMirrorGlow: 0.6,
      bodyBounce: 2,
    },
    concerned: {
      eyeScale: 1.1,
      eyeY: 0,
      mouthPath: 'M 35,54 Q 40,52 45,54', // Slight frown
      earRotateLeft: 10,
      earRotateRight: -10, // Ears droop
      headMirrorGlow: 0.3,
      bodyBounce: 0,
    },
    alert: {
      eyeScale: 1.2,
      eyeY: 0,
      mouthPath: 'M 35,52 Q 40,50 45,52', // Slightly open
      earRotateLeft: -8,
      earRotateRight: 8, // Ears perked up
      headMirrorGlow: 0.8,
      bodyBounce: 0,
    },
    celebrating: {
      eyeScale: 0.8,
      eyeY: 2, // Happy squint
      mouthPath: 'M 33,50 Q 40,58 47,50', // Big smile
      earRotateLeft: -5,
      earRotateRight: 5,
      headMirrorGlow: 1,
      bodyBounce: 3,
    },
    listening: {
      eyeScale: 1.05,
      eyeY: 0,
      mouthPath: 'M 35,52 Q 40,54 45,52', // Slight smile
      earRotateLeft: -10,
      earRotateRight: 10, // Ears very perked
      headMirrorGlow: 0.5,
      bodyBounce: 1,
    },
  }

  const config = moodConfig[mood] || moodConfig.happy

  // Animation variants
  const breathingVariant = animate ? {
    scale: [1, 1.02, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  } : {}

  const bounceVariant = animate && config.bodyBounce ? {
    y: [0, -config.bodyBounce, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  } : {}

  return (
    <motion.div
      style={{ width: size, height: size, display: 'inline-flex' }}
      animate={{ ...breathingVariant, ...bounceVariant }}
    >
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Background circle (optional, for better visibility) */}
        <circle cx="40" cy="40" r="38" fill="#FFF5ED" />

        {/* Left Ear */}
        <motion.g
          style={{ originX: '25px', originY: '35px' }}
          animate={{ rotate: config.earRotateLeft }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <path
            d="M 12,35 Q 8,15 22,12 Q 32,10 30,32 Z"
            fill="#F4A261"
          />
          <path
            d="M 16,30 Q 14,20 22,17 Q 28,16 27,30 Z"
            fill="#FFB385"
          />
        </motion.g>

        {/* Right Ear */}
        <motion.g
          style={{ originX: '55px', originY: '35px' }}
          animate={{ rotate: config.earRotateRight }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <path
            d="M 68,35 Q 72,15 58,12 Q 48,10 50,32 Z"
            fill="#F4A261"
          />
          <path
            d="M 64,30 Q 66,20 58,17 Q 52,16 53,30 Z"
            fill="#FFB385"
          />
        </motion.g>

        {/* Face (chubby round shape) */}
        <ellipse cx="40" cy="44" rx="28" ry="26" fill="#FFE8D6" />

        {/* Cheek fluff - left */}
        <ellipse cx="18" cy="48" rx="8" ry="6" fill="#FFF5ED" />

        {/* Cheek fluff - right */}
        <ellipse cx="62" cy="48" rx="8" ry="6" fill="#FFF5ED" />

        {/* Snout */}
        <ellipse cx="40" cy="52" rx="12" ry="10" fill="#FFF5ED" />

        {/* Left Eye */}
        <motion.g
          animate={{
            scaleY: isBlinking ? 0.1 : config.eyeScale,
            y: config.eyeY
          }}
          transition={{ duration: 0.1 }}
          style={{ originX: '30px', originY: '40px' }}
        >
          <ellipse cx="30" cy="40" rx="5" ry="6" fill="#3D3D3D" />
          <ellipse cx="31" cy="38" rx="2" ry="2" fill="white" />
        </motion.g>

        {/* Right Eye */}
        <motion.g
          animate={{
            scaleY: isBlinking ? 0.1 : config.eyeScale,
            y: config.eyeY
          }}
          transition={{ duration: 0.1 }}
          style={{ originX: '50px', originY: '40px' }}
        >
          <ellipse cx="50" cy="40" rx="5" ry="6" fill="#3D3D3D" />
          <ellipse cx="51" cy="38" rx="2" ry="2" fill="white" />
        </motion.g>

        {/* Eyebrows (for concerned/alert) */}
        {(mood === 'concerned' || mood === 'alert') && (
          <>
            <motion.line
              x1="25" y1="32" x2="35" y2={mood === 'concerned' ? '30' : '34'}
              stroke="#C4956A"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <motion.line
              x1="55" y1="32" x2="45" y2={mood === 'concerned' ? '30' : '34'}
              stroke="#C4956A"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          </>
        )}

        {/* Nose */}
        <ellipse cx="40" cy="50" rx="4" ry="3" fill="#3D3D3D" />
        <ellipse cx="39" cy="49" rx="1.5" ry="1" fill="#5a5a5a" />

        {/* Mouth */}
        <motion.path
          d={config.mouthPath}
          stroke="#3D3D3D"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          animate={{ d: config.mouthPath }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />

        {/* Tongue (for celebrating) */}
        <AnimatePresence>
          {mood === 'celebrating' && (
            <motion.ellipse
              cx="40"
              cy="58"
              rx="4"
              ry="5"
              fill="#FF8A9B"
              initial={{ scaleY: 0, originY: '54px' }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
            />
          )}
        </AnimatePresence>

        {/* Head Mirror Band */}
        <path
          d="M 18,28 Q 40,22 62,28"
          stroke="#4A4A4A"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Head Mirror */}
        <motion.g
          animate={{
            filter: `drop-shadow(0 0 ${config.headMirrorGlow * 4}px #7EC8C8)`
          }}
        >
          <circle cx="40" cy="24" r="7" fill="#E8E8E8" stroke="#AFAFAF" strokeWidth="1" />
          <circle cx="40" cy="24" r="5" fill="#C0C0C0" />
          <motion.circle
            cx="40"
            cy="24"
            r="4"
            fill="#7EC8C8"
            animate={{ opacity: [0.3, config.headMirrorGlow, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <ellipse cx="38" cy="22" rx="2" ry="1.5" fill="white" opacity="0.6" />
        </motion.g>

        {/* Sparkles (for celebrating) */}
        <AnimatePresence>
          {mood === 'celebrating' && (
            <>
              <motion.text
                x="10" y="20"
                fontSize="10"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, y: [20, 15, 20] }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                ✨
              </motion.text>
              <motion.text
                x="62" y="18"
                fontSize="8"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, y: [18, 13, 18] }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
              >
                ✨
              </motion.text>
            </>
          )}
        </AnimatePresence>
      </svg>
    </motion.div>
  )
}
