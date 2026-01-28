import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Clock, ChevronRight } from 'lucide-react'
import { useDog } from '../../context/DogContext'
import { useChat } from '../../context/ChatContext'
import PremiumGate from '../common/PremiumGate'
import { warmCardStyle } from '../../constants/cardStyles'

function formatTimestamp(isoString) {
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function RecentChatsContent() {
  const { activeDog } = useDog()
  const { getSessionsForDog } = useChat()

  const recentSessions = useMemo(() => {
    if (!activeDog) return []
    const sessions = getSessionsForDog(activeDog.id)
    // Sort by updatedAt descending, take top 3
    return [...sessions]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 3)
  }, [activeDog, getSessionsForDog])

  const isEmpty = recentSessions.length === 0

  if (isEmpty) {
    return (
      <div className="rounded-2xl p-4" style={warmCardStyle}>
        <div className="text-center py-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{
              background:
                'linear-gradient(135deg, rgba(126,200,200,0.15) 0%, rgba(90,175,175,0.1) 100%)',
            }}
          >
            <MessageCircle
              className="w-5 h-5 text-[#7EC8C8]"
              aria-hidden="true"
            />
          </div>
          <p
            className="text-[13px] text-[#6B6B6B] mb-1 leading-relaxed font-medium"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Your conversations will appear here
          </p>
          <p
            className="text-[11px] text-[#8C7B6B] mb-3 leading-relaxed"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Chat about symptoms, diet, or any health concerns
          </p>
          <Link
            to="/chat"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#F4A261] hover:text-[#E8924F] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 rounded"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
            Start chatting
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={warmCardStyle}>
      {recentSessions.map((session, idx) => {
        const messageCount = session.messages?.length || 0
        return (
          <div key={session.id}>
            {idx > 0 && (
              <div
                className="h-px mx-4"
                style={{ background: 'rgba(232,221,208,0.4)' }}
              />
            )}
            <div className="px-4 py-3 flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(126,200,200,0.15) 0%, rgba(90,175,175,0.1) 100%)',
                }}
              >
                <MessageCircle
                  className="w-4 h-4 text-[#5AB3B3]"
                  aria-hidden="true"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className="font-bold text-[13px] text-[#2D2A26] leading-tight truncate"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {session.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-[11px] text-[#8C7B6B]"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {messageCount} message{messageCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-[#DDD4C8]">&middot;</span>
                  <span
                    className="text-[11px] text-[#A09585] flex items-center gap-1"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {formatTimestamp(session.updatedAt)}
                  </span>
                </div>
              </div>
              <ChevronRight
                className="w-4 h-4 text-[#C5B8A8] flex-shrink-0"
                aria-hidden="true"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RecentChats() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-0.5">
        <h3
          className="font-bold text-sm text-[#2D2A26]"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Recent Chats
        </h3>
      </div>

      <PremiumGate
        variant="overlay"
        title="Chat History"
        description="View and search your past chat sessions with Pawsy."
      >
        <RecentChatsContent />
      </PremiumGate>
    </div>
  )
}

export default RecentChats
