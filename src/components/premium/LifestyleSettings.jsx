import { motion, useReducedMotion } from 'framer-motion'
import { Activity, Home, Trees, Users, Check } from 'lucide-react'

const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)'

const ACTIVITY_LEVELS = [
  { value: 'low', label: 'Low', description: 'Short walks, mostly resting', icon: '1' },
  { value: 'moderate', label: 'Moderate', description: 'Regular walks, some play', icon: '2' },
  { value: 'high', label: 'High', description: 'Long walks, active play daily', icon: '3' },
  { value: 'very_high', label: 'Very High', description: 'Running, hiking, agility', icon: '4' },
]

const LIVING_ENVIRONMENTS = [
  { value: 'indoor', label: 'Indoor', description: 'Apartment or house', Icon: Home },
  { value: 'outdoor', label: 'Outdoor', description: 'Yard access, outdoor kennel', Icon: Trees },
  { value: 'both', label: 'Both', description: 'Indoor with outdoor access', Icon: Home },
]

const SOCIAL_OPTIONS = [
  { value: 'dog_parks', label: 'Dog parks' },
  { value: 'daycare', label: 'Daycare' },
  { value: 'walks_with_other_dogs', label: 'Walks with other dogs' },
  { value: 'none', label: 'None' },
]

const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
}

function RadioOption({ selected, label, description, onSelect, children, prefersReducedMotion }) {
  return (
    <motion.button
      type="button"
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      onClick={onSelect}
      className={`w-full p-3.5 rounded-xl border-2 text-left transition-all flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 ${
        selected
          ? 'border-[#F4A261] bg-[#F4A261]/5'
          : 'border-[#E8E8E8] bg-white hover:border-[#F4A261]/50'
      }`}
      style={{ minHeight: 44 }}
      role="radio"
      aria-checked={selected}
    >
      {/* Radio circle */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          selected ? 'border-[#F4A261] bg-[#F4A261]' : 'border-[#E8E8E8]'
        }`}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>

      {children}

      <div className="flex-1 min-w-0">
        <p className={`font-medium ${selected ? 'text-[#F4A261]' : 'text-[#3D3D3D]'}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-[#9E9E9E] mt-0.5">{description}</p>
        )}
      </div>
    </motion.button>
  )
}

function CheckboxOption({ checked, label, onToggle, prefersReducedMotion }) {
  return (
    <motion.button
      type="button"
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      onClick={onToggle}
      className={`px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-1 ${
        checked
          ? 'border-[#F4A261] bg-[#F4A261] text-white shadow-md'
          : 'border-[#E8E8E8] bg-white text-[#6B6B6B] hover:border-[#F4A261] hover:text-[#F4A261]'
      }`}
      style={{ minHeight: 44 }}
      role="checkbox"
      aria-checked={checked}
    >
      {checked && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
      {label}
    </motion.button>
  )
}

function LifestyleSettings({ activityLevel, livingEnvironment, socialExposure = [], onChange }) {
  const prefersReducedMotion = useReducedMotion()

  const handleActivityChange = (value) => {
    onChange({ activityLevel: value, livingEnvironment, socialExposure })
  }

  const handleEnvironmentChange = (value) => {
    onChange({ activityLevel, livingEnvironment: value, socialExposure })
  }

  const handleSocialToggle = (value) => {
    let newSocial

    if (value === 'none') {
      // "None" clears all other selections
      newSocial = socialExposure.includes('none') ? [] : ['none']
    } else {
      // Remove "none" if selecting a real option
      const withoutNone = socialExposure.filter((s) => s !== 'none')
      newSocial = withoutNone.includes(value)
        ? withoutNone.filter((s) => s !== value)
        : [...withoutNone, value]
    }

    onChange({ activityLevel, livingEnvironment, socialExposure: newSocial })
  }

  return (
    <motion.div
      variants={prefersReducedMotion ? {} : staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Activity Level */}
      <motion.div variants={prefersReducedMotion ? {} : staggerItem}>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-[#F4A261]" aria-hidden="true" />
          <h3
            className="text-lg font-bold text-[#3D3D3D]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Activity Level
          </h3>
        </div>
        <div
          className="bg-white rounded-2xl border border-[#F4A261]/10 p-4 space-y-2"
          style={{ boxShadow: CARD_SHADOW }}
          role="radiogroup"
          aria-label="Activity level"
        >
          {ACTIVITY_LEVELS.map((level) => (
            <RadioOption
              key={level.value}
              selected={activityLevel === level.value}
              label={level.label}
              description={level.description}
              onSelect={() => handleActivityChange(level.value)}
              prefersReducedMotion={prefersReducedMotion}
            >
              {/* Activity bar indicator */}
              <div className="flex gap-0.5 flex-shrink-0">
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={`w-1.5 rounded-full transition-colors ${
                      bar <= parseInt(level.icon)
                        ? activityLevel === level.value
                          ? 'bg-[#F4A261]'
                          : 'bg-[#9E9E9E]'
                        : 'bg-[#E8E8E8]'
                    }`}
                    style={{ height: 6 + bar * 3 }}
                  />
                ))}
              </div>
            </RadioOption>
          ))}
        </div>
      </motion.div>

      {/* Living Environment */}
      <motion.div variants={prefersReducedMotion ? {} : staggerItem}>
        <div className="flex items-center gap-2 mb-3">
          <Home className="w-5 h-5 text-[#7EC8C8]" aria-hidden="true" />
          <h3
            className="text-lg font-bold text-[#3D3D3D]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Living Environment
          </h3>
        </div>
        <div
          className="bg-white rounded-2xl border border-[#7EC8C8]/10 p-4 space-y-2"
          style={{ boxShadow: CARD_SHADOW }}
          role="radiogroup"
          aria-label="Living environment"
        >
          {LIVING_ENVIRONMENTS.map((env) => {
            const EnvIcon = env.Icon
            return (
              <RadioOption
                key={env.value}
                selected={livingEnvironment === env.value}
                label={env.label}
                description={env.description}
                onSelect={() => handleEnvironmentChange(env.value)}
                prefersReducedMotion={prefersReducedMotion}
              >
                <EnvIcon
                  className={`w-4 h-4 flex-shrink-0 ${
                    livingEnvironment === env.value ? 'text-[#F4A261]' : 'text-[#9E9E9E]'
                  }`}
                  aria-hidden="true"
                />
              </RadioOption>
            )
          })}
        </div>
      </motion.div>

      {/* Social Exposure */}
      <motion.div variants={prefersReducedMotion ? {} : staggerItem}>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-[#81C784]" aria-hidden="true" />
          <h3
            className="text-lg font-bold text-[#3D3D3D]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Social Exposure
          </h3>
        </div>
        <div
          className="bg-white rounded-2xl border border-[#81C784]/10 p-4"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <p className="text-sm text-[#6B6B6B] mb-3">
            Select all social activities your dog regularly does
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Social exposure options">
            {SOCIAL_OPTIONS.map((option) => (
              <CheckboxOption
                key={option.value}
                checked={socialExposure.includes(option.value)}
                label={option.label}
                onToggle={() => handleSocialToggle(option.value)}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default LifestyleSettings
