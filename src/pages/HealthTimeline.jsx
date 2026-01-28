import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Filter,
  X,
  ChevronDown,
} from 'lucide-react'
import { useDog } from '../context/DogContext'
import { usePremium } from '../hooks/usePremium'
import LocalStorageService from '../services/storage/LocalStorageService'
import HealthTimelineComponent from '../components/health/HealthTimeline'
import ManualEventForm from '../components/health/ManualEventForm'
import HealthEventDetail from '../components/health/HealthEventDetail'
import WeightChart from '../components/health/WeightChart'
import PremiumGate from '../components/common/PremiumGate'

const FREE_EVENT_LIMIT = 5

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'symptom', label: 'Symptoms' },
  { value: 'behavior', label: 'Behavior' },
  { value: 'diet', label: 'Diet' },
  { value: 'medication', label: 'Medication' },
  { value: 'vet_visit', label: 'Vet Visits' },
  { value: 'condition', label: 'Conditions' },
  { value: 'weight', label: 'Weight' },
]

const SEVERITY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
]

/**
 * Map PetFact category/severity to the urgency key expected by HealthTimelineComponent.
 */
function mapToTimelineEvent(fact) {
  const severityToUrgency = { mild: 'low', moderate: 'moderate', severe: 'urgent' }
  const categoryToType = {
    symptom: 'symptom',
    condition: 'symptom',
    vet_visit: 'chat',
    medication: 'chat',
    diet: 'chat',
    behavior: 'symptom',
    weight: 'chat',
  }

  return {
    id: fact.id,
    type: categoryToType[fact.category] || 'chat',
    title: fact.fact,
    summary: fact.notes || fact.recommendedActions?.[0] || '',
    urgency: severityToUrgency[fact.severity] || 'low',
    timestamp: fact.occurredAt || fact.createdAt,
    symptoms: fact.tags || [],
    _raw: fact,
  }
}

/**
 * HealthTimeline Page - Full view of health event history with real PetFacts.
 */
function HealthTimeline() {
  const { activeDog } = useDog()
  const { isPremium } = usePremium()
  const prefersReducedMotion = useReducedMotion()

  const [showForm, setShowForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Load real PetFacts from storage
  const allFacts = useMemo(() => {
    if (!activeDog?.id) return []
    return LocalStorageService.getPetFacts(activeDog.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDog?.id, refreshKey])

  // Weight facts for chart
  const weightFacts = useMemo(
    () => allFacts.filter((f) => f.category === 'weight'),
    [allFacts]
  )

  // Apply filters
  const filteredFacts = useMemo(() => {
    let result = allFacts

    if (typeFilter !== 'all') {
      result = result.filter((f) => f.category === typeFilter)
    }

    if (severityFilter !== 'all') {
      result = result.filter((f) => f.severity === severityFilter)
    }

    return result
  }, [allFacts, typeFilter, severityFilter])

  // Enforce free-user limit
  const visibleFacts = useMemo(() => {
    if (isPremium) return filteredFacts
    return filteredFacts.slice(0, FREE_EVENT_LIMIT)
  }, [filteredFacts, isPremium])

  const hasHiddenEvents = !isPremium && filteredFacts.length > FREE_EVENT_LIMIT

  // Map to timeline event shape
  const timelineEvents = useMemo(
    () => visibleFacts.map(mapToTimelineEvent),
    [visibleFacts]
  )

  const activeFilterCount =
    (typeFilter !== 'all' ? 1 : 0) + (severityFilter !== 'all' ? 1 : 0)

  const handleFormSubmit = useCallback(() => {
    setShowForm(false)
    setRefreshKey((k) => k + 1)
  }, [])

  const handleEventTap = useCallback(
    (eventId) => {
      const fact = allFacts.find((f) => f.id === eventId)
      if (fact) setSelectedEvent(fact)
    },
    [allFacts]
  )

  const handleResolve = useCallback(
    (event) => {
      if (!activeDog?.id) return
      LocalStorageService.updatePetFact(activeDog.id, event.id, {
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
      })
      setSelectedEvent(null)
      setRefreshKey((k) => k + 1)
    },
    [activeDog?.id]
  )

  const handleUpdate = useCallback(
    (event, updates) => {
      if (!activeDog?.id) return
      LocalStorageService.updatePetFact(activeDog.id, event.id, updates)
      setSelectedEvent(null)
      setRefreshKey((k) => k + 1)
    },
    [activeDog?.id]
  )

  const clearFilters = useCallback(() => {
    setTypeFilter('all')
    setSeverityFilter('all')
  }, [])

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      }

  return (
    <div className="bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FDF8F3]/80 backdrop-blur-md border-b border-[#E8E8E8]/30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/dashboard"
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#E8E8E8] flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-[#6B6B6B]" aria-hidden="true" />
          </Link>
          <div className="flex-1">
            <h1
              className="text-lg font-bold text-[#3D3D3D]"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Health Timeline
            </h1>
            <p className="text-xs text-[#6B6B6B]">
              {activeDog?.name ? `${activeDog.name}'s health history` : 'Track health events'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 ${
                activeFilterCount > 0
                  ? 'bg-[#F4A261]/10 border-[#F4A261]/30 text-[#F4A261]'
                  : 'bg-white border-[#E8E8E8] text-[#6B6B6B] hover:bg-gray-50'
              }`}
              aria-label={`Toggle filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
            >
              <Filter className="w-4 h-4" aria-hidden="true" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#F4A261] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Add event */}
            <button
              onClick={() => setShowForm(true)}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#F4A261] to-[#E8924F] flex items-center justify-center shadow-md hover:shadow-lg transition-shadow focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
              aria-label="Add health event"
            >
              <Plus className="w-5 h-5 text-white" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-[#E8E8E8]/30 bg-white/60 backdrop-blur-sm"
          >
            <div className="max-w-lg mx-auto px-4 py-3 space-y-3">
              {/* Type filter */}
              <div>
                <label
                  htmlFor="type-filter"
                  className="block text-xs font-semibold text-[#3D3D3D] mb-1.5"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Event Type
                </label>
                <div className="relative">
                  <select
                    id="type-filter"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full appearance-none px-3 py-2 rounded-xl border border-[#E8E8E8] bg-white text-sm text-[#3D3D3D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 pr-8"
                  >
                    {TYPE_FILTERS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E] pointer-events-none" aria-hidden="true" />
                </div>
              </div>

              {/* Severity filter */}
              <div>
                <label
                  htmlFor="severity-filter"
                  className="block text-xs font-semibold text-[#3D3D3D] mb-1.5"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Severity
                </label>
                <div className="relative">
                  <select
                    id="severity-filter"
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="w-full appearance-none px-3 py-2 rounded-xl border border-[#E8E8E8] bg-white text-sm text-[#3D3D3D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 pr-8"
                  >
                    {SEVERITY_FILTERS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E] pointer-events-none" aria-hidden="true" />
                </div>
              </div>

              {/* Clear filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs font-medium text-[#F4A261] hover:text-[#E8924F] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 rounded"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                  Clear filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main
        {...animationProps}
        className="max-w-lg mx-auto px-4 py-4 space-y-4"
      >
        {/* Manual Event Form */}
        <AnimatePresence>
          {showForm && activeDog?.id && (
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
            >
              <ManualEventForm
                dogId={activeDog.id}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weight Chart (only when weight facts exist and no type filter excludes it) */}
        {weightFacts.length > 0 && (typeFilter === 'all' || typeFilter === 'weight') && (
          <WeightChart
            weightFacts={weightFacts}
            weightUnit={activeDog?.weightUnit || 'lbs'}
          />
        )}

        {/* Timeline Component */}
        <HealthTimelineComponent
          events={timelineEvents}
          dogName={activeDog?.name || 'your dog'}
          onEventSelect={handleEventTap}
        />

        {/* Premium gate for hidden events */}
        {hasHiddenEvents && (
          <PremiumGate
            variant="card"
            title="Full Health History"
            description={`You have ${filteredFacts.length - FREE_EVENT_LIMIT} more health events. Upgrade to Premium to view all events and generate vet reports.`}
            ctaText="Unlock All Events"
          />
        )}

        {/* Quick Actions */}
        <motion.div
          {...(prefersReducedMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 } })}
        >
          <h3 className="text-sm font-semibold text-[#3D3D3D] mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Log a Health Event
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/chat"
              className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm border border-[#E8E8E8] hover:bg-gray-50 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            >
              <div className="w-8 h-8 bg-[#7EC8C8]/10 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-[#7EC8C8]" aria-hidden="true" />
              </div>
              <span className="text-xs font-medium text-[#3D3D3D]">Chat about symptoms</span>
            </Link>
            <Link
              to="/photo"
              className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm border border-[#E8E8E8] hover:bg-gray-50 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            >
              <div className="w-8 h-8 bg-[#F4A261]/10 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-[#F4A261]" aria-hidden="true" />
              </div>
              <span className="text-xs font-medium text-[#3D3D3D]">Analyze a photo</span>
            </Link>
          </div>
        </motion.div>
      </motion.main>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <HealthEventDetail
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onResolve={handleResolve}
            onUpdate={handleUpdate}
          />
        )}
      </AnimatePresence>

    </div>
  )
}

export default HealthTimeline
