import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Circle, AlertCircle, ChevronRight } from 'lucide-react'
import { computeProfileCompletion } from '../../services/storage/migration'

const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)'

const FIELD_CONFIG = [
  { key: 'name', label: 'Name', prompt: 'Add your dog\'s name' },
  { key: 'breed', label: 'Breed', prompt: 'Select a breed' },
  { key: 'dateOfBirth', label: 'Birthday', prompt: 'Add birthday for age-based alerts' },
  { key: 'weight', label: 'Weight', prompt: 'Add weight for dosage calculations' },
  { key: 'allergies', label: 'Allergies', prompt: 'List any known allergies', isArray: true },
  { key: 'chronicConditions', label: 'Health conditions', prompt: 'Note any chronic conditions', isArray: true },
  { key: 'medications', label: 'Medications', prompt: 'Track current medications', isArray: true },
  { key: 'vaccinations', label: 'Vaccinations', prompt: 'Record vaccination history', isArray: true },
  { key: 'isSpayedNeutered', label: 'Spay/neuter status', prompt: 'Update spay/neuter status', isBoolean: true },
  { key: 'activityLevel', label: 'Activity level', prompt: 'Set activity level for care tips' },
  { key: 'livingEnvironment', label: 'Living environment', prompt: 'Describe living environment' },
  { key: 'foodBrand', label: 'Food brand', prompt: 'Add food brand for diet tracking' },
]

function isFieldComplete(dog, field) {
  const value = dog?.[field.key]
  if (field.isArray) return Array.isArray(value) && value.length > 0
  if (field.isBoolean) return !!value
  if (field.key === 'weight') return value != null && value !== '' && value !== 0
  return typeof value === 'string' && value.length > 0
}

function CircularProgress({ percentage, size = 80, strokeWidth = 6, prefersReducedMotion }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const getColor = () => {
    if (percentage >= 80) return '#66BB6A'
    if (percentage >= 50) return '#F4A261'
    return '#FFCA28'
  }

  const color = getColor()

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E8E8E8"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={prefersReducedMotion ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 1.2, ease: 'easeOut', delay: 0.3 }
          }
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-lg font-bold"
          style={{ fontFamily: 'Nunito, sans-serif', color }}
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }
          }
        >
          {percentage}%
        </motion.span>
      </div>
    </div>
  )
}

function ProfileCompletion({ dog }) {
  const prefersReducedMotion = useReducedMotion()

  const { percentage, completedFields, incompleteFields } = useMemo(() => {
    if (!dog) {
      return { percentage: 0, completedFields: [], incompleteFields: FIELD_CONFIG }
    }

    const pct = computeProfileCompletion(dog)
    const completed = FIELD_CONFIG.filter((f) => isFieldComplete(dog, f))
    const incomplete = FIELD_CONFIG.filter((f) => !isFieldComplete(dog, f))

    return { percentage: pct, completedFields: completed, incompleteFields: incomplete }
  }, [dog])

  const getMessage = () => {
    if (percentage === 100) return 'Profile complete! Pawsy has the best data for personalized advice.'
    if (percentage >= 75) return 'Almost there! A few more details will help Pawsy give even better advice.'
    if (percentage >= 50) return 'Good progress! Adding more info helps Pawsy personalize health tips.'
    return 'Get started by filling in your dog\'s profile for personalized care.'
  }

  return (
    <div className="space-y-4">
      {/* Header card */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 300, damping: 24 }}
        className="bg-white rounded-2xl border border-[#F4A261]/10 p-5"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <div className="flex items-center gap-5">
          <CircularProgress
            percentage={percentage}
            prefersReducedMotion={prefersReducedMotion}
          />
          <div className="flex-1 min-w-0">
            <h3
              className="text-lg font-bold text-[#3D3D3D] mb-1"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Profile Completion
            </h3>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">
              {getMessage()}
            </p>
            <p className="text-xs text-[#9E9E9E] mt-1.5">
              {completedFields.length} of {FIELD_CONFIG.length} fields completed
            </p>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="mt-4 w-full h-2 bg-[#E8E8E8] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                percentage >= 80
                  ? 'linear-gradient(90deg, #66BB6A, #81C784)'
                  : percentage >= 50
                  ? 'linear-gradient(90deg, #F4A261, #E8924F)'
                  : 'linear-gradient(90deg, #FFCA28, #FFD54F)',
            }}
            initial={prefersReducedMotion ? { width: `${percentage}%` } : { width: '0%' }}
            animate={{ width: `${percentage}%` }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 1, ease: 'easeOut', delay: 0.2 }
            }
          />
        </div>
      </motion.div>

      {/* Incomplete fields */}
      {incompleteFields.length > 0 && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            prefersReducedMotion
              ? {}
              : { type: 'spring', stiffness: 300, damping: 24, delay: 0.15 }
          }
          className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <div className="px-4 py-3 border-b border-[#E8E8E8]">
            <h4
              className="text-sm font-bold text-[#3D3D3D] flex items-center gap-1.5"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              <AlertCircle className="w-4 h-4 text-[#F4A261]" aria-hidden="true" />
              Incomplete Fields
            </h4>
          </div>
          <div className="divide-y divide-[#E8E8E8]">
            {incompleteFields.map((field) => (
              <div
                key={field.key}
                className="px-4 py-3 flex items-center gap-3 hover:bg-[#FDF8F3] transition-colors"
              >
                <Circle className="w-4 h-4 text-[#9E9E9E] flex-shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#3D3D3D]">{field.label}</p>
                  <p className="text-xs text-[#9E9E9E]">{field.prompt}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9E9E9E] flex-shrink-0" aria-hidden="true" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Completed fields (collapsed) */}
      {completedFields.length > 0 && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            prefersReducedMotion
              ? {}
              : { type: 'spring', stiffness: 300, damping: 24, delay: 0.25 }
          }
          className="bg-white rounded-2xl border border-[#66BB6A]/10 overflow-hidden"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <div className="px-4 py-3 border-b border-[#66BB6A]/10">
            <h4
              className="text-sm font-bold text-[#3D3D3D] flex items-center gap-1.5"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              <CheckCircle2 className="w-4 h-4 text-[#66BB6A]" aria-hidden="true" />
              Completed ({completedFields.length})
            </h4>
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-2">
            {completedFields.map((field) => (
              <span
                key={field.key}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-[#66BB6A]/10 text-[#43A047] rounded-full font-medium"
              >
                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                {field.label}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ProfileCompletion
