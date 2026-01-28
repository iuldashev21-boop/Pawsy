import { motion, useReducedMotion } from 'framer-motion'
import {
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageCircle,
  Camera,
  PenLine,
  Tag,
  Activity,
  Calendar,
  FileText,
  ChevronRight,
} from 'lucide-react'

const STATUS_STYLES = {
  active: {
    bg: 'bg-[#7EC8C8]/10',
    text: 'text-[#5FB3B3]',
    border: 'border-[#7EC8C8]/30',
    label: 'Active',
  },
  monitoring: {
    bg: 'bg-[#FFCA28]/10',
    text: 'text-[#D4A012]',
    border: 'border-[#FFCA28]/30',
    label: 'Monitoring',
  },
  resolved: {
    bg: 'bg-[#66BB6A]/10',
    text: 'text-[#4CAF50]',
    border: 'border-[#66BB6A]/30',
    label: 'Resolved',
  },
}

const SEVERITY_STYLES = {
  mild: { bg: 'bg-green-50', text: 'text-green-700', label: 'Mild' },
  moderate: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Moderate' },
  severe: { bg: 'bg-red-50', text: 'text-red-700', label: 'Severe' },
}

const SOURCE_ICONS = {
  chat: MessageCircle,
  photo: Camera,
  manual: PenLine,
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * HealthEventDetail - Expanded view of a single health event.
 *
 * Props:
 * - event: PetFact object
 * - onClose: () => void
 * - onResolve: (event) => void
 * - onUpdate: (event, updates) => void
 */
function HealthEventDetail({ event, onClose, onResolve, onUpdate }) {
  const prefersReducedMotion = useReducedMotion()

  if (!event) return null

  const statusStyle = STATUS_STYLES[event.status] || STATUS_STYLES.active
  const severityStyle = SEVERITY_STYLES[event.severity] || SEVERITY_STYLES.mild
  const SourceIcon = SOURCE_ICONS[event.source?.type] || FileText
  const isResolved = event.status === 'resolved'

  const handleResolve = () => {
    if (onResolve) {
      onResolve(event)
    }
  }

  const handleToggleMonitoring = () => {
    if (!onUpdate) return
    const nextStatus = event.status === 'monitoring' ? 'active' : 'monitoring'
    onUpdate(event, { status: nextStatus })
  }

  const overlayAnimation = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }

  const panelAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 24 },
        transition: { type: 'spring', stiffness: 300, damping: 24 },
      }

  return (
    <motion.div
      {...overlayAnimation}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        {...panelAnimation}
        className="w-full max-w-lg bg-white rounded-t-3xl overflow-hidden max-h-[85vh] overflow-y-auto"
        style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#E8E8E8]" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                {event.status === 'resolved' && <CheckCircle className="w-3 h-3" aria-hidden="true" />}
                {event.status === 'monitoring' && <Clock className="w-3 h-3" aria-hidden="true" />}
                {event.status === 'active' && <Activity className="w-3 h-3" aria-hidden="true" />}
                {statusStyle.label}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${severityStyle.bg} ${severityStyle.text}`}>
                {severityStyle.label}
              </span>
            </div>
            <h2
              className="text-lg font-bold text-[#3D3D3D] leading-snug"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {event.fact}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0 ml-2 focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            aria-label="Close details"
          >
            <X className="w-5 h-5 text-[#6B6B6B]" aria-hidden="true" />
          </button>
        </div>

        {/* Details body */}
        <div className="px-5 pb-6 space-y-4">
          {/* Category and Source */}
          <div className="flex items-center gap-4 text-xs text-[#6B6B6B]">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="capitalize">{event.category || 'General'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <SourceIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="capitalize">From {event.source?.type || 'unknown'}</span>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-[#FAF6F1] rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[#F4A261]" aria-hidden="true" />
              <span className="text-[#3D3D3D] font-medium">Occurred:</span>
              <span className="text-[#6B6B6B]">
                {formatDate(event.occurredAt)} {formatTime(event.occurredAt) && `at ${formatTime(event.occurredAt)}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-[#9E9E9E]" aria-hidden="true" />
              <span className="text-[#3D3D3D] font-medium">Logged:</span>
              <span className="text-[#6B6B6B]">{formatDate(event.createdAt)}</span>
            </div>
            {event.resolvedAt && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-[#66BB6A]" aria-hidden="true" />
                <span className="text-[#3D3D3D] font-medium">Resolved:</span>
                <span className="text-[#6B6B6B]">{formatDate(event.resolvedAt)}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {Array.isArray(event.tags) && event.tags.length > 0 && (
            <div>
              <h4
                className="text-xs font-semibold text-[#3D3D3D] mb-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-[#F4A261]/10 text-[#E8924F] text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Possible Conditions */}
          {Array.isArray(event.possibleConditions) && event.possibleConditions.length > 0 && (
            <div>
              <h4
                className="text-xs font-semibold text-[#3D3D3D] mb-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Possible Conditions
              </h4>
              <div className="space-y-1.5">
                {event.possibleConditions.map((condition, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#FFCA28] flex-shrink-0" aria-hidden="true" />
                    <span>{condition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          {Array.isArray(event.recommendedActions) && event.recommendedActions.length > 0 && (
            <div>
              <h4
                className="text-xs font-semibold text-[#3D3D3D] mb-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Recommended Actions
              </h4>
              <div className="space-y-1.5">
                {event.recommendedActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-[#6B6B6B]">
                    <ChevronRight className="w-3.5 h-3.5 text-[#7EC8C8] flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {event.notes && (
            <div>
              <h4
                className="text-xs font-semibold text-[#3D3D3D] mb-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Notes
              </h4>
              <p className="text-sm text-[#6B6B6B] bg-[#FAF6F1] rounded-xl p-3">
                {event.notes}
              </p>
            </div>
          )}

          {/* Action buttons */}
          {!isResolved && (
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleToggleMonitoring}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E8E8] text-sm font-medium text-[#6B6B6B] hover:bg-gray-50 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
              >
                {event.status === 'monitoring' ? 'Set Active' : 'Monitor'}
              </button>
              <button
                type="button"
                onClick={handleResolve}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[#66BB6A] to-[#4CAF50] text-sm font-semibold text-white shadow-md hover:shadow-lg transition-shadow min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#66BB6A] focus-visible:ring-offset-2"
              >
                <CheckCircle className="w-4 h-4" aria-hidden="true" />
                Mark Resolved
              </button>
            </div>
          )}

          {isResolved && (
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#66BB6A]/10 text-[#4CAF50] text-sm font-medium">
              <CheckCircle className="w-4 h-4" aria-hidden="true" />
              This event has been resolved
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default HealthEventDetail
