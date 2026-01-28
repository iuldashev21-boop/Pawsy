import { useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, X, Check, Plus, Trash2,
  Heart, Pill, Activity, UtensilsCrossed, Syringe,
  ChevronDown, AlertCircle, PawPrint, SkipForward
} from 'lucide-react'
import { generateUUID } from '../../utils/uuid'
import PremiumIcon from '../common/PremiumIcon'

const TOTAL_STEPS = 5

const STEP_CONFIG = [
  { number: 1, title: 'Medical History', Icon: Heart, color: '#EF5350' },
  { number: 2, title: 'Medications', Icon: Pill, color: '#F4A261' },
  { number: 3, title: 'Lifestyle', Icon: Activity, color: '#7EC8C8' },
  { number: 4, title: 'Diet', Icon: UtensilsCrossed, color: '#81C784' },
  { number: 5, title: 'Vaccinations', Icon: Syringe, color: '#5B8DEF' },
]

const FREQUENCY_OPTIONS = [
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'as_needed', label: 'As needed' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const ACTIVITY_LEVELS = [
  { value: 'low', label: 'Low', description: 'Short walks, mostly resting' },
  { value: 'moderate', label: 'Moderate', description: 'Regular walks, some play' },
  { value: 'high', label: 'High', description: 'Long walks, active play daily' },
  { value: 'very_high', label: 'Very High', description: 'Running, hiking, agility' },
]

const ENVIRONMENTS = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'both', label: 'Both' },
]

const SOCIAL_OPTIONS = [
  { value: 'dog_parks', label: 'Dog parks' },
  { value: 'daycare', label: 'Daycare' },
  { value: 'walks_with_other_dogs', label: 'Walks with other dogs' },
  { value: 'none', label: 'None' },
]

const FOOD_TYPES = [
  { value: 'dry', label: 'Dry kibble' },
  { value: 'wet', label: 'Wet food' },
  { value: 'raw', label: 'Raw diet' },
  { value: 'homemade', label: 'Homemade' },
  { value: 'mixed', label: 'Mixed' },
]

const FEEDING_SCHEDULES = [
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'three_times', label: 'Three times daily' },
  { value: 'free_feed', label: 'Free feed' },
]

const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)'

const PARTICLE_COLORS = ['#F4A261', '#7EC8C8', '#FFD54F', '#81C784', '#FFB380']

const inputBaseClass =
  'w-full px-4 py-3 bg-white border-2 rounded-xl text-[#3D3D3D] placeholder:text-[#9E9E9E] transition-all duration-200 outline-none focus:border-[#F4A261] focus:ring-2 focus:ring-[#F4A261]/20'

function StepIndicator({ currentStep, totalSteps, prefersReducedMotion }) {
  return (
    <div className="flex items-center gap-2">
      {STEP_CONFIG.map((step) => {
        const isActive = step.number === currentStep
        const isCompleted = step.number < currentStep

        return (
          <div key={step.number} className="flex items-center gap-2">
            <motion.div
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      scale: isActive ? 1 : 0.85,
                      opacity: isActive || isCompleted ? 1 : 0.4,
                    }
              }
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                isCompleted
                  ? 'bg-[#66BB6A] text-white'
                  : isActive
                  ? 'bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white'
                  : 'bg-[#E8E8E8] text-[#9E9E9E]'
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" aria-hidden="true" />
              ) : (
                step.number
              )}
            </motion.div>
            {step.number < totalSteps && (
              <div
                className={`w-4 h-0.5 rounded-full transition-colors ${
                  isCompleted ? 'bg-[#66BB6A]' : 'bg-[#E8E8E8]'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 ${
        checked ? 'bg-[#F4A261]' : 'bg-[#E8E8E8]'
      }`}
      style={{ minWidth: 48, minHeight: 44, paddingTop: 8, paddingBottom: 9 }}
    >
      <motion.div
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
        animate={{ left: checked ? 26 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

function ChipSelect({ options, value, onChange, multi = false }) {
  const prefersReducedMotion = useReducedMotion()

  const handleSelect = (optionValue) => {
    if (multi) {
      const arr = Array.isArray(value) ? value : []
      if (optionValue === 'none') {
        onChange(arr.includes('none') ? [] : ['none'])
      } else {
        const withoutNone = arr.filter((v) => v !== 'none')
        onChange(
          withoutNone.includes(optionValue)
            ? withoutNone.filter((v) => v !== optionValue)
            : [...withoutNone, optionValue]
        )
      }
    } else {
      onChange(optionValue)
    }
  }

  const isSelected = (optionValue) => {
    if (multi) return Array.isArray(value) && value.includes(optionValue)
    return value === optionValue
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = isSelected(opt.value)
        return (
          <motion.button
            key={opt.value}
            type="button"
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            onClick={() => handleSelect(opt.value)}
            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-1 ${
              selected
                ? 'bg-[#F4A261] text-white border-2 border-[#F4A261] shadow-md'
                : 'bg-white border-2 border-[#E8E8E8] text-[#6B6B6B] hover:border-[#F4A261] hover:text-[#F4A261]'
            }`}
            style={{ minHeight: 44 }}
          >
            {selected && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
            {opt.label}
          </motion.button>
        )
      })}
    </div>
  )
}

function TagInput({ tags, onAdd, onRemove, placeholder }) {
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed)
      setInput('')
    }
  }

  return (
    <div className="space-y-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F4A261]/10 text-[#E8924F] rounded-full text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="p-0.5 rounded-full hover:bg-[#F4A261]/20 transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder={placeholder}
          className={`${inputBaseClass} border-[#E8E8E8]`}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!input.trim()}
          className="px-4 py-3 bg-[#F4A261] text-white rounded-xl hover:bg-[#E8924F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
          aria-label="Add item"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function MedicationRow({ med, onRemove, prefersReducedMotion }) {
  return (
    <motion.div
      layout
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, x: -50 }}
      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E8E8E8]"
    >
      <Pill className="w-4 h-4 text-[#F4A261] flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#3D3D3D] truncate">{med.name}</p>
        <p className="text-xs text-[#9E9E9E]">
          {med.dosage && `${med.dosage} - `}
          {FREQUENCY_OPTIONS.find((f) => f.value === med.frequency)?.label || med.frequency}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(med.id)}
        className="p-2 rounded-lg text-[#9E9E9E] hover:text-[#EF5350] hover:bg-[#EF5350]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]"
        aria-label={`Remove ${med.name}`}
        style={{ minWidth: 44, minHeight: 44 }}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Step content components                                                    */
/* -------------------------------------------------------------------------- */

function StepMedicalHistory({ data, onUpdate }) {
  return (
    <div className="space-y-6">
      {/* Spayed/Neutered */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#E8E8E8]" style={{ boxShadow: CARD_SHADOW }}>
        <div>
          <p className="font-medium text-[#3D3D3D]">Spayed / Neutered</p>
          <p className="text-sm text-[#9E9E9E]">Has your dog been spayed or neutered?</p>
        </div>
        <ToggleSwitch
          checked={data.isSpayedNeutered}
          onChange={(val) => onUpdate({ isSpayedNeutered: val })}
          label="Spayed or neutered"
        />
      </div>

      {/* Chronic Conditions */}
      <div>
        <label className="block text-sm font-medium text-[#3D3D3D] mb-2">
          Chronic Conditions
        </label>
        <TagInput
          tags={data.chronicConditions}
          onAdd={(tag) => onUpdate({ chronicConditions: [...data.chronicConditions, tag] })}
          onRemove={(tag) => onUpdate({ chronicConditions: data.chronicConditions.filter((c) => c !== tag) })}
          placeholder="e.g. Hip dysplasia, Diabetes"
        />
      </div>

      {/* Past Surgeries */}
      <div>
        <label className="block text-sm font-medium text-[#3D3D3D] mb-2">
          Past Surgeries
        </label>
        <TagInput
          tags={data.surgeryHistory}
          onAdd={(tag) => onUpdate({ surgeryHistory: [...data.surgeryHistory, tag] })}
          onRemove={(tag) => onUpdate({ surgeryHistory: data.surgeryHistory.filter((s) => s !== tag) })}
          placeholder="e.g. ACL repair, Tumor removal"
        />
      </div>
    </div>
  )
}

function StepMedications({ data, onUpdate }) {
  const [showForm, setShowForm] = useState(false)
  const [medForm, setMedForm] = useState({ name: '', dosage: '', frequency: 'once_daily' })

  const handleAddMed = (e) => {
    e.preventDefault()
    if (!medForm.name.trim()) return

    const newMed = {
      id: generateUUID(),
      name: medForm.name.trim(),
      dosage: medForm.dosage.trim(),
      frequency: medForm.frequency,
    }

    onUpdate({ medications: [...data.medications, newMed] })
    setMedForm({ name: '', dosage: '', frequency: 'once_daily' })
    setShowForm(false)
  }

  const handleRemoveMed = (id) => {
    onUpdate({ medications: data.medications.filter((m) => m.id !== id) })
  }

  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="space-y-4">
      {/* Existing medications */}
      <AnimatePresence mode="popLayout">
        {data.medications.map((med) => (
          <MedicationRow
            key={med.id}
            med={med}
            onRemove={handleRemoveMed}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </AnimatePresence>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddMed}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white rounded-2xl border-2 border-[#F4A261]/20 space-y-3" style={{ boxShadow: CARD_SHADOW }}>
              <input
                type="text"
                value={medForm.name}
                onChange={(e) => setMedForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Medication name *"
                className={`${inputBaseClass} border-[#E8E8E8]`}
                autoFocus
              />
              <input
                type="text"
                value={medForm.dosage}
                onChange={(e) => setMedForm((p) => ({ ...p, dosage: e.target.value }))}
                placeholder="Dosage (e.g. 68mg)"
                className={`${inputBaseClass} border-[#E8E8E8]`}
              />
              <div className="relative">
                <select
                  value={medForm.frequency}
                  onChange={(e) => setMedForm((p) => ({ ...p, frequency: e.target.value }))}
                  className={`${inputBaseClass} border-[#E8E8E8] appearance-none cursor-pointer`}
                >
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E] pointer-events-none" aria-hidden="true" />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-[#E8E8E8] text-[#6B6B6B] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]"
                  style={{ minHeight: 44 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!medForm.name.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]"
                  style={{ minHeight: 44 }}
                >
                  Add
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-[#F4A261]/40 text-[#F4A261] font-medium flex items-center justify-center gap-2 hover:bg-[#F4A261]/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
          style={{ minHeight: 44 }}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add medication
        </button>
      )}

      {data.medications.length === 0 && !showForm && (
        <p className="text-sm text-[#9E9E9E] text-center py-2">
          No medications added yet. You can skip this step.
        </p>
      )}
    </div>
  )
}

function StepLifestyle({ data, onUpdate }) {
  return (
    <div className="space-y-6">
      {/* Activity level */}
      <div>
        <label className="block text-sm font-medium text-[#3D3D3D] mb-2">Activity Level</label>
        <ChipSelect
          options={ACTIVITY_LEVELS}
          value={data.activityLevel}
          onChange={(val) => onUpdate({ activityLevel: val })}
        />
      </div>

      {/* Living environment */}
      <div>
        <label className="block text-sm font-medium text-[#3D3D3D] mb-2">Living Environment</label>
        <ChipSelect
          options={ENVIRONMENTS}
          value={data.livingEnvironment}
          onChange={(val) => onUpdate({ livingEnvironment: val })}
        />
      </div>

      {/* Social exposure */}
      <div>
        <label className="block text-sm font-medium text-[#3D3D3D] mb-2">Socialization</label>
        <ChipSelect
          options={SOCIAL_OPTIONS}
          value={data.socialExposure}
          onChange={(val) => onUpdate({ socialExposure: val })}
          multi
        />
      </div>
    </div>
  )
}

function StepDiet({ data, onUpdate }) {
  return (
    <div className="space-y-6">
      {/* Food type */}
      <div>
        <label className="block text-sm font-medium text-[#3D3D3D] mb-2">Food Type</label>
        <ChipSelect
          options={FOOD_TYPES}
          value={data.dietType}
          onChange={(val) => onUpdate({ dietType: val })}
        />
      </div>

      {/* Brand */}
      <div>
        <label className="block text-sm font-medium text-[#3D3D3D] mb-2">Food Brand</label>
        <input
          type="text"
          value={data.foodBrand}
          onChange={(e) => onUpdate({ foodBrand: e.target.value })}
          placeholder="e.g. Royal Canin, Blue Buffalo"
          className={`${inputBaseClass} border-[#E8E8E8]`}
        />
      </div>

      {/* Feeding schedule */}
      <div>
        <label className="block text-sm font-medium text-[#3D3D3D] mb-2">Feeding Schedule</label>
        <ChipSelect
          options={FEEDING_SCHEDULES}
          value={data.feedingSchedule}
          onChange={(val) => onUpdate({ feedingSchedule: val })}
        />
      </div>
    </div>
  )
}

function StepVaccinations({ data, onUpdate }) {
  const [showForm, setShowForm] = useState(false)
  const [vaxForm, setVaxForm] = useState({ name: '', dateGiven: '', nextDueDate: '', veterinarian: '' })
  const prefersReducedMotion = useReducedMotion()

  const handleAdd = (e) => {
    e.preventDefault()
    if (!vaxForm.name.trim()) return

    const newVax = {
      id: generateUUID(),
      name: vaxForm.name.trim(),
      dateGiven: vaxForm.dateGiven,
      nextDueDate: vaxForm.nextDueDate,
      veterinarian: vaxForm.veterinarian.trim(),
    }

    onUpdate({ vaccinations: [...data.vaccinations, newVax] })
    setVaxForm({ name: '', dateGiven: '', nextDueDate: '', veterinarian: '' })
    setShowForm(false)
  }

  const handleRemove = (id) => {
    onUpdate({ vaccinations: data.vaccinations.filter((v) => v.id !== id) })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#6B6B6B]">
        This step is optional. You can always add vaccinations later.
      </p>

      {/* Existing vaccinations */}
      <AnimatePresence mode="popLayout">
        {data.vaccinations.map((vax) => (
          <motion.div
            key={vax.id}
            layout
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, x: -50 }}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E8E8E8]"
          >
            <Syringe className="w-4 h-4 text-[#5B8DEF] flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#3D3D3D] truncate">{vax.name}</p>
              {vax.dateGiven && (
                <p className="text-xs text-[#9E9E9E]">Given: {vax.dateGiven}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleRemove(vax.id)}
              className="p-2 rounded-lg text-[#9E9E9E] hover:text-[#EF5350] hover:bg-[#EF5350]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]"
              aria-label={`Remove ${vax.name}`}
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white rounded-2xl border-2 border-[#5B8DEF]/20 space-y-3" style={{ boxShadow: CARD_SHADOW }}>
              <input
                type="text"
                value={vaxForm.name}
                onChange={(e) => setVaxForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Vaccine name *"
                className={`${inputBaseClass} border-[#E8E8E8]`}
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#9E9E9E] mb-1">Date given</label>
                  <input
                    type="date"
                    value={vaxForm.dateGiven}
                    onChange={(e) => setVaxForm((p) => ({ ...p, dateGiven: e.target.value }))}
                    className={`${inputBaseClass} border-[#E8E8E8] text-sm`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#9E9E9E] mb-1">Next due</label>
                  <input
                    type="date"
                    value={vaxForm.nextDueDate}
                    onChange={(e) => setVaxForm((p) => ({ ...p, nextDueDate: e.target.value }))}
                    className={`${inputBaseClass} border-[#E8E8E8] text-sm`}
                  />
                </div>
              </div>
              <input
                type="text"
                value={vaxForm.veterinarian}
                onChange={(e) => setVaxForm((p) => ({ ...p, veterinarian: e.target.value }))}
                placeholder="Veterinarian name"
                className={`${inputBaseClass} border-[#E8E8E8]`}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-[#E8E8E8] text-[#6B6B6B] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]"
                  style={{ minHeight: 44 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!vaxForm.name.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]"
                  style={{ minHeight: 44 }}
                >
                  Add
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-[#5B8DEF]/40 text-[#5B8DEF] font-medium flex items-center justify-center gap-2 hover:bg-[#5B8DEF]/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
          style={{ minHeight: 44 }}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add vaccination
        </button>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Success screen                                                             */
/* -------------------------------------------------------------------------- */

function SuccessScreen({ dogName, onComplete, prefersReducedMotion }) {
  const [particles] = useState(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      size: 6 + Math.random() * 12,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    }))
  )

  return (
    <div className="relative text-center py-8 overflow-hidden">
      {/* Celebration particles */}
      {!prefersReducedMotion &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              left: `${p.x}%`,
              top: '-10px',
            }}
            initial={{ y: 0, opacity: 0, scale: 0 }}
            animate={{
              y: ['0vh', '50vh'],
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0.5],
              rotate: [0, 360],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'easeOut',
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        ))}

      <motion.div
        initial={prefersReducedMotion ? {} : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={
          prefersReducedMotion
            ? {}
            : { type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }
        }
        className="relative z-10"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#66BB6A] to-[#43A047] flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Check className="w-10 h-10 text-white" />
        </div>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { delay: 0.4 }}
        className="relative z-10"
      >
        <h2
          className="text-2xl font-bold text-[#3D3D3D] mb-2"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Profile Complete!
        </h2>
        <p className="text-[#6B6B6B] mb-6 max-w-xs mx-auto">
          {dogName
            ? `Pawsy now has everything needed to give ${dogName} personalized health advice.`
            : 'Pawsy now has everything needed to give personalized health advice.'}
        </p>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={prefersReducedMotion ? {} : { delay: 0.7 }}
          className="bg-[#FDF8F3] rounded-2xl p-4 mb-6 inline-flex items-center gap-3 mx-auto"
        >
          <PremiumIcon size={24} />
          <p className="text-sm text-[#3D3D3D] font-medium text-left">
            Premium health insights are now active for {dogName || 'your dog'}.
          </p>
        </motion.div>

        <div>
          <motion.button
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            onClick={onComplete}
            className="px-8 py-4 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-xl shadow-lg text-lg flex items-center justify-center gap-2 mx-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            style={{ minHeight: 44 }}
          >
            Continue
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

function PremiumOnboarding({ dog, onComplete, onClose }) {
  const prefersReducedMotion = useReducedMotion()
  const [step, setStep] = useState(1)
  const [isComplete, setIsComplete] = useState(false)

  const [data, setData] = useState({
    isSpayedNeutered: dog?.isSpayedNeutered || false,
    chronicConditions: dog?.chronicConditions || [],
    surgeryHistory: dog?.surgeryHistory || [],
    medications: dog?.medications || [],
    activityLevel: dog?.activityLevel || 'moderate',
    livingEnvironment: dog?.livingEnvironment || 'indoor',
    socialExposure: dog?.socialExposure || [],
    dietType: dog?.dietType || 'dry',
    foodBrand: dog?.foodBrand || '',
    feedingSchedule: dog?.feedingSchedule || 'twice_daily',
    vaccinations: dog?.vaccinations || [],
  })

  const handleUpdate = useCallback((updates) => {
    setData((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSkip = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      handleFinish()
    }
  }

  const handleFinish = () => {
    setIsComplete(true)
  }

  const handleComplete = () => {
    onComplete(data)
  }

  const currentStepConfig = STEP_CONFIG[step - 1]
  const StepIcon = currentStepConfig.Icon

  const isOptionalStep = step === 2 || step === 5

  const contentAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -30 },
        transition: { type: 'spring', stiffness: 300, damping: 28 },
      }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFE8D6] flex flex-col">
        {/* Minimal header */}
        <header className="p-4 flex justify-end">
          <button
            type="button"
            onClick={handleComplete}
            className="p-2 rounded-xl hover:bg-black/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]"
            aria-label="Close"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <X className="w-5 h-5 text-[#6B6B6B]" />
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <SuccessScreen
            dogName={dog?.name}
            onComplete={handleComplete}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FDF8F3]/80 backdrop-blur-md border-b border-[#E8E8E8]/30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#F4A261]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]"
            aria-label="Close onboarding"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <X className="w-5 h-5 text-[#3D3D3D]" />
          </button>

          <StepIndicator
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            prefersReducedMotion={prefersReducedMotion}
          />

          <span className="text-xs font-medium text-[#9E9E9E] w-10 text-right">
            {step}/{TOTAL_STEPS}
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={step} {...contentAnimation}>
            {/* Step header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${currentStepConfig.color}15` }}
                >
                  <StepIcon
                    className="w-5 h-5"
                    style={{ color: currentStepConfig.color }}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h2
                    className="text-xl font-bold text-[#3D3D3D]"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {currentStepConfig.title}
                  </h2>
                  {isOptionalStep && (
                    <p className="text-xs text-[#9E9E9E]">Optional - you can skip this</p>
                  )}
                </div>
              </div>
            </div>

            {/* Step content */}
            {step === 1 && <StepMedicalHistory data={data} onUpdate={handleUpdate} />}
            {step === 2 && <StepMedications data={data} onUpdate={handleUpdate} />}
            {step === 3 && <StepLifestyle data={data} onUpdate={handleUpdate} />}
            {step === 4 && <StepDiet data={data} onUpdate={handleUpdate} />}
            {step === 5 && <StepVaccinations data={data} onUpdate={handleUpdate} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 border-t border-[#E8E8E8]/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className={`flex items-center gap-2 px-5 py-3 text-[#6B6B6B] font-medium rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 ${
              step === 1 ? 'invisible' : ''
            }`}
            style={{ minHeight: 44 }}
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            Back
          </button>

          <div className="flex items-center gap-2">
            {isOptionalStep && (
              <button
                type="button"
                onClick={handleSkip}
                className="flex items-center gap-1.5 px-4 py-3 text-[#9E9E9E] font-medium rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                style={{ minHeight: 44 }}
              >
                <SkipForward className="w-4 h-4" aria-hidden="true" />
                Skip
              </button>
            )}

            <motion.button
              type="button"
              onClick={handleNext}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-xl shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
              style={{ minHeight: 44 }}
            >
              {step === TOTAL_STEPS ? (
                <>
                  Complete
                  <Check className="w-5 h-5" aria-hidden="true" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PremiumOnboarding
