import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Plus, Trash2, Pill, ChevronDown, AlertCircle, X, Check
} from 'lucide-react'
import { generateUUID } from '../../utils/uuid'

const FREQUENCY_OPTIONS = [
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'as_needed', label: 'As needed' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const EMPTY_FORM = {
  name: '',
  dosage: '',
  frequency: 'once_daily',
  startDate: '',
  endDate: '',
  notes: '',
}

const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)'

const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

function getFrequencyLabel(value) {
  return FREQUENCY_OPTIONS.find((o) => o.value === value)?.label || value
}

function MedicationCard({ medication, onRemove, prefersReducedMotion }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = () => {
    onRemove(medication.id)
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
      className="bg-white rounded-2xl border border-[#F4A261]/10 overflow-hidden"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4A261]/10 flex items-center justify-center flex-shrink-0">
            <Pill className="w-5 h-5 text-[#F4A261]" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className="font-bold text-[#3D3D3D] truncate"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {medication.name}
            </h4>
            {medication.dosage && (
              <p className="text-sm text-[#6B6B6B] mt-0.5">{medication.dosage}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center text-xs px-2.5 py-1 bg-[#F4A261]/10 text-[#E8924F] rounded-full font-medium">
                {getFrequencyLabel(medication.frequency)}
              </span>
              {medication.startDate && (
                <span className="inline-flex items-center text-xs px-2.5 py-1 bg-[#7EC8C8]/10 text-[#5FB3B3] rounded-full font-medium">
                  Started {medication.startDate}
                </span>
              )}
              {medication.endDate && (
                <span className="inline-flex items-center text-xs px-2.5 py-1 bg-[#9E9E9E]/10 text-[#6B6B6B] rounded-full font-medium">
                  Until {medication.endDate}
                </span>
              )}
            </div>
            {medication.notes && (
              <p className="text-xs text-[#9E9E9E] mt-2 leading-relaxed">{medication.notes}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-xl text-[#9E9E9E] hover:text-[#EF5350] hover:bg-[#EF5350]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            aria-label={`Delete ${medication.name}`}
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
                Remove {medication.name}?
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

function MedicationManager({ medications = [], onAdd, onRemove }) {
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
      newErrors.name = 'Medication name is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const newMedication = {
      id: generateUUID(),
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      frequency: form.frequency,
      startDate: form.startDate,
      endDate: form.endDate,
      notes: form.notes.trim(),
    }

    onAdd(newMedication)
    setForm(EMPTY_FORM)
    setErrors({})
    setShowForm(false)
  }

  const handleCancel = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setShowForm(false)
  }

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
          Medications
        </h3>
        {!showForm && (
          <motion.button
            type="button"
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#F4A261] to-[#E8924F] rounded-xl shadow-sm hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            style={{ minHeight: 44 }}
            aria-label="Add medication"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add
          </motion.button>
        )}
      </div>

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
                New Medication
              </h4>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
                  Name <span className="text-[#EF5350]">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Heartgard Plus"
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

              {/* Dosage */}
              <div>
                <label className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
                  Dosage
                </label>
                <input
                  type="text"
                  value={form.dosage}
                  onChange={(e) => updateField('dosage', e.target.value)}
                  placeholder="e.g. 68mg"
                  className={`${inputBaseClass} border-[#E8E8E8]`}
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
                  Frequency
                </label>
                <div className="relative">
                  <select
                    value={form.frequency}
                    onChange={(e) => updateField('frequency', e.target.value)}
                    className={`${inputBaseClass} border-[#E8E8E8] appearance-none cursor-pointer`}
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E] pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Start / End dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className={`${inputBaseClass} border-[#E8E8E8]`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
                    End date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    className={`${inputBaseClass} border-[#E8E8E8]`}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[#3D3D3D] mb-1.5">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Any additional notes..."
                  rows={2}
                  className={`${inputBaseClass} border-[#E8E8E8] resize-none`}
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

      {/* Medication list */}
      {medications.length > 0 ? (
        <motion.div
          variants={prefersReducedMotion ? {} : staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {medications.map((med) => (
              <MedicationCard
                key={med.id}
                medication={med}
                onRemove={onRemove}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        !showForm && (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 bg-white rounded-2xl border border-[#E8E8E8]"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <Pill className="w-10 h-10 text-[#9E9E9E] mx-auto mb-3" aria-hidden="true" />
            <p className="text-[#9E9E9E] font-medium">No medications added</p>
            <p className="text-sm text-[#9E9E9E] mt-1">
              Tap "Add" to track your dog's medications
            </p>
          </motion.div>
        )
      )}
    </div>
  )
}

export default MedicationManager
