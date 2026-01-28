import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  MessageCircle,
  Camera,
  AlertCircle,
  Clock,
  ChevronRight,
  X,
} from 'lucide-react'

const URGENCY_COLORS = {
  low: {
    bg: 'bg-green-100',
    border: 'border-green-300',
    text: 'text-green-700',
    dot: 'bg-green-500',
    label: 'Low concern'
  },
  moderate: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-300',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
    label: 'Moderate'
  },
  urgent: {
    bg: 'bg-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    label: 'Urgent'
  },
  emergency: {
    bg: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-700',
    dot: 'bg-red-500',
    label: 'Emergency'
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function countByUrgency(events) {
  return Object.entries(
    events.reduce((acc, e) => {
      acc[e.urgency] = (acc[e.urgency] || 0) + 1
      return acc
    }, {})
  )
}

export default function HealthTimeline({ events = [], dogName = 'your dog', onViewAll, onEventSelect }) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const selectedColors = selectedEvent
    ? URGENCY_COLORS[selectedEvent.urgency] || URGENCY_COLORS.low
    : null

  const timelineEvents = [...events]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-5)

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#E8E8E8]/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#3D3D3D]">Health Timeline</h3>
        </div>
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-[#F4A261]/10 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-[#F4A261]" />
          </div>
          <p className="text-sm text-[#6B6B6B]">No health events yet</p>
          <p className="text-xs text-[#9E9E9E] mt-1">
            Chat with Pawsy about {dogName}'s health to start tracking
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E8E8E8]/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#3D3D3D]">Health Timeline</h3>
          {events.length > 5 && (
            <button
              onClick={onViewAll}
              className="text-xs text-[#F4A261] font-medium flex items-center gap-1 hover:text-[#E8924F]"
            >
              View all
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Horizontal Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gradient-to-r from-[#E8E8E8] via-[#F4A261]/30 to-[#E8E8E8]" />

          {/* Timeline nodes */}
          <div className="flex justify-between px-2 overflow-x-auto pb-2 scrollbar-hide">
            {timelineEvents.map((event) => {
              const colors = URGENCY_COLORS[event.urgency] || URGENCY_COLORS.low
              const isSelected = selectedEvent?.id === event.id

              return (
                <motion.button
                  key={event.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedEvent(isSelected ? null : event)}
                  className="flex flex-col items-center min-w-[60px] relative z-10"
                >
                  {/* Node */}
                  <motion.div
                    animate={isSelected ? { scale: 1.2 } : { scale: 1 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${colors.bg} ${colors.border} shadow-sm`}
                  >
                    {event.type === 'photo' ? (
                      <Camera className={`w-4 h-4 ${colors.text}`} />
                    ) : event.type === 'symptom' ? (
                      <AlertCircle className={`w-4 h-4 ${colors.text}`} />
                    ) : (
                      <MessageCircle className={`w-4 h-4 ${colors.text}`} />
                    )}
                  </motion.div>

                  {/* Date label */}
                  <span className="text-[10px] text-[#6B6B6B] mt-2 whitespace-nowrap">
                    {formatDate(event.timestamp)}
                  </span>

                  {/* Urgency dot */}
                  <div className={`w-2 h-2 rounded-full ${colors.dot} mt-1`} />
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Selected Event Details */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className={`mt-4 p-3 rounded-xl ${selectedColors.bg} border ${selectedColors.border}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${selectedColors.text}`}>
                        {selectedColors.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(selectedEvent.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-[#3D3D3D] font-medium">
                      {selectedEvent.title}
                    </p>
                    {selectedEvent.summary && (
                      <p className="text-xs text-[#6B6B6B] mt-1 line-clamp-2">
                        {selectedEvent.summary}
                      </p>
                    )}
                    {selectedEvent.symptoms && selectedEvent.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedEvent.symptoms.slice(0, 3).map((symptom, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-[#6B6B6B]"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    )}
                    {onEventSelect && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventSelect(selectedEvent.id)
                        }}
                        className="mt-2 flex items-center gap-1 text-xs font-medium text-[#F4A261] hover:text-[#E8924F] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 rounded"
                      >
                        View details
                        <ChevronRight className="w-3 h-3" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedEvent(null)
                    }}
                    className="p-1 rounded-lg hover:bg-white/50 text-gray-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent summary */}
        <div className="mt-4 pt-3 border-t border-[#E8E8E8]/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6B6B6B]">
              {events.length} health event{events.length !== 1 ? 's' : ''} tracked
            </span>
            <div className="flex items-center gap-3">
              {countByUrgency(events).map(([urgency, count]) => (
                <div key={urgency} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${URGENCY_COLORS[urgency]?.dot || 'bg-gray-400'}`} />
                  <span className="text-[#9E9E9E]">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
    </div>
  )
}
