import { motion, useReducedMotion } from 'framer-motion'
import { X, MessageSquare, Trash2, Clock } from 'lucide-react'
import PremiumGate from '../common/PremiumGate'
import { usePremium } from '../../hooks/usePremium'

/**
 * ChatHistory - Displays list of past chat sessions.
 *
 * Props:
 * - sessions: Array of session objects with { id, title, messages, createdAt, updatedAt }
 * - onLoadSession: (sessionId) => void
 * - onDeleteSession: (sessionId) => void
 * - onClose: () => void
 */
function ChatHistory({ sessions, onLoadSession, onDeleteSession, onClose }) {
  const prefersReducedMotion = useReducedMotion()
  const { isPremium } = usePremium()

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  )

  function formatDate(dateStr) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const containerAnim = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }

  const itemAnim = (i) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: i * 0.05 },
        }

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E8E8]/50">
        <h2
          className="text-base font-bold text-[#3D3D3D]"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Chat History
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-[#F4A261]/10 transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
          aria-label="Close history"
        >
          <X className="w-5 h-5 text-[#6B6B6B]" />
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {sortedSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FFF5ED] flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-[#F4A261]" aria-hidden="true" />
            </div>
            <p
              className="text-sm font-semibold text-[#3D3D3D] mb-1"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              No conversations yet
            </p>
            <p className="text-xs text-[#9E9E9E]">
              Start chatting with Pawsy to see your history here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedSessions.map((session, i) => (
              <motion.div
                key={session.id}
                {...itemAnim(i)}
                className="group relative bg-white rounded-xl border border-[#E8E8E8]/50 hover:border-[#F4A261]/30 transition-colors"
                style={{
                  boxShadow:
                    '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)',
                }}
              >
                <button
                  onClick={() => onLoadSession(session.id)}
                  className="w-full text-left px-4 py-3 rounded-xl focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FFF5ED] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageSquare
                        className="w-4 h-4 text-[#F4A261]"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold text-[#3D3D3D] truncate"
                        style={{ fontFamily: 'Nunito, sans-serif' }}
                      >
                        {session.title || 'Untitled conversation'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock
                          className="w-3 h-3 text-[#9E9E9E]"
                          aria-hidden="true"
                        />
                        <span className="text-xs text-[#9E9E9E]">
                          {formatDate(session.updatedAt || session.createdAt)}
                        </span>
                        <span className="text-xs text-[#E8E8E8]">&middot;</span>
                        <span className="text-xs text-[#9E9E9E]">
                          {session.messages?.length || 0} messages
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSession(session.id)
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:opacity-100"
                  aria-label={`Delete session ${session.title || 'Untitled'}`}
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#9E9E9E] hover:text-red-500" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // Wrap with PremiumGate for free users
  if (!isPremium && sessions.length > 0) {
    return (
      <motion.div {...containerAnim} className="h-full">
        <PremiumGate
          variant="overlay"
          title="Chat History"
          description="Save and revisit past conversations with Pawsy."
        >
          {content}
        </PremiumGate>
      </motion.div>
    )
  }

  return <motion.div {...containerAnim}>{content}</motion.div>
}

export default ChatHistory
