import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Camera } from 'lucide-react'
import { useUsage } from '../../context/UsageContext'
import PremiumIcon from '../common/PremiumIcon'

/**
 * UsageCounter - Displays remaining usage for chat or photo
 *
 * Props:
 * - type: 'chat' | 'photo'
 * - showUpgrade: boolean - Show upgrade link when low
 * - onUpgrade: () => void - Callback when upgrade clicked
 * - className: string - Additional classes
 */
function UsageCounter({ type = 'chat', showUpgrade = true, onUpgrade, className = '' }) {
  const {
    chatsRemaining,
    photosRemaining,
    limits,
    isFirstDay,
  } = useUsage()

  const isChat = type === 'chat'
  const remaining = isChat ? chatsRemaining : photosRemaining
  const total = isChat ? limits.dailyChats : limits.dailyPhotos
  const Icon = isChat ? MessageCircle : Camera
  const label = isChat ? 'chat' : 'photo scan'
  const labelPlural = isChat ? 'chats' : 'photo scans'

  // Determine state and styling
  const getState = () => {
    if (remaining <= 0) return 'empty'
    if (remaining === 1) return 'last'
    if (remaining <= 2) return 'low'
    return 'plenty'
  }

  const state = getState()

  const styles = {
    plenty: {
      bg: 'bg-[#F5F5F5]',
      border: 'border-[#E8E8E8]',
      text: 'text-[#6B6B6B]',
      icon: 'text-[#9E9E9E]',
    },
    low: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: 'text-amber-500',
    },
    last: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      icon: 'text-orange-500',
    },
    empty: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-500',
    },
  }

  const currentStyle = styles[state]

  // Don't show if plenty remaining and not first day
  if (state === 'plenty' && !isFirstDay) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${currentStyle.bg} ${currentStyle.border} ${className}`}
      >
        <Icon className={`w-4 h-4 ${currentStyle.icon}`} />

        <div className="flex-1 min-w-0">
          {state === 'plenty' && (
            <p className={`text-xs ${currentStyle.text}`}>
              {remaining} free {labelPlural} today
              {isFirstDay && <span className="ml-1 text-[#F4A261]">(Day 1 bonus!)</span>}
            </p>
          )}

          {state === 'low' && (
            <p className={`text-xs ${currentStyle.text}`}>
              {remaining} {labelPlural} left today
            </p>
          )}

          {state === 'last' && (
            <p className={`text-xs font-medium ${currentStyle.text}`}>
              Last free {label} for today!
            </p>
          )}

          {state === 'empty' && (
            <p className={`text-xs font-medium ${currentStyle.text}`}>
              No {labelPlural} remaining
            </p>
          )}
        </div>

        {showUpgrade && (state === 'low' || state === 'last') && (
          <button
            onClick={onUpgrade}
            className="flex items-center gap-1 text-xs font-medium text-[#F4A261] hover:text-[#E8924F] transition-colors"
          >
            <PremiumIcon size={12} />
            Upgrade
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default UsageCounter
