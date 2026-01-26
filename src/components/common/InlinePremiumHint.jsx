import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import PremiumIcon, { PremiumBadge } from './PremiumIcon'
import { useToast } from '../../context/ToastContext'

function InlinePremiumHint({
  message,
  actionText = "Learn more",
  variant = "subtle",
  dismissable = true,
  onAction,
  delay = 0,
}) {
  const [dismissed, setDismissed] = useState(false)
  const { showToast } = useToast()

  if (dismissed) return null

  const handleAction = onAction
    ?? (() => showToast('Get personalized health intelligence for your dog. Coming soon!', 'premium'))

  if (variant === "subtle") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ delay }}
        className="flex items-center gap-2 text-sm"
      >
        <PremiumIcon size={14} />
        <span className="text-[#6B6B6B]">{message}</span>
        <button
          onClick={handleAction}
          className="text-[#F4A261] font-medium hover:text-[#E8924F] transition-colors"
        >
          {actionText} →
        </button>
      </motion.div>
    )
  }

  if (variant === "card") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ delay }}
        className="bg-gradient-to-r from-[#FFF8E7] to-[#FFE4B5] rounded-xl p-3 border border-[#E8B855]/30 relative"
      >
        {dismissable && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/50 text-[#B8860B]"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="flex items-start gap-2.5 pr-6">
          <PremiumBadge size={32} className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#4A4A4A]">{message}</p>
            <button
              onClick={handleAction}
              className="mt-1.5 text-sm font-medium text-[#F4A261] hover:text-[#E8924F] transition-colors"
            >
              {actionText} →
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ delay }}
        className="bg-gradient-to-r from-[#FFF8E7] to-[#FFE4B5] border-y border-[#E8B855]/30"
      >
        <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PremiumIcon size={16} />
            <p className="text-sm text-[#4A4A4A]">{message}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAction}
              className="text-sm font-medium text-[#F4A261] hover:text-[#E8924F] transition-colors"
            >
              {actionText}
            </button>
            {dismissable && (
              <button
                onClick={() => setDismissed(true)}
                className="text-[#9E9E9E] hover:text-[#6B6B6B]"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return null
}

export default InlinePremiumHint
