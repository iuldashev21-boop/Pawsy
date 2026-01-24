import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'
import { PremiumBadge } from '../common/PremiumIcon'

/**
 * DashboardPremiumCard - Soft premium upsell on Dashboard
 * Dismissable, shows key premium benefits
 */
function DashboardPremiumCard({ dogName = 'your dog', onUpgrade }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gradient-to-br from-[#FFF8E7] via-[#FFE4B5] to-[#FFD699] rounded-2xl p-4 border border-[#E8B855]/30 relative shadow-sm"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)' }}
    >
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/50 text-[#B8860B] hover:text-[#8B6914] transition-colors"
        aria-label="Dismiss premium card"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <PremiumBadge size={40} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Unlock Premium
          </h3>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Unlimited chats, saved history, and health tracking for {dogName}
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onUpgrade}
            className="mt-3 text-sm font-medium text-[#F4A261] hover:text-[#E8924F] transition-colors flex items-center gap-1"
          >
            Learn more
            <span aria-hidden="true">→</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default DashboardPremiumCard
