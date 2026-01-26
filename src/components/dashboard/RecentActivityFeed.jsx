import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MessageCircle, Camera, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDog } from '../../context/DogContext'
import { useChat } from '../../context/ChatContext'

const MS_PER_MINUTE = 60000
const MS_PER_HOUR = 3600000
const MS_PER_DAY = 86400000

function getRelativeTime(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime()

  const minutes = Math.floor(diffMs / MS_PER_MINUTE)
  const hours = Math.floor(diffMs / MS_PER_HOUR)
  const days = Math.floor(diffMs / MS_PER_DAY)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getSessionIcon(session) {
  const hasImage = session.messages?.some(m => m.image)
  return hasImage ? Camera : MessageCircle
}

function RecentActivityFeed() {
  const { activeDog } = useDog()
  const { getSessionsForDog } = useChat()
  const prefersReducedMotion = useReducedMotion()
  const dogId = activeDog?.id

  const recentSessions = useMemo(() => {
    if (!dogId) return []
    const sessions = getSessionsForDog(dogId)
    return [...sessions]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 3)
  }, [dogId, getSessionsForDog])

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
      }

  return (
    <motion.div
      {...animationProps}
      className="rounded-xl p-3.5 border border-[#E8DDD0]/50 bg-white shadow-sm"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)' }}
    >
      <h4
        className="text-xs font-bold text-[#2D2A26] mb-2.5"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        Recent Activity
      </h4>

      {recentSessions.length === 0 ? (
        <div className="text-center py-3">
          <Clock className="w-5 h-5 text-[#C5B8A8] mx-auto mb-1.5" aria-hidden="true" />
          <p className="text-[11px] text-[#8C7B6B]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            No activity yet
          </p>
          <Link
            to="/chat"
            className="inline-block mt-1.5 text-[11px] font-semibold text-[#E8924F] hover:text-[#D4854A] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-1 rounded"
          >
            Start a health check
          </Link>
        </div>
      ) : (
        <div className="space-y-0">
          {recentSessions.map((session, idx) => {
            const Icon = getSessionIcon(session)
            const title = session.title || 'Health check'
            return (
              <div key={session.id}>
                <div className="flex items-center gap-2.5 py-1.5">
                  <div className="w-7 h-7 rounded-lg bg-[#F5F0EA] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[#8C7B6B]" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[11px] font-medium text-[#3D3D3D] truncate"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                      {title}
                    </p>
                  </div>
                  <span
                    className="text-[10px] text-[#B5A898] flex-shrink-0"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {getRelativeTime(session.updatedAt)}
                  </span>
                </div>
                {idx < recentSessions.length - 1 && (
                  <div className="h-px ml-9.5 bg-[#F0EBE4]" style={{ marginLeft: '38px' }} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

export default RecentActivityFeed
