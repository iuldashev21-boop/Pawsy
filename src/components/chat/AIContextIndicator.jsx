import { useState, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Brain,
  User,
  AlertTriangle,
  Heart,
  Pill,
  Shield,
  Lock,
  ChevronDown,
} from 'lucide-react'
import { useDog } from '../../context/DogContext'
import { usePremium } from '../../hooks/usePremium'
import LocalStorageService from '../../services/storage/LocalStorageService'
import { getBreedRisks } from '../../constants/breedHealthRisks'

/**
 * AIContextIndicator
 *
 * Shows what context the AI assistant is using for the active dog.
 * Collapsed: compact pill showing "Pawsy knows: {n} health facts"
 * Expanded: detailed card with sections for Profile, Allergies, Health Facts,
 *           Medications (premium), and Breed Risks (premium).
 */
function AIContextIndicator() {
  const { activeDog } = useDog()
  const { isPremium } = usePremium()
  const shouldReduceMotion = useReducedMotion()
  const [isExpanded, setIsExpanded] = useState(false)

  // Gather context data
  const contextData = useMemo(() => {
    if (!activeDog) return null

    const petFacts = LocalStorageService.getPetFacts(activeDog.id)
    const allergies = activeDog.allergies || []
    const medications = activeDog.medications || []
    const breedRisks = getBreedRisks(activeDog.breed)
    const hasBreed = Boolean(activeDog.breed)

    return {
      petFactsCount: petFacts.length,
      allergies,
      medications,
      breedRisks,
      hasBreed,
      dogName: activeDog.name || 'Unknown',
      breed: activeDog.breed || '',
      weight: activeDog.weight,
      weightUnit: activeDog.weightUnit || 'lbs',
      age: activeDog.age,
    }
  }, [activeDog])

  if (!activeDog || !contextData) {
    return null
  }

  const { petFactsCount, allergies, medications, breedRisks, hasBreed } = contextData

  // Determine if this is an "empty" context (new user, no meaningful data)
  const hasAnyContext =
    petFactsCount > 0 ||
    allergies.length > 0 ||
    (isPremium && medications.length > 0) ||
    (isPremium && breedRisks.length > 0)

  const sections = [
    {
      key: 'profile',
      label: 'Profile',
      icon: User,
      detail: `${contextData.dogName}${contextData.breed ? ` - ${contextData.breed}` : ''}`,
      premium: false,
    },
    {
      key: 'allergies',
      label: 'Allergies',
      icon: AlertTriangle,
      detail: allergies.length > 0 ? `${allergies.length} known` : 'None',
      premium: false,
    },
    {
      key: 'health-facts',
      label: 'Health Facts',
      icon: Heart,
      detail: petFactsCount > 0 ? `${petFactsCount} facts` : 'None yet',
      premium: false,
    },
    {
      key: 'medications',
      label: 'Medications',
      icon: Pill,
      detail: isPremium
        ? (medications.length > 0 ? `${medications.length} active` : 'None')
        : 'Premium',
      premium: true,
    },
    {
      key: 'breed-risks',
      label: 'Breed Risks',
      icon: Shield,
      detail: isPremium
        ? (hasBreed && breedRisks.length > 0
          ? `${breedRisks.length} risks tracked`
          : 'No known risks')
        : 'Premium',
      premium: true,
    },
  ]

  return (
    <div data-testid="ai-context-indicator">
      {/* Collapsed pill */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#7EC8C8]/10 hover:bg-[#7EC8C8]/15 transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
        aria-label="AI context details"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#5FB3B3]" aria-hidden="true" />
          <span
            className="text-xs font-medium text-[#5FB3B3]"
            style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}
          >
            Pawsy knows: {petFactsCount} health facts
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-[#5FB3B3]" aria-hidden="true" />
        </motion.div>
      </button>

      {/* Expanded card */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 bg-white/80 rounded-xl border border-[#E8E8E8]/50">
              <h4
                className="text-xs font-bold text-[#3D3D3D] mb-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                AI Context
              </h4>

              {!hasAnyContext && (
                <p className="text-xs text-[#9E9E9E] italic mb-2">
                  No health context yet — chat to start building!
                </p>
              )}

              <div className="space-y-1.5">
                {sections.map((section) => {
                  const Icon = section.icon
                  const isLocked = section.premium && !isPremium

                  return (
                    <div
                      key={section.key}
                      data-section={section.key}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
                        isLocked ? 'opacity-60' : ''
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          isLocked ? 'text-[#9E9E9E]' : 'text-[#5FB3B3]'
                        }`}
                        aria-hidden="true"
                      />
                      <span
                        className="text-xs font-medium text-[#3D3D3D] min-w-0"
                        style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}
                      >
                        {section.label}
                      </span>
                      <span className="flex-1" />
                      <span
                        className={`text-xs ${
                          isLocked ? 'text-[#9E9E9E]' : 'text-[#6B6B6B]'
                        }`}
                        style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}
                      >
                        {section.detail}
                      </span>
                      {isLocked && (
                        <Lock
                          className="w-3 h-3 text-[#9E9E9E] flex-shrink-0"
                          aria-hidden="true"
                          data-testid="lock-icon"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AIContextIndicator
