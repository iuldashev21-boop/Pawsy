import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Brain, Shield, AlertCircle, Heart, Camera, MessageCircle } from 'lucide-react'
import LocalStorageService from '../../services/storage/LocalStorageService'
import { getBreedRisks } from '../../constants/breedHealthRisks'
import PremiumIcon from '../common/PremiumIcon'

/**
 * PremiumValuePreview - Personalized value display for the upgrade flow
 *
 * Shows personalized data about what premium AI could do with the user's data:
 * - Health facts count
 * - Breed-specific risk count
 * - Allergy count
 * - Blurred preview of premium dashboard
 *
 * Props:
 * - dogName: string
 * - dogId: string (for looking up facts)
 * - breed: string (for breed risk lookup)
 * - allergies: string[] (known allergies)
 */
function PremiumValuePreview({ dogName = '', dogId = '', breed = '', allergies = [] }) {
  const prefersReducedMotion = useReducedMotion()

  const factsCount = useMemo(() => {
    if (!dogId) return 0
    return LocalStorageService.getPetFacts(dogId).length
  }, [dogId])

  const breedRisks = useMemo(() => {
    return getBreedRisks(breed)
  }, [breed])

  const allergyCount = Array.isArray(allergies) ? allergies.length : 0

  const fadeIn = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }

  return (
    <div className="space-y-5">
      {/* Personalized headline */}
      <motion.div {...fadeIn} className="text-center">
        <h3
          className="text-lg font-bold text-[#3D3D3D] mb-1"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Unlock {dogName ? `${dogName}'s` : 'Your Dog\'s'} Full Health Potential
        </h3>
        <p className="text-sm text-[#6B6B6B]">
          See what premium AI can do with {dogName ? `${dogName}'s` : 'your dog\'s'} health data
        </p>
      </motion.div>

      {/* Personalized value stats */}
      <motion.div
        {...(prefersReducedMotion ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 } })}
        className="space-y-3"
      >
        {/* Health facts stat */}
        <div className="flex items-center gap-3 p-3 bg-[#FDF8F3] rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-[#F4A261]/10 flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-[#F4A261]" aria-hidden="true" />
          </div>
          <p className="text-sm text-[#3D3D3D]">
            You have <strong>{factsCount} health facts</strong> that premium AI would use
          </p>
        </div>

        {/* Breed risks stat - only shown if breed has known risks */}
        {breedRisks.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-[#FDF8F3] rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-[#EF5350]/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-[#EF5350]" aria-hidden="true" />
            </div>
            <p className="text-sm text-[#3D3D3D]">
              <strong>{breedRisks.length} breed-specific health risks</strong> to monitor
            </p>
          </div>
        )}

        {/* Allergies stat - only shown if allergies exist */}
        {allergyCount > 0 && (
          <div className="flex items-center gap-3 p-3 bg-[#FDF8F3] rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-[#FFCA28]/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-[#FFCA28]" aria-hidden="true" />
            </div>
            <p className="text-sm text-[#3D3D3D]">
              <strong>{allergyCount} known allergies</strong> for AI to consider
            </p>
          </div>
        )}
      </motion.div>

      {/* Blurred premium dashboard preview */}
      <motion.div
        {...(prefersReducedMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.2 } })}
        data-testid="premium-dashboard-preview"
        className="relative rounded-2xl overflow-hidden border border-[#E8E8E8]"
      >
        {/* Blurred fake dashboard */}
        <div
          className="p-4 bg-gradient-to-br from-[#FDF8F3] to-[#FFF5ED] select-none"
          style={{ filter: 'blur(4px)', pointerEvents: 'none' }}
          aria-hidden="true"
        >
          <div className="space-y-3">
            {/* Fake health score */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#66BB6A]/20" />
              <div className="flex-1">
                <div className="h-3 w-24 bg-[#3D3D3D]/20 rounded-full" />
                <div className="h-2 w-16 bg-[#6B6B6B]/15 rounded-full mt-1.5" />
              </div>
            </div>

            {/* Fake feature cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-white rounded-xl">
                <Heart className="w-4 h-4 text-[#EF5350]/40 mb-1" />
                <div className="h-2 w-full bg-[#E8E8E8] rounded-full" />
              </div>
              <div className="p-3 bg-white rounded-xl">
                <Camera className="w-4 h-4 text-[#F4A261]/40 mb-1" />
                <div className="h-2 w-full bg-[#E8E8E8] rounded-full" />
              </div>
              <div className="p-3 bg-white rounded-xl">
                <MessageCircle className="w-4 h-4 text-[#7EC8C8]/40 mb-1" />
                <div className="h-2 w-full bg-[#E8E8E8] rounded-full" />
              </div>
            </div>

            {/* Fake timeline */}
            <div className="space-y-2">
              <div className="h-2 w-full bg-[#E8E8E8] rounded-full" />
              <div className="h-2 w-3/4 bg-[#E8E8E8] rounded-full" />
              <div className="h-2 w-1/2 bg-[#E8E8E8] rounded-full" />
            </div>
          </div>
        </div>

        {/* Overlay label */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full shadow-sm border border-[#E8E8E8]">
            <PremiumIcon size={16} />
            <span className="text-sm font-semibold text-[#3D3D3D]">
              Premium Dashboard
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PremiumValuePreview
