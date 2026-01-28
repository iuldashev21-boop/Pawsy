import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Pill,
  Syringe,
  Calendar,
  AlertTriangle,
  Settings,
} from 'lucide-react'
import { useDog } from '../../context/DogContext'
import PremiumGate from '../common/PremiumGate'
import { warmCardStyle } from '../../constants/cardStyles'

function getDaysUntil(dateString) {
  const now = new Date()
  const due = new Date(dateString)
  // Compare dates using UTC to avoid timezone issues
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const dueDay = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate())
  const diffMs = dueDay - nowDay
  return Math.round(diffMs / 86400000)
}

function formatCountdown(daysUntil) {
  if (daysUntil < 0) return 'overdue'
  if (daysUntil === 0) return 'due today'
  if (daysUntil === 1) return 'due in 1 day'
  return `due in ${daysUntil} days`
}

function getCountdownColor(daysUntil) {
  if (daysUntil < 0) return '#EF5350'
  if (daysUntil <= 3) return '#FFCA28'
  return '#7EC8C8'
}

function UpcomingCareContent() {
  const { activeDog } = useDog()

  const medications = useMemo(() => {
    if (!activeDog?.medications) return []
    return activeDog.medications
  }, [activeDog])

  const vaccinations = useMemo(() => {
    if (!activeDog?.vaccinations) return []
    return [...activeDog.vaccinations].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
  }, [activeDog])

  const activeMeds = useMemo(
    () => medications.filter((m) => m.active !== false),
    [medications]
  )

  const nextVaccination = vaccinations[0] || null

  const isEmpty = activeMeds.length === 0 && vaccinations.length === 0

  if (isEmpty) {
    return (
      <div className="rounded-2xl p-4" style={warmCardStyle}>
        <div className="text-center py-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{
              background:
                'linear-gradient(135deg, rgba(244,162,97,0.15) 0%, rgba(232,146,79,0.1) 100%)',
            }}
          >
            <Calendar
              className="w-5 h-5 text-[#F4A261]"
              aria-hidden="true"
            />
          </div>
          <p
            className="text-[13px] text-[#6B6B6B] mb-1 leading-relaxed font-medium"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            No care schedule yet
          </p>
          <p
            className="text-[11px] text-[#8C7B6B] mb-3 leading-relaxed"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Add your dog's medications and vaccinations to track upcoming care
          </p>
          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#F4A261] hover:text-[#E8924F] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 rounded"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            <Settings className="w-3.5 h-3.5" aria-hidden="true" />
            Set up in Settings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-4 space-y-3" style={warmCardStyle}>
      {/* Next vaccination */}
      {nextVaccination && (
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(126,200,200,0.15) 0%, rgba(90,175,175,0.1) 100%)',
            }}
          >
            <Syringe
              className="w-4 h-4 text-[#5AB3B3]"
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className="font-bold text-[13px] text-[#2D2A26] leading-tight"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {nextVaccination.name}
            </h4>
            <p
              className="text-[11px] mt-0.5 font-semibold flex items-center gap-1"
              style={{
                color: getCountdownColor(
                  getDaysUntil(nextVaccination.dueDate)
                ),
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {getDaysUntil(nextVaccination.dueDate) < 0 && (
                <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              )}
              {formatCountdown(getDaysUntil(nextVaccination.dueDate))}
            </p>
          </div>
        </div>
      )}

      {/* Separator if both exist */}
      {nextVaccination && activeMeds.length > 0 && (
        <div
          className="h-px"
          style={{ background: 'rgba(232,221,208,0.4)' }}
        />
      )}

      {/* Active medications count */}
      {activeMeds.length > 0 && (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(244,162,97,0.15) 0%, rgba(232,146,79,0.1) 100%)',
            }}
          >
            <Pill
              className="w-4 h-4 text-[#F4A261]"
              aria-hidden="true"
            />
          </div>
          <p
            className="text-[13px] text-[#3D3D3D] font-medium"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            {activeMeds.length} active medication
            {activeMeds.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}

function UpcomingCare() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-0.5">
        <h3
          className="font-bold text-sm text-[#2D2A26]"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Upcoming Care
        </h3>
      </div>

      <PremiumGate
        variant="overlay"
        title="Care Schedule"
        description="Track vaccinations and medications for your dog."
      >
        <UpcomingCareContent />
      </PremiumGate>
    </div>
  )
}

export default UpcomingCare
