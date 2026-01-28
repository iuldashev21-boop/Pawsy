import { useState, useMemo, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  MessageCircle,
  Pill,
  Dog,
  Bell,
  Check,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDog } from '../../context/DogContext'
import { useChat } from '../../context/ChatContext'
import PremiumIcon from '../common/PremiumIcon'

const CHECKLIST_ITEMS = [
  {
    id: 'startChat',
    icon: MessageCircle,
    label: 'Start a health chat',
    description: 'Ask Pawsy about any health concern',
    path: '/chat',
    color: '#7EC8C8',
    bgGradient: 'linear-gradient(135deg, rgba(126,200,200,0.15) 0%, rgba(90,175,175,0.1) 100%)',
  },
  {
    id: 'addMedications',
    icon: Pill,
    label: 'Add medications',
    description: 'Track your dog\'s medications and supplements',
    path: '/settings',
    color: '#F4A261',
    bgGradient: 'linear-gradient(135deg, rgba(244,162,97,0.15) 0%, rgba(232,146,79,0.1) 100%)',
  },
  {
    id: 'reviewBreed',
    icon: Dog,
    label: 'Review breed health risks',
    description: 'See health insights for your dog\'s breed',
    path: '/breed-info',
    color: '#E8924F',
    bgGradient: 'linear-gradient(135deg, rgba(232,146,79,0.15) 0%, rgba(212,133,74,0.1) 100%)',
  },
  {
    id: 'checkAlerts',
    icon: Bell,
    label: 'Check health alerts',
    description: 'Review AI-generated health monitoring',
    path: '/alerts',
    color: '#EF5350',
    bgGradient: 'linear-gradient(135deg, rgba(239,83,80,0.12) 0%, rgba(211,47,47,0.08) 100%)',
  },
]

function getStorageKey(userId) {
  return `pawsy_${userId}_post_upgrade_checklist_dismissed`
}

function PostUpgradeChecklist() {
  const prefersReducedMotion = useReducedMotion()
  const { user } = useAuth()
  const { activeDog } = useDog()
  const { getSessionsForDog } = useChat()

  const [dismissed, setDismissed] = useState(() => {
    if (!user) return true
    return localStorage.getItem(getStorageKey(user.id)) === 'true'
  })

  const handleDismiss = useCallback(() => {
    if (user) {
      localStorage.setItem(getStorageKey(user.id), 'true')
    }
    setDismissed(true)
  }, [user])

  // Determine which items are completed based on actual data
  const completedItems = useMemo(() => {
    const completed = new Set()
    if (!activeDog) return completed

    // Has chat sessions?
    const sessions = getSessionsForDog(activeDog.id)
    if (sessions.length > 0) completed.add('startChat')

    // Has medications?
    const meds = activeDog.medications || []
    if (meds.length > 0) completed.add('addMedications')

    // Has breed set?
    if (activeDog.breed) completed.add('reviewBreed')

    // Always mark alerts as available to check
    // (don't auto-complete since it's just a suggestion to visit)

    return completed
  }, [activeDog, getSessionsForDog])

  // Auto-dismiss if all items are completed
  const allCompleted = CHECKLIST_ITEMS.every((item) => completedItems.has(item.id))

  if (dismissed || allCompleted) return null

  const completedCount = completedItems.size
  const totalCount = CHECKLIST_ITEMS.length

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { type: 'spring', stiffness: 300, damping: 24 },
      }

  return (
    <motion.div
      {...animationProps}
      className="rounded-2xl p-4 border"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(253,248,243,0.9) 100%)',
        borderColor: 'rgba(244,162,97,0.2)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(244,162,97,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PremiumIcon size={18} />
          <h3
            className="font-bold text-sm text-[#2D2A26]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Welcome to Premium!
          </h3>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg hover:bg-[#F4A261]/10 text-[#8C7B6B] hover:text-[#6B5E52] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
          aria-label="Dismiss checklist"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <p
        className="text-xs text-[#6B6B6B] mb-3"
        style={{ fontFamily: 'DM Sans, sans-serif' }}
      >
        Let&apos;s set things up &mdash; {completedCount}/{totalCount} complete
      </p>

      {/* Progress bar */}
      <div
        className="h-1.5 bg-[#E8DDD0]/40 rounded-full overflow-hidden mb-4"
        role="progressbar"
        aria-valuenow={completedCount}
        aria-valuemin={0}
        aria-valuemax={totalCount}
        aria-label={`${completedCount} of ${totalCount} setup steps complete`}
      >
        <div
          className="h-full bg-gradient-to-r from-[#F4A261] to-[#E8924F] rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item) => {
          const Icon = item.icon
          const isCompleted = completedItems.has(item.id)
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all group ${
                isCompleted
                  ? 'opacity-60'
                  : 'hover:bg-[#F4A261]/[0.04]'
              } focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2`}
              style={{
                background: isCompleted ? 'rgba(102,187,106,0.06)' : 'transparent',
                border: '1px solid',
                borderColor: isCompleted ? 'rgba(102,187,106,0.15)' : 'rgba(232,221,208,0.35)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: isCompleted
                    ? 'linear-gradient(135deg, rgba(102,187,106,0.15) 0%, rgba(102,187,106,0.1) 100%)'
                    : item.bgGradient,
                }}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-[#66BB6A]" aria-hidden="true" />
                ) : (
                  <Icon className="w-4 h-4" style={{ color: item.color }} aria-hidden="true" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-bold text-[13px] leading-tight ${
                    isCompleted ? 'text-[#66BB6A] line-through' : 'text-[#2D2A26]'
                  }`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {item.label}
                </h4>
                <p
                  className="text-[11px] text-[#8C7B6B] leading-tight"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  {item.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}

export default PostUpgradeChecklist
