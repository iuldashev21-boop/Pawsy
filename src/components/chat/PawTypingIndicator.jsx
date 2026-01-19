import { motion } from 'framer-motion'
import { PawPrint } from 'lucide-react'

function PawTypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] flex items-center justify-center">
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
        >
          <PawPrint className="w-4 h-4 text-white" />
        </motion.div>
      </div>

      {/* Bubble with dots */}
      <div className="bg-white border border-[#E8E8E8] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          {/* Bouncing dots */}
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-[#7EC8C8]"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default PawTypingIndicator
