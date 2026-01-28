import { useMemo } from 'react'
import { Scale, Activity, Flame, Syringe } from 'lucide-react'
import { useDog } from '../../context/DogContext'
import LocalStorageService from '../../services/storage/LocalStorageService'
import VitalStatCard from './VitalStatCard'

const ICON_CONFIG = {
  weight: {
    icon: Scale,
    iconColor: '#7C3AED',
    iconBg: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(107,33,168,0.1) 100%)',
  },
  symptoms: {
    icon: Activity,
    iconColor: '#5FB3B3',
    iconBg: 'linear-gradient(135deg, rgba(95,179,179,0.2) 0%, rgba(74,158,158,0.12) 100%)',
  },
  streak: {
    icon: Flame,
    iconColor: '#E8924F',
    iconBg: 'linear-gradient(135deg, rgba(232,146,79,0.18) 0%, rgba(212,133,74,0.1) 100%)',
  },
  nextCare: {
    icon: Syringe,
    iconColor: '#2563EB',
    iconBg: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(29,78,216,0.1) 100%)',
  },
}

function computeWeightStat(petFacts) {
  const weightFacts = petFacts.filter((f) => f.category === 'weight')
  if (weightFacts.length === 0) {
    return { value: '--', unit: 'lbs', status: { label: 'No data', color: 'yellow' } }
  }

  // Facts are sorted descending by createdAt from LocalStorageService
  const latest = weightFacts[0]
  const weight = parseFloat(latest.value) || 0

  if (weightFacts.length >= 2) {
    const previous = parseFloat(weightFacts[1].value) || 0
    if (previous > 0) {
      const changePct = Math.abs((weight - previous) / previous) * 100
      if (changePct > 15) {
        return { value: weight, unit: 'lbs', status: { label: 'Alert', color: 'red' } }
      }
      if (changePct > 5) {
        const trend = weight > previous ? 'Gaining' : 'Losing'
        return { value: weight, unit: 'lbs', status: { label: trend, color: 'yellow' } }
      }
    }
  }

  return { value: weight, unit: 'lbs', status: { label: 'Stable', color: 'green' } }
}

function computeSymptomStat(petFacts) {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  const recentSymptoms = petFacts.filter(
    (f) => f.category === 'symptom' && new Date(f.createdAt) >= fourteenDaysAgo
  )
  const count = recentSymptoms.length

  if (count === 0) {
    return { value: '0', status: { label: 'All Clear', color: 'green' } }
  }
  if (count <= 2) {
    return { value: String(count), status: { label: 'Monitor', color: 'yellow' } }
  }
  return { value: String(count), status: { label: 'Alert', color: 'red' } }
}

function computeStreakStat() {
  let currentStreak = 0
  try {
    const raw = localStorage.getItem('pawsy_streak')
    if (raw) {
      const parsed = JSON.parse(raw)
      currentStreak = parsed.currentStreak || 0
    }
  } catch {
    // ignore parse errors
  }

  let status
  if (currentStreak >= 7) {
    status = { label: 'Active', color: 'green' }
  } else if (currentStreak >= 3) {
    status = { label: 'Building', color: 'yellow' }
  } else {
    status = { label: 'Start!', color: 'red' }
  }

  return { value: currentStreak, unit: 'days', status }
}

function computeNextCareStat(activeDog) {
  const vaccinations = activeDog?.vaccinations
  if (!vaccinations || vaccinations.length === 0) {
    return { value: 'None', status: { label: 'All current', color: 'green' } }
  }

  const now = new Date()
  const upcoming = vaccinations
    .filter((v) => v.dueDate)
    .map((v) => ({
      ...v,
      dueDate: new Date(v.dueDate),
      daysUntil: Math.ceil((new Date(v.dueDate) - now) / (1000 * 60 * 60 * 24)),
    }))
    .sort((a, b) => a.dueDate - b.dueDate)

  if (upcoming.length === 0) {
    return { value: 'None', status: { label: 'All current', color: 'green' } }
  }

  const next = upcoming[0]
  const days = next.daysUntil
  const name = next.name || 'Vaccination'

  let status
  if (days < 7) {
    status = { label: days < 0 ? 'Overdue' : 'Due Soon', color: 'red' }
  } else if (days < 30) {
    status = { label: 'Due Soon', color: 'yellow' }
  } else {
    status = { label: 'On Track', color: 'green' }
  }

  const displayValue = days < 0 ? `${name}` : `${days}d`

  return { value: displayValue, unit: days >= 0 ? undefined : 'overdue', status }
}

/**
 * VitalStatsGrid — renders a 2x2 (mobile) / 4-col (desktop) grid of vital stat cards.
 * Computes all stats from existing data sources.
 */
function VitalStatsGrid() {
  const { activeDog } = useDog()

  const stats = useMemo(() => {
    const petFacts = activeDog ? LocalStorageService.getPetFacts(activeDog.id) : []

    const weight = computeWeightStat(petFacts)
    const symptoms = computeSymptomStat(petFacts)
    const streak = computeStreakStat()
    const nextCare = computeNextCareStat(activeDog)

    return { weight, symptoms, streak, nextCare }
  }, [activeDog])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      <VitalStatCard
        icon={ICON_CONFIG.weight.icon}
        iconColor={ICON_CONFIG.weight.iconColor}
        iconBg={ICON_CONFIG.weight.iconBg}
        label="Weight"
        value={stats.weight.value}
        unit={stats.weight.unit}
        status={stats.weight.status}
      />
      <VitalStatCard
        icon={ICON_CONFIG.symptoms.icon}
        iconColor={ICON_CONFIG.symptoms.iconColor}
        iconBg={ICON_CONFIG.symptoms.iconBg}
        label="Symptoms"
        value={stats.symptoms.value}
        status={stats.symptoms.status}
      />
      <VitalStatCard
        icon={ICON_CONFIG.streak.icon}
        iconColor={ICON_CONFIG.streak.iconColor}
        iconBg={ICON_CONFIG.streak.iconBg}
        label="Streak"
        value={stats.streak.value}
        unit={stats.streak.unit}
        status={stats.streak.status}
      />
      <VitalStatCard
        icon={ICON_CONFIG.nextCare.icon}
        iconColor={ICON_CONFIG.nextCare.iconColor}
        iconBg={ICON_CONFIG.nextCare.iconBg}
        label="Next Care"
        value={stats.nextCare.value}
        unit={stats.nextCare.unit}
        status={stats.nextCare.status}
      />
    </div>
  )
}

export default VitalStatsGrid
