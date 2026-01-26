import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Dog, ChevronRight } from 'lucide-react'
import { useDog } from '../../context/DogContext'
import { BREED_DATA } from '../../constants/breeds'

const SEVERITY_CONFIG = {
  common: { color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Common' },
  moderate: { color: 'text-orange-700', bg: 'bg-orange-100', label: 'Moderate' },
  serious: { color: 'text-red-700', bg: 'bg-red-100', label: 'Serious' },
}

const MS_PER_DAY = 86400000

function getDayOfYear() {
  const now = new Date()
  return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / MS_PER_DAY)
}

function BreedHealthSpotlight() {
  const { activeDog } = useDog()
  const prefersReducedMotion = useReducedMotion()
  const dogBreed = activeDog?.breed

  const spotlight = useMemo(() => {
    if (!dogBreed) return null

    const breedLower = dogBreed.toLowerCase()
    const match = BREED_DATA.find(b =>
      b.name.toLowerCase().includes(breedLower) || breedLower.includes(b.name.toLowerCase())
    )

    if (!match?.healthRisks.length) return null

    const dayIndex = getDayOfYear() % match.healthRisks.length
    const risk = match.healthRisks[dayIndex]

    return { breed: match, risk }
  }, [dogBreed])

  if (!spotlight) return null

  const { breed, risk } = spotlight
  const severity = SEVERITY_CONFIG[risk.severity] || SEVERITY_CONFIG.common

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
      }

  return (
    <motion.div
      {...animationProps}
      className="hidden md:block rounded-xl p-3.5 border border-[#E8DDD0]/50 bg-white shadow-sm"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${breed.iconColor}20` }}
        >
          <Dog className="w-4.5 h-4.5" style={{ color: breed.iconColor }} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="text-xs font-bold text-[#2D2A26] truncate mb-1"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Breed Health Spotlight
          </h4>
          <p
            className="text-[11px] font-semibold text-[#3D3D3D] mb-0.5"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            {risk.condition}
          </p>
          <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mb-1 ${severity.bg} ${severity.color}`}>
            {severity.label}
          </span>
          <p className="text-[11px] text-[#8C7B6B] leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {risk.description}
          </p>
          <Link
            to="/breed-info"
            className="inline-flex items-center gap-0.5 mt-2 text-[11px] font-semibold text-[#E8924F] hover:text-[#D4854A] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-1 rounded"
          >
            See all health risks
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default BreedHealthSpotlight
