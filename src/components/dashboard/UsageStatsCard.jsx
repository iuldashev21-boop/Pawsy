import { motion } from 'framer-motion'
import { MessageCircle, Camera } from 'lucide-react'
import { useUsage } from '../../context/UsageContext'
import PremiumIcon from '../common/PremiumIcon'
import { USAGE_LIMITS } from '../../constants/usage'

/**
 * UsageStatsCard - Shows remaining daily usage on Dashboard
 * Displays progress bars for chats and photo scans
 * Shows upgrade prompt when usage is low
 */
function UsageStatsCard({ onUpgrade }) {
  const { chatsRemaining, photosRemaining, isFirstDay } = useUsage()

  const maxChats = isFirstDay ? USAGE_LIMITS.firstDayChats : USAGE_LIMITS.dailyChats
  const maxPhotos = isFirstDay ? USAGE_LIMITS.firstDayPhotos : USAGE_LIMITS.dailyPhotos

  const chatPercent = (chatsRemaining / maxChats) * 100
  const photoPercent = (photosRemaining / maxPhotos) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Today's Usage
        </h3>
        <span className="text-xs text-[#9E9E9E]">Resets at midnight</span>
      </div>

      <div className="space-y-4">
        {/* Chat usage */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <div className="flex items-center gap-2 text-[#4A4A4A]">
              <MessageCircle className="w-4 h-4 text-[#7EC8C8]" />
              <span>AI Chats</span>
            </div>
            <span className={`font-medium ${chatsRemaining <= 2 ? 'text-[#F4A261]' : 'text-[#3D3D3D]'}`}>
              {chatsRemaining}/{maxChats}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${chatPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                chatsRemaining <= 2 ? 'bg-[#F4A261]' : 'bg-[#7EC8C8]'
              }`}
            />
          </div>
        </div>

        {/* Photo usage */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <div className="flex items-center gap-2 text-[#4A4A4A]">
              <Camera className="w-4 h-4 text-[#F4A261]" />
              <span>Photo Scans</span>
            </div>
            <span className={`font-medium ${photosRemaining <= 1 ? 'text-[#F4A261]' : 'text-[#3D3D3D]'}`}>
              {photosRemaining}/{maxPhotos}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${photoPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className={`h-full rounded-full ${
                photosRemaining <= 1 ? 'bg-[#EF5350]' : 'bg-[#F4A261]'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Upgrade CTA - always visible */}
      <motion.button
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={onUpgrade}
        className="w-full mt-4 py-3 bg-gradient-to-r from-[#3D3D3D] to-[#2A2A2A] text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg transition-shadow"
      >
        <PremiumIcon size={18} gradient={false} />
        Upgrade for Unlimited Access
      </motion.button>
    </motion.div>
  )
}

export default UsageStatsCard
