import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle, ChevronRight } from 'lucide-react'
import { useDog } from '../../context/DogContext'

const PROFILE_FIELDS = [
  { key: 'name', label: 'Add a name', check: (dog) => !!dog.name },
  { key: 'photoUrl', label: 'Add a photo', link: '/settings', check: (dog) => !!dog.photoUrl },
  { key: 'breed', label: 'Select a breed', link: '/settings', check: (dog) => !!dog.breed },
  { key: 'dateOfBirth', label: 'Set birthday', link: '/settings', check: (dog) => !!dog.dateOfBirth },
  { key: 'weight', label: 'Enter weight', link: '/settings', check: (dog) => dog.weight > 0 },
  { key: 'allergies', label: 'Log allergies', link: '/settings', check: (dog) => Array.isArray(dog.allergies) && dog.allergies.length > 0 },
  { key: 'gender', label: 'Set gender', link: '/settings', check: (dog) => !!dog.gender },
]

const RING_SIZE = 56
const RING_CENTER = RING_SIZE / 2
const RING_STROKE = 5
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function ProfileCompletionCard() {
  const { activeDog } = useDog()
  const prefersReducedMotion = useReducedMotion()

  const { percentage, completedCount, nextStep } = useMemo(() => {
    if (!activeDog) return { percentage: 0, completedCount: 0, nextStep: null }

    let completed = 0
    let firstIncomplete = null

    for (const field of PROFILE_FIELDS) {
      if (field.check(activeDog)) {
        completed++
      } else if (!firstIncomplete) {
        firstIncomplete = field
      }
    }

    return {
      percentage: Math.round((completed / PROFILE_FIELDS.length) * 100),
      completedCount: completed,
      nextStep: firstIncomplete,
    }
  }, [activeDog])

  if (!activeDog) return null

  const isComplete = percentage === 100
  const strokeDashoffset = RING_CIRCUMFERENCE - (percentage / 100) * RING_CIRCUMFERENCE

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
      }

  if (isComplete) {
    return (
      <motion.div
        {...animationProps}
        className="rounded-2xl p-3 border border-[#7EC8C8]/20 bg-gradient-to-br from-[#EFF9FA] to-[#E2F4F5]"
      >
        <div className="flex items-center gap-2.5">
          <CheckCircle className="w-5 h-5 text-[#4A9E9E] flex-shrink-0" aria-hidden="true" />
          <p
            className="text-xs font-semibold text-[#3D3D3D]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Profile complete
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      {...animationProps}
      className="rounded-2xl p-3.5 border border-[#E8DDD0]/50 shadow-sm"
      style={{
        background: 'linear-gradient(135deg, rgba(255,252,247,0.95) 0%, rgba(255,248,240,0.9) 100%)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Progress Ring */}
        <div className="flex-shrink-0 relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            className="transform -rotate-90"
            aria-hidden="true"
          >
            {/* Background ring */}
            <circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke="#F0EBE4"
              strokeWidth={RING_STROKE}
            />
            {/* Progress ring */}
            <motion.circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke="#E8924F"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              initial={prefersReducedMotion ? { strokeDashoffset } : { strokeDashoffset: RING_CIRCUMFERENCE }}
              animate={{ strokeDashoffset }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#2D2A26]"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
            aria-label={`Profile ${percentage}% complete`}
          >
            {percentage}%
          </span>
        </div>

        {/* Text + CTA */}
        <div className="flex-1 min-w-0">
          <h4
            className="text-xs font-bold text-[#2D2A26] mb-0.5"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Complete your profile
          </h4>
          <p className="text-[11px] text-[#8C7B6B]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {completedCount} of {PROFILE_FIELDS.length} done
          </p>
          {nextStep && (
            <Link
              to={nextStep.link || '/settings'}
              className="inline-flex items-center gap-0.5 mt-1.5 text-[11px] font-semibold text-[#E8924F] hover:text-[#D4854A] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-1 rounded"
            >
              {nextStep.label}
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProfileCompletionCard
