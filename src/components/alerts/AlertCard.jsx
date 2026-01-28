import { motion, useReducedMotion } from 'framer-motion'
import {
  ShieldAlert,
  Activity,
  Syringe,
  TrendingUp,
  X,
  Clock,
  ChevronRight,
} from 'lucide-react'

const TYPE_CONFIG = {
  breed_risk: {
    icon: ShieldAlert,
    bg: 'bg-amber-50',
    iconBg: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(217,119,6,0.1) 100%)',
    iconColor: '#D97706',
    border: '1px solid rgba(245,158,11,0.2)',
    label: 'Breed Risk',
  },
  symptom_pattern: {
    icon: Activity,
    bg: 'bg-teal-50',
    iconBg: 'linear-gradient(135deg, rgba(126,200,200,0.2) 0%, rgba(90,175,175,0.15) 100%)',
    iconColor: '#5FB3B3',
    border: '1px solid rgba(126,200,200,0.25)',
    label: 'Pattern',
  },
  vaccination_due: {
    icon: Syringe,
    bg: 'bg-blue-50',
    iconBg: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.1) 100%)',
    iconColor: '#2563EB',
    border: '1px solid rgba(59,130,246,0.2)',
    label: 'Vaccination',
  },
  weight_trend: {
    icon: TrendingUp,
    bg: 'bg-purple-50',
    iconBg: 'linear-gradient(135deg, rgba(147,51,234,0.15) 0%, rgba(124,58,237,0.1) 100%)',
    iconColor: '#7C3AED',
    border: '1px solid rgba(147,51,234,0.2)',
    label: 'Weight',
  },
}

const PRIORITY_COLORS = {
  high: '#EF5350',
  medium: '#F4A261',
  low: '#66BB6A',
}

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
}

/**
 * AlertCard - displays a single health alert with contextual styling.
 *
 * @param {object} props
 * @param {object} props.alert - alert object from alertEngine
 * @param {function} props.onDismiss - called with alert.id
 * @param {function} props.onSnooze - called with alert.id
 * @param {function} [props.onAction] - called with alert for "view details"
 */
function AlertCard({ alert, onDismiss, onSnooze, onAction }) {
  const prefersReducedMotion = useReducedMotion()

  const config = TYPE_CONFIG[alert.type] || TYPE_CONFIG.breed_risk
  const Icon = config.icon
  const priorityColor = PRIORITY_COLORS[alert.priority] || PRIORITY_COLORS.low

  return (
    <motion.div
      layout
      variants={prefersReducedMotion ? {} : itemVariants}
      initial={prefersReducedMotion ? false : 'initial'}
      animate={prefersReducedMotion ? false : 'animate'}
      exit={prefersReducedMotion ? undefined : 'exit'}
      className="rounded-2xl p-3 transition-shadow duration-300"
      style={{
        border: config.border,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,252,247,0.85) 100%)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: config.iconBg }}
        >
          <Icon
            className="w-4.5 h-4.5"
            style={{ color: config.iconColor }}
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {/* Priority dot */}
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: priorityColor }}
              aria-label={`${alert.priority} priority`}
            />
            <h4
              className="text-[13px] font-bold text-[#2D2A26] leading-tight truncate"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {alert.title}
            </h4>
          </div>

          <p
            className="text-[11px] text-[#6B6B6B] leading-snug line-clamp-2"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            {alert.message}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onDismiss?.(alert.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-[#9E9E9E] hover:text-[#6B6B6B] hover:bg-[#F5F0EB] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-1"
              aria-label={`Dismiss ${alert.title} alert`}
            >
              <X className="w-3 h-3" aria-hidden="true" />
              Dismiss
            </button>

            <button
              onClick={() => onSnooze?.(alert.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-[#9E9E9E] hover:text-[#6B6B6B] hover:bg-[#F5F0EB] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-1"
              aria-label={`Snooze ${alert.title} alert for 7 days`}
            >
              <Clock className="w-3 h-3" aria-hidden="true" />
              Snooze
            </button>

            {onAction && (
              <button
                onClick={() => onAction(alert)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-[#F4A261] hover:text-[#E8924F] hover:bg-[#FFF5ED] transition-colors ml-auto focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-1"
                aria-label={`View details for ${alert.title}`}
              >
                Details
                <ChevronRight className="w-3 h-3" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AlertCard
