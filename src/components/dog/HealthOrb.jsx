import { motion } from 'framer-motion'
import { Heart, AlertTriangle, Activity } from 'lucide-react'

// Health status: 'good' | 'attention' | 'unknown'
function HealthOrb({ status = 'good', dogName, compact = false }) {
  const statusConfig = {
    good: {
      gradient: 'from-[#A5D6A7] via-[#81C784] to-[#66BB6A]',
      glow: 'bg-[#81C784]',
      shadow: 'rgba(129, 199, 132, 0.4)',
      shadowBright: 'rgba(129, 199, 132, 0.6)',
      icon: Heart,
      label: 'Feeling Great',
      sublabel: 'No concerns reported',
    },
    attention: {
      gradient: 'from-[#FFF176] via-[#FFD54F] to-[#FFCA28]',
      glow: 'bg-[#FFD54F]',
      shadow: 'rgba(255, 213, 79, 0.4)',
      shadowBright: 'rgba(255, 213, 79, 0.6)',
      icon: AlertTriangle,
      label: 'Needs Attention',
      sublabel: 'Check recent symptoms',
    },
    unknown: {
      gradient: 'from-[#E0E0E0] via-[#BDBDBD] to-[#9E9E9E]',
      glow: 'bg-[#BDBDBD]',
      shadow: 'rgba(189, 189, 189, 0.4)',
      shadowBright: 'rgba(189, 189, 189, 0.5)',
      icon: Activity,
      label: 'Getting Started',
      sublabel: 'Chat with Pawsy to update',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  // Use compact mode only when status is unknown
  const isCompact = compact && status === 'unknown'

  if (isCompact) {
    return (
      <div className="flex items-center gap-4">
        {/* Small orb */}
        <motion.div
          className="relative flex items-center justify-center flex-shrink-0"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Outer glow - smaller */}
          <div className={`absolute w-16 h-16 rounded-full ${config.glow} opacity-20 blur-xl`} />

          {/* Main orb - smaller */}
          <motion.div
            className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
            animate={{
              scale: [1, 1.03, 1],
              boxShadow: [
                `0 0 15px ${config.shadow}`,
                `0 0 25px ${config.shadowBright}`,
                `0 0 15px ${config.shadow}`,
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Icon className="w-6 h-6 text-white drop-shadow-md" />
          </motion.div>
        </motion.div>

        {/* Status text - inline */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3
            className="text-base font-bold text-[#3D3D3D]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {config.label}
          </h3>
          <p className="text-xs text-[#6B6B6B]">{config.sublabel}</p>
        </motion.div>
      </div>
    )
  }

  // Full size orb for good/attention status or when compact=false
  return (
    <div className="flex flex-col items-center">
      {/* Orb container */}
      <motion.div
        className="relative flex items-center justify-center mb-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Outer glow */}
        <div className={`absolute w-44 h-44 rounded-full ${config.glow} opacity-30 blur-2xl`} />

        {/* Middle glow ring */}
        <motion.div
          className={`absolute w-36 h-36 rounded-full ${config.glow} opacity-20`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Main orb */}
        <motion.div
          className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              `0 0 30px ${config.shadow}`,
              `0 0 50px ${config.shadowBright}`,
              `0 0 30px ${config.shadow}`,
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          >
            <Icon className="w-14 h-14 text-white drop-shadow-lg" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Status text */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3
          className="text-xl font-bold text-[#3D3D3D] mb-1"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          {config.label}
        </h3>
        <p className="text-sm text-[#6B6B6B]">{config.sublabel}</p>
      </motion.div>
    </div>
  )
}

export default HealthOrb
