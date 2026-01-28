import { Link } from 'react-router-dom'
import {
  ShieldAlert,
  Activity,
  Syringe,
  TrendingUp,
  X,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { warmCardStyle } from '../../constants/cardStyles'

const TYPE_ICONS = {
  breed_risk: ShieldAlert,
  symptom_pattern: Activity,
  vaccination_due: Syringe,
  weight_trend: TrendingUp,
}

const TYPE_ICON_COLORS = {
  breed_risk: '#D97706',
  symptom_pattern: '#5FB3B3',
  vaccination_due: '#2563EB',
  weight_trend: '#7C3AED',
}

const PRIORITY_BORDER = {
  high: 'border-l-[#EF5350]',
  medium: 'border-l-[#F4A261]',
  low: 'border-l-[#66BB6A]',
}

/**
 * AlertQueue — compact, priority-sorted alert inbox with colored left borders.
 *
 * @param {object} props
 * @param {Array} props.alerts - sorted alert objects
 * @param {function} props.onDismiss - called with alertId
 * @param {function} props.onSnooze - called with alertId
 * @param {number} [props.maxVisible=5] - max alerts to show
 */
function AlertQueue({ alerts, onDismiss, onSnooze, maxVisible = 5 }) {
  const activeAlerts = alerts.filter((a) => a.status === 'active').slice(0, maxVisible)

  return (
    <div className="rounded-2xl overflow-hidden transition-shadow duration-300" style={warmCardStyle}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <h3
          className="font-bold text-sm text-[#2D2A26]"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Health Alerts
        </h3>
        <div className="flex items-center gap-2">
          {activeAlerts.length > 0 && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: 'rgba(239,83,80,0.1)',
                color: '#EF5350',
              }}
            >
              {activeAlerts.length}
            </span>
          )}
          <Link
            to="/alerts"
            className="text-xs font-semibold text-[#F4A261] hover:text-[#E8924F] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-1 rounded"
          >
            View all &rarr;
          </Link>
        </div>
      </div>

      {/* Alert rows */}
      {activeAlerts.length === 0 ? (
        <div className="flex items-center gap-2 px-3 pb-3">
          <CheckCircle2 className="w-4 h-4 text-[#66BB6A]" aria-hidden="true" />
          <span
            className="text-[13px] text-[#8C7B6B]"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            No active alerts
          </span>
        </div>
      ) : (
        <div className="divide-y divide-[#E8DDD0]/30">
          {activeAlerts.map((alert) => {
            const Icon = TYPE_ICONS[alert.type] || ShieldAlert
            const iconColor = TYPE_ICON_COLORS[alert.type] || '#D97706'
            const borderClass = PRIORITY_BORDER[alert.priority] || PRIORITY_BORDER.low

            return (
              <div
                key={alert.id}
                className={`border-l-4 ${borderClass} py-2 px-3 flex items-start gap-2.5`}
              >
                {/* Icon */}
                <Icon
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: iconColor }}
                  aria-hidden="true"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4
                    className="text-[13px] font-bold text-[#2D2A26] leading-tight truncate"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {alert.title}
                  </h4>
                  <p
                    className="text-[11px] text-[#6B6B6B] leading-snug truncate"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {alert.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onSnooze?.(alert.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9E9E9E] hover:text-[#6B6B6B] hover:bg-[#F5F0EB] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-1"
                    aria-label={`Snooze ${alert.title} alert for 7 days`}
                  >
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => onDismiss?.(alert.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9E9E9E] hover:text-[#6B6B6B] hover:bg-[#F5F0EB] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-1"
                    aria-label={`Dismiss ${alert.title} alert`}
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AlertQueue
