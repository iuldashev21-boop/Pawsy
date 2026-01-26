import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PARTICLE_COLORS = ['#F4A261', '#7EC8C8', '#81C784', '#FFB74D', '#E8924F']
const PARTICLE_COUNT = 20
const ANIMATION_DURATION = 1500

function SuccessCelebration({ show, onComplete }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.3,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        size: 4 + Math.random() * 6,
        animateY: 20 + Math.random() * 30,
        animateXOffset: (Math.random() - 0.5) * 20,
        rotate: Math.random() * 360,
      }))
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: generate particles when show prop changes
      setParticles(newParticles)

      const timer = setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, ANIMATION_DURATION)

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show && particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              opacity: 1,
              x: `${particle.x}vw`,
              y: '50vh',
              scale: 0,
            }}
            animate={{
              opacity: [1, 1, 0],
              y: ['50vh', `${particle.animateY}vh`],
              x: `${particle.x + particle.animateXOffset}vw`,
              scale: [0, 1, 0.5],
              rotate: particle.rotate,
            }}
            transition={{
              duration: 1.2,
              delay: particle.delay,
              ease: 'easeOut',
            }}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

const TOAST_DURATION = 3000

function SuccessToast({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose?.()
      }, TOAST_DURATION)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className="bg-gradient-to-r from-[#81C784] to-[#66BB6A] text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2 }}
              className="text-lg"
            >
              ✓
            </motion.span>
            <span className="font-medium text-sm">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { SuccessCelebration, SuccessToast }
export default SuccessCelebration
