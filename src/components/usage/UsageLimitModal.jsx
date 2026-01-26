import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, MapPin, MessageCircle, Camera } from 'lucide-react'
import { Link } from 'react-router-dom'
import PremiumIcon from '../common/PremiumIcon'
import { USAGE_LIMITS } from '../../constants/usage'

/**
 * UsageLimitModal - Shown when user reaches their daily limit
 *
 * Props:
 * - type: 'chat' | 'photo'
 * - isOpen: boolean
 * - onClose: () => void
 * - onEmergency: () => void - Called when emergency override used
 * - onUpgrade: () => void - Called when upgrade clicked
 * - emergencyRemaining: number - Emergency uses left
 */
function UsageLimitModal({
  type = 'chat',
  isOpen,
  onClose,
  onEmergency,
  onUpgrade,
  emergencyRemaining = 0,
}) {
  const isChat = type === 'chat'
  const limit = isChat ? USAGE_LIMITS.dailyChats : USAGE_LIMITS.dailyPhotos
  const labelPlural = isChat ? 'chats' : 'photo scans'
  const labelSingular = isChat ? 'chat' : 'scan'
  const HeaderIcon = isChat ? MessageCircle : Camera
  const dialogRef = useRef(null)

  // ESC key dismissal + focus trap
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Focus the close button on open
    const timer = setTimeout(() => {
      const closeBtn = dialogRef.current?.querySelector('[aria-label="Close"]')
      closeBtn?.focus()
    }, 100)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="usage-limit-modal-title"
      >
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-sm w-full shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#FDF8F3] to-[#FFE8D6] px-6 pt-6 pb-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/50 text-[#9E9E9E]"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#FFE4B5] to-[#FFD699] flex items-center justify-center">
                <HeaderIcon className="w-8 h-8 text-[#B8860B]" />
              </div>
              <h2
                id="usage-limit-modal-title"
                className="text-xl font-bold text-[#3D3D3D]"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                You've used all {limit} free {labelPlural}
              </h2>
              <p className="text-sm text-[#6B6B6B] mt-1">
                Resets at midnight
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-4">
            {/* Upgrade CTA */}
            <button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-[#FFD54F] via-[#F4A261] to-[#E8924F] text-white rounded-xl py-3 px-4 font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-shadow"
            >
              <PremiumIcon size={20} gradient={false} />
              Get Personalized Care
            </button>

            <p className="text-center text-xs text-[#9E9E9E]">
              Unlimited {labelPlural} + AI that remembers your dog's health history
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#E8E8E8]" />
              <span className="text-xs text-[#9E9E9E]">or</span>
              <div className="flex-1 h-px bg-[#E8E8E8]" />
            </div>

            {/* Emergency Override */}
            {emergencyRemaining > 0 ? (
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-semibold text-[#3D3D3D] text-sm"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      Is this an emergency?
                    </h3>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">
                      Your dog's safety comes first. Use an emergency {labelSingular} if your pet needs urgent help.
                    </p>
                    <button
                      onClick={onEmergency}
                      className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 px-3 text-sm font-medium transition-colors"
                    >
                      Emergency {isChat ? 'Chat' : 'Scan'} ({emergencyRemaining} remaining)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-[#6B6B6B] text-center">
                  No emergency {labelPlural} remaining today.
                  <br />
                  <span className="text-xs">Come back tomorrow or upgrade to Premium.</span>
                </p>
              </div>
            )}

            {/* Emergency Vet Link */}
            <Link
              to="/emergency-vet"
              className="flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors py-2"
            >
              <MapPin className="w-4 h-4" />
              Find Emergency Vet Near Me
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default UsageLimitModal
