import { motion, useReducedMotion } from 'framer-motion'
import { MessageCircle, Camera } from 'lucide-react'
import { useUsage } from '../../context/UsageContext'
import PremiumIcon from '../common/PremiumIcon'
import { USAGE_LIMITS } from '../../constants/usage'

const STATE_COLORS = {
  empty: 'text-[#EF5350]',
  low: 'text-[#F4A261]',
  normal: 'text-[#3D3D3D]',
}

const CHAT_BAR_COLORS = { empty: 'bg-[#EF5350]', low: 'bg-[#F4A261]', normal: 'bg-[#7EC8C8]' }
const PHOTO_BAR_COLORS = { empty: 'bg-[#EF5350]', low: 'bg-[#EF5350]', normal: 'bg-[#F4A261]' }

function getUsageState(remaining, lowThreshold) {
  if (remaining === 0) return 'empty'
  if (remaining <= lowThreshold) return 'low'
  return 'normal'
}

function getProgressAnimation(prefersReducedMotion, delay = 0) {
  if (prefersReducedMotion) return {}
  return { initial: { width: 0 }, transition: { duration: 0.5, ease: 'easeOut', delay } }
}

function UsageStatsCard({ onUpgrade }) {
  const { chatsRemaining, photosRemaining, isFirstDay } = useUsage()
  const prefersReducedMotion = useReducedMotion()

  const maxChats = isFirstDay ? USAGE_LIMITS.firstDayChats : USAGE_LIMITS.dailyChats
  const maxPhotos = isFirstDay ? USAGE_LIMITS.firstDayPhotos : USAGE_LIMITS.dailyPhotos

  const chatPercent = (chatsRemaining / maxChats) * 100
  const photoPercent = (photosRemaining / maxPhotos) * 100

  const chatState = getUsageState(chatsRemaining, 2)
  const photoState = getUsageState(photosRemaining, 1)

  const animationProps = prefersReducedMotion
    ? { initial: false, animate: false }
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }

  const progressAnimation = getProgressAnimation(prefersReducedMotion)
  const progressAnimationDelayed = getProgressAnimation(prefersReducedMotion, 0.1)

  return (
    <motion.div
      {...animationProps}
      className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Today's Usage
        </h3>
        <span className="text-xs text-[#6B6B6B]">Resets at midnight</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1.5 text-[#4A4A4A]">
              <MessageCircle className="w-3.5 h-3.5 text-[#7EC8C8]" aria-hidden="true" />
              <span>Chats</span>
            </div>
            <span className={`font-medium ${STATE_COLORS[chatState]}`}>
              {chatsRemaining}/{maxChats}
            </span>
          </div>
          <div
            className="h-1.5 bg-gray-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={chatsRemaining}
            aria-valuemin={0}
            aria-valuemax={maxChats}
            aria-label={`${chatsRemaining} of ${maxChats} chats remaining`}
          >
            <motion.div
              {...progressAnimation}
              animate={{ width: `${chatPercent}%` }}
              className={`h-full rounded-full ${CHAT_BAR_COLORS[chatState]}`}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1.5 text-[#4A4A4A]">
              <Camera className="w-3.5 h-3.5 text-[#F4A261]" aria-hidden="true" />
              <span>Photos</span>
            </div>
            <span className={`font-medium ${STATE_COLORS[photoState]}`}>
              {photosRemaining}/{maxPhotos}
            </span>
          </div>
          <div
            className="h-1.5 bg-gray-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={photosRemaining}
            aria-valuemin={0}
            aria-valuemax={maxPhotos}
            aria-label={`${photosRemaining} of ${maxPhotos} photo scans remaining`}
          >
            <motion.div
              {...progressAnimationDelayed}
              animate={{ width: `${photoPercent}%` }}
              className={`h-full rounded-full ${PHOTO_BAR_COLORS[photoState]}`}
            />
          </div>
        </div>
      </div>

      <motion.button
        {...(prefersReducedMotion ? {} : { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 } })}
        onClick={onUpgrade}
        className="w-full mt-2.5 py-2 bg-gradient-to-r from-[#3D3D3D] to-[#2A2A2A] text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 text-xs shadow-md hover:shadow-lg transition-shadow focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
      >
        <PremiumIcon size={14} gradient={false} />
        Upgrade for Personalized Care
      </motion.button>
    </motion.div>
  )
}

export default UsageStatsCard
