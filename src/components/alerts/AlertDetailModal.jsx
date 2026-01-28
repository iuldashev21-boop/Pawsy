import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  X,
  ShieldAlert,
  Activity,
  Syringe,
  TrendingUp,
  MessageCircle,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Type config (mirrors AlertCard styling)
// ---------------------------------------------------------------------------

const TYPE_CONFIG = {
  breed_risk: {
    icon: ShieldAlert,
    label: 'Breed Risk',
    iconBg: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(217,119,6,0.1) 100%)',
    iconColor: '#D97706',
    accentColor: '#D97706',
  },
  symptom_pattern: {
    icon: Activity,
    label: 'Pattern',
    iconBg: 'linear-gradient(135deg, rgba(126,200,200,0.2) 0%, rgba(90,175,175,0.15) 100%)',
    iconColor: '#5FB3B3',
    accentColor: '#5FB3B3',
  },
  vaccination_due: {
    icon: Syringe,
    label: 'Vaccination',
    iconBg: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.1) 100%)',
    iconColor: '#2563EB',
    accentColor: '#2563EB',
  },
  weight_trend: {
    icon: TrendingUp,
    label: 'Weight',
    iconBg: 'linear-gradient(135deg, rgba(147,51,234,0.15) 0%, rgba(124,58,237,0.1) 100%)',
    iconColor: '#7C3AED',
    accentColor: '#7C3AED',
  },
}

const PRIORITY_LABELS = {
  high: { text: 'High Priority', color: '#EF5350', bg: 'rgba(239,83,80,0.1)' },
  medium: { text: 'Medium Priority', color: '#F4A261', bg: 'rgba(244,162,97,0.1)' },
  low: { text: 'Low Priority', color: '#66BB6A', bg: 'rgba(102,187,106,0.1)' },
}

// ---------------------------------------------------------------------------
// Date formatting helper
// ---------------------------------------------------------------------------

function formatDate(isoStr) {
  if (!isoStr) return 'N/A'
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ---------------------------------------------------------------------------
// Type-specific detail views
// ---------------------------------------------------------------------------

function BreedRiskDetails({ alert }) {
  const meta = alert.metadata || {}
  return (
    <div className="space-y-3">
      <DetailRow label="Breed" value={meta.breed || 'Unknown'} />
      <DetailRow label="Condition" value={meta.conditionName || alert.title} />
      {meta.severity && (
        <DetailRow label="Severity" value={meta.severity} />
      )}
      {meta.ageRange && (
        <DetailRow
          label="Risk Age Range"
          value={`${meta.ageRange.min} - ${meta.ageRange.max} years`}
        />
      )}
      <div className="pt-2 border-t border-[#E8DDD0]/40">
        <h4
          className="text-xs font-bold text-[#3D3D3D] mb-2 uppercase tracking-wide"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Recommended Screenings
        </h4>
        <ul className="space-y-1.5">
          <ScreeningItem text="Regular veterinary check-ups" />
          <ScreeningItem text="X-ray or imaging for early detection" />
          <ScreeningItem text="Weight management program" />
        </ul>
      </div>
    </div>
  )
}

function SymptomPatternDetails({ alert }) {
  const meta = alert.metadata || {}
  return (
    <div className="space-y-3">
      <DetailRow label="Symptom" value={meta.tag || 'Unknown'} />
      <DetailRow label="Occurrences" value={String(meta.count || 0)} />
      {meta.firstSeen && (
        <DetailRow label="First Seen" value={formatDate(meta.firstSeen)} />
      )}
      {meta.lastSeen && (
        <DetailRow label="Last Seen" value={formatDate(meta.lastSeen)} />
      )}
      {meta.factIds && meta.factIds.length > 0 && (
        <DetailRow
          label="Related Records"
          value={`${meta.factIds.length} PetFact entries`}
        />
      )}
    </div>
  )
}

function VaccinationDueDetails({ alert }) {
  const meta = alert.metadata || {}
  return (
    <div className="space-y-3">
      <DetailRow label="Vaccine" value={meta.vaccinationName || 'Unknown'} />
      {meta.nextDueDate && (
        <DetailRow label="Due Date" value={formatDate(meta.nextDueDate)} />
      )}
      <DetailRow
        label="Time Remaining"
        value={
          meta.daysUntil != null
            ? meta.daysUntil < 0
              ? `${Math.abs(meta.daysUntil)} days overdue`
              : `${meta.daysUntil} days`
            : 'N/A'
        }
      />
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF5ED]">
        <Calendar className="w-4 h-4 text-[#F4A261]" aria-hidden="true" />
        <p
          className="text-xs text-[#6B6B6B]"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          Schedule an appointment with your vet soon.
        </p>
      </div>
    </div>
  )
}

function WeightTrendDetails({ alert }) {
  const meta = alert.metadata || {}
  return (
    <div className="space-y-3">
      <DetailRow
        label="Trend"
        value={meta.direction === 'gain' ? 'Weight Gain' : 'Weight Loss'}
      />
      <DetailRow label="Change" value={`${meta.percentChange || 0}%`} />
      <DetailRow
        label="Previous Weight"
        value={meta.earliestWeight != null ? `${meta.earliestWeight} lbs` : 'N/A'}
      />
      <DetailRow
        label="Current Weight"
        value={meta.latestWeight != null ? `${meta.latestWeight} lbs` : 'N/A'}
      />
      {meta.earliestDate && (
        <DetailRow label="Period Start" value={formatDate(meta.earliestDate)} />
      )}
      {meta.latestDate && (
        <DetailRow label="Period End" value={formatDate(meta.latestDate)} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span
        className="text-xs text-[#9E9E9E] font-medium"
        style={{ fontFamily: 'DM Sans, sans-serif' }}
      >
        {label}
      </span>
      <span
        className="text-xs font-semibold text-[#3D3D3D]"
        style={{ fontFamily: 'DM Sans, sans-serif' }}
      >
        {value}
      </span>
    </div>
  )
}

function ScreeningItem({ text }) {
  return (
    <li className="flex items-center gap-2">
      <CheckCircle className="w-3.5 h-3.5 text-[#66BB6A] flex-shrink-0" aria-hidden="true" />
      <span
        className="text-xs text-[#6B6B6B]"
        style={{ fontFamily: 'DM Sans, sans-serif' }}
      >
        {text}
      </span>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Detail view resolver
// ---------------------------------------------------------------------------

const DETAIL_VIEWS = {
  breed_risk: BreedRiskDetails,
  symptom_pattern: SymptomPatternDetails,
  vaccination_due: VaccinationDueDetails,
  weight_trend: WeightTrendDetails,
}

// ---------------------------------------------------------------------------
// AlertDetailModal
// ---------------------------------------------------------------------------

/**
 * AlertDetailModal - Type-specific alert detail view
 *
 * @param {object} props
 * @param {object|null} props.alert - The alert to display, or null to hide
 * @param {function} props.onClose - Called when the modal is dismissed
 */
function AlertDetailModal({ alert, onClose }) {
  const prefersReducedMotion = useReducedMotion()

  if (!alert) return null

  const config = TYPE_CONFIG[alert.type] || TYPE_CONFIG.breed_risk
  const Icon = config.icon
  const priority = PRIORITY_LABELS[alert.priority] || PRIORITY_LABELS.low
  const DetailView = DETAIL_VIEWS[alert.type] || BreedRiskDetails
  const isUrgent = alert.priority === 'high'

  const overlayVariants = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }

  const drawerVariants = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
        exit: { opacity: 0, y: 40, transition: { duration: 0.2 } },
      }

  return (
    <AnimatePresence>
      {alert && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" data-testid="alert-detail-modal">
          {/* Backdrop */}
          <motion.div
            {...overlayVariants}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer / Modal content */}
          <motion.div
            {...drawerVariants}
            role="dialog"
            aria-modal="true"
            aria-label={`Alert details: ${alert.title}`}
            className="relative w-full sm:max-w-md max-h-[85vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-xl"
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-[#E8DDD0]" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 pt-4 pb-3 border-b border-[#E8DDD0]/40">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: config.iconBg }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: config.iconColor }}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h2
                      className="text-base font-bold text-[#2D2A26] leading-tight"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      {alert.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: config.iconBg, color: config.iconColor }}
                      >
                        {config.label}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: priority.bg, color: priority.color }}
                      >
                        {priority.text}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#F5F0EB] flex items-center justify-center hover:bg-[#E8DDD0] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-[#6B6B6B]" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              {/* Message */}
              <p
                className="text-sm text-[#6B6B6B] leading-relaxed mb-4"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                {alert.message}
              </p>

              {/* Type-specific details */}
              <DetailView alert={alert} />

              {/* Urgent warning */}
              {isUrgent && (
                <div className="flex items-center gap-2 mt-4 p-2.5 rounded-xl bg-red-50 border border-red-100">
                  <AlertTriangle className="w-4 h-4 text-[#EF5350] flex-shrink-0" aria-hidden="true" />
                  <p
                    className="text-xs text-[#EF5350] font-medium"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    This is a high-priority alert. Consider consulting your vet soon.
                  </p>
                </div>
              )}
            </div>

            {/* CTA Footer */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-5 py-4 border-t border-[#E8DDD0]/40">
              <div className="flex gap-3">
                <Link
                  to="/chat"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#7EC8C8] focus-visible:ring-offset-2"
                  style={{
                    background: 'linear-gradient(135deg, #7EC8C8 0%, #5FB3B3 100%)',
                    boxShadow: '0 2px 8px rgba(126,200,200,0.3)',
                  }}
                  aria-label="Chat about this"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  Chat about this
                </Link>

                {isUrgent && (
                  <Link
                    to="/emergency-vet"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#EF5350] focus-visible:ring-offset-2"
                    style={{
                      background: 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)',
                      boxShadow: '0 2px 8px rgba(239,83,80,0.3)',
                    }}
                    aria-label="Find vet"
                  >
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    Find vet
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AlertDetailModal
