import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, ChevronRight } from 'lucide-react'

/**
 * PremiumHint - Soft upsell component for Premium features
 *
 * Usage:
 * <PremiumHint
 *   message="Save this conversation for later"
 *   feature="Chat history"
 *   dismissable={true}
 *   variant="inline" | "banner" | "card"
 * />
 */

const VARIANTS = {
  inline: {
    container: 'flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#FFF8F3] to-[#FFE8D6] border border-[#F4A261]/20',
    icon: 'w-4 h-4',
    text: 'text-xs',
  },
  banner: {
    container: 'flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#FFF8F3] to-[#FFE8D6] border border-[#F4A261]/20',
    icon: 'w-5 h-5',
    text: 'text-sm',
  },
  card: {
    container: 'p-4 rounded-xl bg-gradient-to-br from-[#FFF8F3] via-[#FFE8D6] to-[#FFDBC4] border border-[#F4A261]/20 shadow-sm',
    icon: 'w-6 h-6',
    text: 'text-sm',
  },
}

function PremiumHint({
  message,
  feature,
  dismissable = true,
  variant = 'banner',
  onLearnMore,
  className = '',
}) {
  const [isDismissed, setIsDismissed] = useState(false)
  const styles = VARIANTS[variant]

  if (isDismissed) return null

  if (variant === 'card') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`${styles.container} ${className}`}
        >
          {dismissable && (
            <button
              onClick={() => setIsDismissed(true)}
              className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/50 text-[#9E9E9E]"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F4A261] to-[#E8924F] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4
                className="font-bold text-[#3D3D3D]"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Pawsy Premium
              </h4>
              {feature && (
                <p className="text-xs text-[#6B6B6B]">{feature}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-[#6B6B6B] mb-3">{message}</p>

          <button
            onClick={onLearnMore}
            className="flex items-center gap-1 text-[#F4A261] font-semibold text-sm hover:text-[#E8924F] transition-colors"
          >
            Learn More
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`${styles.container} ${className}`}
      >
        <Sparkles className={`${styles.icon} text-[#F4A261] flex-shrink-0`} />

        <div className="flex-1 min-w-0">
          <p className={`${styles.text} text-[#6B6B6B]`}>
            <span className="font-medium text-[#3D3D3D]">Premium: </span>
            {message}
          </p>
        </div>

        {onLearnMore && (
          <button
            onClick={onLearnMore}
            className="text-[#F4A261] font-medium text-xs hover:text-[#E8924F] transition-colors flex-shrink-0"
          >
            Learn More
          </button>
        )}

        {dismissable && (
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg hover:bg-white/50 text-[#9E9E9E] flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default PremiumHint
