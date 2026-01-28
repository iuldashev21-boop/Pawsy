import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Plus, Trash2, Syringe, Check, AlertCircle, Clock, ShieldCheck, ShieldAlert, X
} from 'lucide-react'
import { generateUUID } from '../../utils/uuid'

const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)'

const EMPTY_FORM = {
  name: '',
  dateGiven: '',
  nextDueDate: '',
  veterinarian: '',
}

const STATUS_CONFIG = {
  current: {
    label: 'Up to date',
    bgColor: 'bg-[#66BB6A]/10',
    textColor: 'text-[#43A047]',
    borderColor: 'border-[#66BB6A]/20',
    Icon: ShieldCheck,
  },
  dueSoon: {
    label: 'Due soon',
    bgColor: 'bg-[#FFCA28]/10',
    textColor: 'text-[#F9A825]',
    borderColor: 'border-[#FFCA28]/20',
    Icon: Clock,
  },
  overdue: {
    label: 'Overdue',
    bgColor: 'bg-[#EF5350]/10',
    textColor: 'text-[#EF5350]',
    borderColor: 'border-[#EF5350]/20',
    Icon: ShieldAlert,
  },
  noDate: {
    label: 'No due date',
    bgColor: 'bg-[#9E9E9E]/10',
    textColor: 'text-[#9E9E9E]',
    borderColor: 'border-[#9E9E9E]/20',
    Icon: Clock,
  },
}

function getVaccinationStatus(vaccination) {
  if (!vaccination.nextDueDate) return 'noDate'

  const now = new Date()
  const dueDate = new Date(vaccination.nextDueDate)
  const diffMs = dueDate - now
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays <= 30) return 'dueSoon'
  return 'current'
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status]
  const StatusIcon = config.Icon

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${config.bgColor} ${config.textColor}`}
    >
      <StatusIcon className="w-3 h-3" aria-hidden="true" />
      {config.label}
    </span>
  )
}

function VaccinationCard({ vaccination, onRemove, prefersReducedMotion }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const status = getVaccinationStatus(vaccination)
  const config = STATUS_CONFIG[status]

  const handleDelete = () => {
    onRemove(vaccination.id)
    setShowDeleteConfirm(false)
  }

  const cardAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: -100 },
        transition: { type: 'spring', stiffness: 300, damping: 24 },
      }

  return (
    <motion.div
      layout
      {...cardAnimation}
      className={`bg-white rounded-2xl border overflow-hidden ${config.borderColor}`}
      style={{ boxShadow: CARD_SHADOW }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
            <Syringe className={`w-5 h-5 ${config.textColor}`} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4
                className="font-bold text-[#3D3D3D] truncate"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {vaccination.name}
              </h4>
              <StatusBadge status={status} />
            </div>

            <div className="mt-2 space-y-1">
              {vaccination.dateGiven && (
                <p className="text-sm text-[#6B6B6B]">
                  <span className="text-[#9E9E9E]">Given:</span>{' '}
                  {formatDate(vaccination.dateGiven)}
                </p>
              )}
              {vaccination.nextDueDate && (
                <p className={`text-sm ${status === 'overdue' ? 'text-[#EF5350] font-medium' : 'text-[#6B6B6B]'}`}>
                  <span className={status === 'overdue' ? 'text-[#EF5350]' : 'text-[#9E9E9E]'}>
                    Next due:
                  </span>{' '}
                  {formatDate(vaccination.nextDueDate)}
                </p>
              )}
              {vaccination.veterinarian && (
                <p className="text-sm text-[#6B6B6B]">
                  <span className="text-[#9E9E9E]">Vet:</span>{' '}
                  {vaccination.veterinarian}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-xl text-[#9E9E9E] hover:text-[#EF5350] hover:bg-[#EF5350]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            aria-label={`Delete ${vaccination.name} vaccination`}
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete confirmation bar */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-[#EF5350]/5 border-t border-[#EF5350]/10 flex items-center justify-between gap-3">
              <p className="text-sm text-[#EF5350] font-medium">
                Remove {vaccination.name}?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-sm text-[#6B6B6B] font-medium rounded-lg hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]"
                  style={{ minHeight: 44 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm text-white font-medium bg-[#EF5350] rounded-lg hover:bg-[#E53935] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF5350]"
                  style={{ minHeight: 44 }}
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function VaccinationTracker({ vaccinations = [], onAdd, onRemove }) {
  const prefersReducedMotion = useReducedMotion()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) {
      newErrors.name = 'Vaccination name is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const newVaccination = {
      id: generateUUID(),
      name: form.name.trim(),
      dateGiven: form.dateGiven,
      nextDueDate: form.nextDueDate,
      veterinarian: form.veterinarian.trim(),
    }

    onAdd(newVaccination)
    setForm(EMPTY_FORM)
    setErrors({})
    setShowForm(false)
  }

  const handleCancel = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setShowForm(false)
  }

  // Sort: overdue first, then due soon, then current, then no date
  const statusOrder = { overdue: 0, dueSoon: 1, current: 2, noDate: 3 }
  const sortedVaccinations = [...vaccinations].sort((a, b) => {
    const statusA = getVaccinationStatus(a)
    const statusB = getVaccinationStatus(b)
    return statusOrder[statusA] - statusOrder[statusB]
  })

  // Summary counts
  const statusCounts = vaccinations.reduce(
    (acc, v) => {
      const s = getVaccinationStatus(v)
      acc[s] = (acc[s] || 0) + 1
      return acc
    },
    {}
  )

  const inputBaseClass =
    'w-full px-4 py-3 bg-white border-2 rounded-xl text-[#3D3D3D] placeholder:text-[#9E9E9E] transition-all duration-200 outline-none focus:border-[#F4A261] focus:ring-2 focus:ring-[#F4A261]/20'

  const formAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: 'auto' },
        exit: { opacity: 0, height: 0 },
        transition: { type: 'spring', stiffness: 300, damping: 28 },
      }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3
          className="text-lg font-bold text-[#3D3D3D]"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Vaccinations
        </h3>
        {!showForm && (
          <motion.button
            type="button"
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#F4A261] to-[#E8924F] rounded-xl shadow-sm hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            style={{ minHeight: 44 }}
            aria-label="Add vaccination"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add
          </motion.button>
        )}
      </div>

      {/* Status summary */}
      {vaccinations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {statusCounts.overdue > 0 && (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-[#EF5350]/10 text-[#EF5350] rounded-full font-medium">
              <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
              {statusCounts.overdue} overdue
            </span>
          )}
          {statusCounts.dueSoon > 0 && (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-[#FFCA28]/10 text-[#F9A825] rounded-full font-medium">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {statusCounts.dueSoon} due soon
            </span>
          )}
          {statusCounts.current > 0 && (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-[#66BB6A]/10 text-[#43A047] rounded-full font-medium">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              {statusCounts.current} up to date
            </span>
          )}
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div {...formAnimation} className="overflow-hidden">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border-2 border-[#F4A261]/20 p-5 space-y-4"
              style={{ boxShadow: CARD_SHADOW }}
            >
              <h4
                className="font-bold text-[#3D3D3D]"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                New Vaccination
              </h4>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
                  Vaccine name <span className="text-[#EF5350]">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. DHPP, Rabies, Bordetella"
                  className={`${inputBaseClass} ${errors.name ? 'border-[#EF5350] focus:border-[#EF5350] focus:ring-[#EF5350]/20' : 'border-[#E8E8E8]'}`}
                  autoFocus
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-[#EF5350] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" aria-hidden="true" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Date given */}
              <div>
                <label className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
                  Date given
                </label>
                <input
                  type="date"
                  value={form.dateGiven}
                  onChange={(e) => updateField('dateGiven', e.target.value)}
                  className={`${inputBaseClass} border-[#E8E8E8]`}
                />
              </div>

              {/* Next due date */}
              <div>
                <label className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
                  Next due date
                </label>
                <input
                  type="date"
                  value={form.nextDueDate}
                  onChange={(e) => updateField('nextDueDate', e.target.value)}
                  className={`${inputBaseClass} border-[#E8E8E8]`}
                />
              </div>

              {/* Veterinarian */}
              <div>
                <label className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
                  Veterinarian
                </label>
                <input
                  type="text"
                  value={form.veterinarian}
                  onChange={(e) => updateField('veterinarian', e.target.value)}
                  placeholder="e.g. Dr. Sarah Mitchell"
                  className={`${inputBaseClass} border-[#E8E8E8]`}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-3 rounded-xl border-2 border-[#E8E8E8] text-[#6B6B6B] font-semibold hover:bg-[#FDF8F3] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                  style={{ minHeight: 44 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold shadow-sm hover:shadow-md transition-shadow flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                  style={{ minHeight: 44 }}
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vaccination list */}
      {sortedVaccinations.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sortedVaccinations.map((vax) => (
              <VaccinationCard
                key={vax.id}
                vaccination={vax}
                onRemove={onRemove}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        !showForm && (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 bg-white rounded-2xl border border-[#E8E8E8]"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <Syringe className="w-10 h-10 text-[#9E9E9E] mx-auto mb-3" aria-hidden="true" />
            <p className="text-[#9E9E9E] font-medium">No vaccinations recorded</p>
            <p className="text-sm text-[#9E9E9E] mt-1">
              Tap "Add" to track your dog's vaccines
            </p>
          </motion.div>
        )
      )}
    </div>
  )
}

export default VaccinationTracker
