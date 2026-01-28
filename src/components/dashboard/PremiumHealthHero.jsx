import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import HealthOrb from '../dog/HealthOrb'
import LocalStorageService from '../../services/storage/LocalStorageService'

function PremiumHealthHero({ activeDog, alertCount = 0 }) {
  const healthStatus = useMemo(() => {
    if (alertCount > 0) return 'attention'
    if (!activeDog) return 'unknown'
    const petFacts = LocalStorageService.getPetFacts(activeDog.id)
    if (petFacts.length === 0) return 'unknown'
    return 'good'
  }, [activeDog, alertCount])

  const statusText = useMemo(() => {
    if (!activeDog) return { heading: 'Start Health Check', sub: 'Chat with Pawsy about health concerns' }
    if (healthStatus === 'attention') {
      const plural = alertCount !== 1 ? 's' : ''
      return {
        heading: `${activeDog.name} needs attention`,
        sub: `${alertCount} active alert${plural} to review`,
      }
    }
    if (healthStatus === 'unknown') {
      return {
        heading: `Set up ${activeDog.name}'s profile`,
        sub: 'Chat with Pawsy to build a health profile',
      }
    }
    return {
      heading: `${activeDog.name} is feeling great`,
      sub: 'No active concerns',
    }
  }, [activeDog, healthStatus, alertCount])

  return (
    <Link
      to="/chat"
      className="group block relative overflow-hidden rounded-2xl md:rounded-3xl text-white active:scale-[0.98] transition-transform focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
      style={{
        background: 'linear-gradient(135deg, #7EC8C8 0%, #5CB8B8 35%, #4AACAC 65%, #3D9E9E 100%)',
        boxShadow: '0 4px 20px rgba(126,200,200,0.25), 0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      {/* Organic background shapes */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/[0.05]" />
        <div className="absolute -right-6 -bottom-20 w-44 h-44 rounded-full bg-white/[0.04]" />
        <div className="hidden md:block absolute left-[30%] -bottom-10 w-32 h-32 rounded-full bg-white/[0.03]" />
        <div className="hidden md:block hero-shimmer-line absolute inset-0" />
      </div>

      <div className="relative p-4 md:p-8">
        <div className="flex items-center gap-4 md:gap-6">
          {/* Compact Health Orb */}
          <div className="flex-shrink-0 md:group-hover:scale-110 transition-transform duration-500 ease-out">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/15 flex items-center justify-center">
              <HealthOrb status={healthStatus} compact />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4
              className="font-bold text-[15px] md:text-2xl leading-tight mb-1"
              style={{ fontFamily: "'Fraunces', 'Nunito', serif" }}
            >
              {statusText.heading}
            </h4>
            <p
              className="text-white/70 text-xs md:text-sm leading-relaxed"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {statusText.sub}
            </p>
          </div>

          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all duration-300"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-0.5 transition-transform duration-300" aria-hidden="true" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default PremiumHealthHero
