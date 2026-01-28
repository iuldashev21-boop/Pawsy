import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDog } from '../context/DogContext'
import { usePremium } from '../hooks/usePremium'
import LocalStorageService from '../services/storage/LocalStorageService'
import { detectPatterns } from '../services/intelligence/patternDetector'
import { generateAlerts } from '../services/intelligence/alertEngine'
import AlertHistory from '../components/alerts/AlertHistory'
import AlertDetailModal from '../components/alerts/AlertDetailModal'
import PremiumGate from '../components/common/PremiumGate'

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
}

// ---------------------------------------------------------------------------
// AlertsPage
// ---------------------------------------------------------------------------

function AlertsPage() {
  useAuth()
  const { activeDog } = useDog()
  const { isPremium } = usePremium()
  const prefersReducedMotion = useReducedMotion()

  const [alertVersion, setAlertVersion] = useState(0)
  const [selectedAlert, setSelectedAlert] = useState(null)

  // Compute all alerts: existing + freshly detected
  const allAlerts = useMemo(() => {
    if (!activeDog) return []

    const petFacts = LocalStorageService.getPetFacts(activeDog.id)
    const existingAlerts = LocalStorageService.getAlerts(activeDog.id)
    const patterns = detectPatterns(petFacts)
    const newAlerts = generateAlerts({
      dog: activeDog,
      petFacts,
      patterns,
      existingAlerts,
    })

    // Persist newly generated alerts
    for (const alert of newAlerts) {
      LocalStorageService.saveAlert(activeDog.id, alert)
    }

    // Combine all
    return [...existingAlerts, ...newAlerts]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDog, alertVersion])

  // Dismiss handler
  const handleDismiss = useCallback(
    (alertId) => {
      if (!activeDog) return
      LocalStorageService.updateAlert(activeDog.id, alertId, {
        status: 'dismissed',
        dismissedAt: new Date().toISOString(),
      })
      setAlertVersion((v) => v + 1)
    },
    [activeDog]
  )

  // Snooze handler (7 days)
  const handleSnooze = useCallback(
    (alertId) => {
      if (!activeDog) return
      const snoozeUntil = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString()
      LocalStorageService.updateAlert(activeDog.id, alertId, {
        status: 'snoozed',
        snoozeUntil,
      })
      setAlertVersion((v) => v + 1)
    },
    [activeDog]
  )

  // Open detail modal
  const handleAlertAction = useCallback((alert) => {
    setSelectedAlert(alert)
  }, [])

  // Close detail modal
  const handleCloseDetail = useCallback(() => {
    setSelectedAlert(null)
  }, [])

  const safeVariants = prefersReducedMotion ? {} : pageVariants

  return (
    <div className="bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FDF8F3]/85 backdrop-blur-xl border-b border-[#E8DDD0]/40">
        <div className="max-w-lg md:max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/dashboard"
            className="w-9 h-9 rounded-xl bg-white/80 shadow-sm border border-[#E8DDD0]/60 flex items-center justify-center hover:bg-white active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="w-5 h-5 text-[#6B6B6B]" aria-hidden="true" />
          </Link>

          <div className="flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-[#F4A261]" aria-hidden="true" />
            <h1
              className="text-lg font-extrabold text-[#2D2A26] leading-tight"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Health Alerts
            </h1>
            {allAlerts.filter((a) => a.status === 'active').length > 0 && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(239,83,80,0.1)',
                  color: '#EF5350',
                }}
              >
                {allAlerts.filter((a) => a.status === 'active').length}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.main
        className="max-w-lg md:max-w-3xl mx-auto px-4 py-4"
        variants={safeVariants}
        initial={prefersReducedMotion ? false : 'initial'}
        animate={prefersReducedMotion ? false : 'animate'}
      >
        {isPremium ? (
          <AlertHistory
            alerts={allAlerts}
            onDismiss={handleDismiss}
            onSnooze={handleSnooze}
            onAction={handleAlertAction}
          />
        ) : (
          <PremiumGate
            variant="overlay"
            title="Health Alerts"
            description="Get notified about breed risks, symptom patterns, vaccinations, and weight trends."
          >
            <AlertHistory
              alerts={allAlerts}
              onDismiss={handleDismiss}
              onSnooze={handleSnooze}
              onAction={handleAlertAction}
            />
          </PremiumGate>
        )}
      </motion.main>

      {/* Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        onClose={handleCloseDetail}
      />

    </div>
  )
}

export default AlertsPage
