import { useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  X,
  Calendar,
  AlertTriangle,
  Stethoscope,
  Scale,
  Pill,
  Utensils,
  Brain,
  ChevronDown,
} from 'lucide-react'
import LocalStorageService from '../../services/storage/LocalStorageService'

const EVENT_TYPES = [
  { value: 'symptom', label: 'Symptom', icon: AlertTriangle, color: '#EF5350' },
  { value: 'vet_visit', label: 'Vet Visit', icon: Stethoscope, color: '#7EC8C8' },
  { value: 'weight', label: 'Weight', icon: Scale, color: '#66BB6A' },
  { value: 'medication', label: 'Medication', icon: Pill, color: '#F4A261' },
  { value: 'diet', label: 'Diet', icon: Utensils, color: '#FFCA28' },
  { value: 'behavior', label: 'Behavior', icon: Brain, color: '#9E9E9E' },
]

const SEVERITY_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
]

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * ManualEventForm - Form for manually adding health events.
 *
 * Creates a PetFact via LocalStorageService.savePetFact on submit.
 *
 * Props:
 * - dogId: string
 * - onSubmit: (fact) => void
 * - onCancel: () => void
 */
function ManualEventForm({ dogId, onSubmit, onCancel }) {
  const prefersReducedMotion = useReducedMotion()

  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayString)
  const [severity, setSeverity] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})

  const validate = useCallback(() => {
    const next = {}
    if (!type) next.type = 'Please select an event type'
    if (!description.trim()) next.description = 'Please enter a description'
    if (!date) next.date = 'Please select a date'
    return next
  }, [type, description, date])

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault()
      const validationErrors = validate()
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

      const now = new Date().toISOString()
      const occurredAt = new Date(date + 'T12:00:00').toISOString()

      const fact = {
        id: crypto.randomUUID(),
        dogId,
        fact: description.trim(),
        category: type,
        tags: [type, description.trim().toLowerCase().split(/\s+/)[0]].filter(Boolean),
        severity: severity || 'mild',
        status: 'active',
        occurredAt,
        source: { type: 'manual' },
        possibleConditions: [],
        recommendedActions: [],
        notes: notes.trim() || null,
        resolvedAt: null,
        createdAt: now,
      }

      LocalStorageService.savePetFact(dogId, fact)

      if (onSubmit) {
        onSubmit(fact)
      }
    },
    [dogId, type, description, date, severity, notes, validate, onSubmit]
  )

  const fadeIn = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

  const selectedType = EVENT_TYPES.find((t) => t.value === type)

  return (
    <motion.div {...fadeIn} className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E8E8]/50">
        <h3
          className="text-base font-bold text-[#3D3D3D]"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Log Health Event
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
          aria-label="Close form"
        >
          <X className="w-4 h-4 text-[#6B6B6B]" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Event Type Selector */}
        <fieldset>
          <legend className="text-xs font-semibold text-[#3D3D3D] mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Event Type <span className="text-[#EF5350]">*</span>
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {EVENT_TYPES.map((eventType) => {
              const Icon = eventType.icon
              const isSelected = type === eventType.value
              return (
                <button
                  key={eventType.value}
                  type="button"
                  onClick={() => {
                    setType(eventType.value)
                    setErrors((prev) => ({ ...prev, type: undefined }))
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 ${
                    isSelected
                      ? 'border-[#F4A261] bg-[#FFF5ED]'
                      : 'border-[#E8E8E8] bg-white hover:border-[#F4A261]/40'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={eventType.label}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: isSelected ? eventType.color : '#9E9E9E' }}
                    aria-hidden="true"
                  />
                  <span className={`text-[11px] font-medium ${isSelected ? 'text-[#3D3D3D]' : 'text-[#9E9E9E]'}`}>
                    {eventType.label}
                  </span>
                </button>
              )
            })}
          </div>
          <AnimatePresence>
            {errors.type && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-[#EF5350] mt-1"
                role="alert"
              >
                {errors.type}
              </motion.p>
            )}
          </AnimatePresence>
        </fieldset>

        {/* Description */}
        <div>
          <label
            htmlFor="event-description"
            className="block text-xs font-semibold text-[#3D3D3D] mb-1.5"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Description <span className="text-[#EF5350]">*</span>
          </label>
          <input
            id="event-description"
            type="text"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              setErrors((prev) => ({ ...prev, description: undefined }))
            }}
            placeholder={selectedType ? `Describe the ${selectedType.label.toLowerCase()}...` : 'What happened?'}
            className="w-full px-3 py-2.5 rounded-xl border border-[#E8E8E8] bg-white text-sm text-[#3D3D3D] placeholder:text-[#9E9E9E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 transition-shadow"
          />
          <AnimatePresence>
            {errors.description && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-[#EF5350] mt-1"
                role="alert"
              >
                {errors.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Date */}
        <div>
          <label
            htmlFor="event-date"
            className="block text-xs font-semibold text-[#3D3D3D] mb-1.5"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Date <span className="text-[#EF5350]">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E] pointer-events-none" aria-hidden="true" />
            <input
              id="event-date"
              type="date"
              value={date}
              max={todayString()}
              onChange={(e) => {
                setDate(e.target.value)
                setErrors((prev) => ({ ...prev, date: undefined }))
              }}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E8E8E8] bg-white text-sm text-[#3D3D3D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 transition-shadow"
            />
          </div>
          <AnimatePresence>
            {errors.date && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-[#EF5350] mt-1"
                role="alert"
              >
                {errors.date}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Severity */}
        <div>
          <label
            htmlFor="event-severity"
            className="block text-xs font-semibold text-[#3D3D3D] mb-1.5"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Severity
          </label>
          <div className="relative">
            <select
              id="event-severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 rounded-xl border border-[#E8E8E8] bg-white text-sm text-[#3D3D3D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 transition-shadow pr-8"
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E] pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="event-notes"
            className="block text-xs font-semibold text-[#3D3D3D] mb-1.5"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Notes
          </label>
          <textarea
            id="event-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any additional details..."
            className="w-full px-3 py-2.5 rounded-xl border border-[#E8E8E8] bg-white text-sm text-[#3D3D3D] placeholder:text-[#9E9E9E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 transition-shadow resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-[#E8E8E8] text-sm font-medium text-[#6B6B6B] hover:bg-gray-50 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-sm font-semibold text-white shadow-md hover:shadow-lg transition-shadow min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
          >
            Save Event
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default ManualEventForm
