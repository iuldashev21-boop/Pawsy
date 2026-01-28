import { useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Bell, BellOff, Clock } from 'lucide-react'
import AlertCard from './AlertCard'

const groupOrder = ['active', 'snoozed', 'dismissed']

const groupConfig = {
  active: { label: 'Active', icon: Bell, color: '#EF5350' },
  snoozed: { label: 'Snoozed', icon: Clock, color: '#F4A261' },
  dismissed: { label: 'Dismissed', icon: BellOff, color: '#9E9E9E' },
}

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

/**
 * AlertHistory - groups and renders all alerts by status.
 *
 * @param {object} props
 * @param {Array} props.alerts - all alert objects
 * @param {function} props.onDismiss - called with alertId
 * @param {function} props.onSnooze - called with alertId
 * @param {function} [props.onAction] - called with alert for details
 */
function AlertHistory({ alerts, onDismiss, onSnooze, onAction }) {
  const prefersReducedMotion = useReducedMotion()

  const grouped = useMemo(() => {
    const groups = { active: [], snoozed: [], dismissed: [] }

    for (const alert of alerts || []) {
      const status = alert.status || 'active'
      if (groups[status]) {
        groups[status].push(alert)
      } else {
        groups.active.push(alert)
      }
    }

    return groups
  }, [alerts])

  const hasAlerts = (alerts || []).length > 0

  if (!hasAlerts) {
    return (
      <div className="text-center py-12">
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(126,200,200,0.12) 0%, rgba(90,175,175,0.08) 100%)',
          }}
        >
          <Bell className="w-6 h-6 text-[#7EC8C8]" aria-hidden="true" />
        </div>
        <h3
          className="text-sm font-bold text-[#2D2A26] mb-1"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          No alerts yet
        </h3>
        <p
          className="text-xs text-[#9E9E9E]"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          Health alerts will appear here when patterns are detected.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-4"
      variants={prefersReducedMotion ? {} : containerVariants}
      initial={prefersReducedMotion ? false : 'initial'}
      animate={prefersReducedMotion ? false : 'animate'}
    >
      {groupOrder.map((status) => {
        const group = grouped[status]
        if (!group || group.length === 0) return null

        const config = groupConfig[status]
        const GroupIcon = config.icon

        return (
          <section key={status} aria-label={`${config.label} alerts`}>
            <div className="flex items-center gap-2 mb-2 px-0.5">
              <GroupIcon
                className="w-3.5 h-3.5"
                style={{ color: config.color }}
                aria-hidden="true"
              />
              <h3
                className="text-xs font-bold text-[#3D3D3D] uppercase tracking-wide"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {config.label}
              </h3>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${config.color}15`,
                  color: config.color,
                }}
              >
                {group.length}
              </span>
            </div>

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {group.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onDismiss={onDismiss}
                    onSnooze={onSnooze}
                    onAction={onAction}
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>
        )
      })}
    </motion.div>
  )
}

export default AlertHistory
