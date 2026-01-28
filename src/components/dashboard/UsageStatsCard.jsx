import { motion, useReducedMotion } from 'framer-motion'
import { MessageCircle, Camera } from 'lucide-react'
import { useUsage } from '../../context/UsageContext'
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

function UsageStatsCard({ inline = false }) {
  const { chatsRemaining, photosRemaining, isFirstDay } = useUsage()
  const prefersReducedMotion = useReducedMotion()

  const maxChats = isFirstDay ? USAGE_LIMITS.firstDayChats : USAGE_LIMITS.dailyChats
  const maxPhotos = isFirstDay ? USAGE_LIMITS.firstDayPhotos : USAGE_LIMITS.dailyPhotos

  const chatPercent = (chatsRemaining / maxChats) * 100
  const photoPercent = (photosRemaining / maxPhotos) * 100

  const chatState = getUsageState(chatsRemaining, 2)
  const photoState = getUsageState(photosRemaining, 1)

  const progressAnimation = getProgressAnimation(prefersReducedMotion)
  const progressAnimationDelayed = getProgressAnimation(prefersReducedMotion, 0.1)

  if (inline) {
    return (
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#E8DDD0]/40">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#8C7B6B] mb-1">
            <MessageCircle className="w-3 h-3 text-[#7EC8C8]" aria-hidden="true" />
            <span>Chats</span>
            <span className={`font-medium ml-auto ${STATE_COLORS[chatState]}`}>
              {chatsRemaining}/{maxChats}
            </span>
          </div>
          <div
            className="h-1 bg-gray-100 rounded-full overflow-hidden"
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#8C7B6B] mb-1">
            <Camera className="w-3 h-3 text-[#F4A261]" aria-hidden="true" />
            <span>Photos</span>
            <span className={`font-medium ml-auto ${STATE_COLORS[photoState]}`}>
              {photosRemaining}/{maxPhotos}
            </span>
          </div>
          <div
            className="h-1 bg-gray-100 rounded-full overflow-hidden"
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
    )
  }

  const animationProps = prefersReducedMotion
    ? { initial: false, animate: false }
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }

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

    </motion.div>
  )
}

export default UsageStatsCard
