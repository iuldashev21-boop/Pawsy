import { motion } from 'framer-motion'
import { PawPrint } from 'lucide-react'
import PawsyMascot from '../mascot/PawsyMascot'

function PawTypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3 items-end"
    >
      {/* Mascot Avatar */}
      <div className="flex-shrink-0">
        <PawsyMascot mood="thinking" size={32} />
      </div>

      {/* Bubble with dots */}
      <div className="bg-white rounded-3xl rounded-tl-lg px-5 py-3 shadow-[0_2px_12px_rgba(61,61,61,0.08)] border border-[#F4A261]/10">
        <div className="flex items-center gap-2">
          {/* Bouncing paw dots */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -8, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            >
              <PawPrint className="w-3 h-3 text-[#F4A261]" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default PawTypingIndicator
