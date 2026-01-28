import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  Stethoscope,
  Activity,
  Utensils,
  AlertTriangle,
  ChevronRight,
  MessageCircle,
  Pin,
} from 'lucide-react'
import { useDog } from '../../context/DogContext'
import LocalStorageService from '../../services/storage/LocalStorageService'
import { warmCardStyle } from '../../constants/cardStyles'

const CATEGORY_ICONS = {
  health: { Icon: Heart, color: '#EF5350' },
  symptom: { Icon: Stethoscope, color: '#F4A261' },
  digestive: { Icon: Utensils, color: '#7EC8C8' },
  allergy: { Icon: AlertTriangle, color: '#FFCA28' },
  default: { Icon: Activity, color: '#6B6B6B' },
}

function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.default
}

function HealthSnapshot() {
  const { activeDog } = useDog()

  const petFacts = useMemo(() => {
    if (!activeDog) return []
    return LocalStorageService.getPetFacts(activeDog.id)
  }, [activeDog])

  const topFacts = useMemo(() => petFacts.slice(0, 3), [petFacts])
  const factCount = petFacts.length
  const isEmpty = factCount === 0

  if (!activeDog) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-0.5">
        <h3
          className="font-bold text-sm text-[#2D2A26]"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Health Snapshot
        </h3>
        {!isEmpty && (
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor: 'rgba(126,200,200,0.15)',
              color: '#5AB3B3',
            }}
          >
            {factCount}
          </span>
        )}
      </div>

      <div className="rounded-2xl p-4" style={warmCardStyle}>
        {isEmpty ? (
          /* Empty state */
          <div className="text-center py-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{
                background:
                  'linear-gradient(135deg, rgba(126,200,200,0.15) 0%, rgba(90,175,175,0.1) 100%)',
              }}
            >
              <Heart
                className="w-5 h-5 text-[#7EC8C8]"
                aria-hidden="true"
              />
            </div>
            <p
              className="text-[13px] text-[#6B6B6B] mb-3 leading-relaxed"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              Chat with Pawsy to start building your health profile
            </p>
            <Link
              to="/chat"
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#F4A261] hover:text-[#E8924F] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 rounded"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
              Start chatting
            </Link>
          </div>
        ) : (
          /* Facts list */
          <div>
            <p
              className="text-[12px] text-[#8C7B6B] mb-3"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {factCount} health event{factCount !== 1 ? 's' : ''} tracked
            </p>

            <div className="space-y-2.5">
              {topFacts.map((fact) => {
                const { Icon, color } = getCategoryIcon(fact.category)
                return (
                  <div key={fact.id} className="flex items-start gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${color}15`,
                      }}
                    >
                      <Icon
                        className="w-3.5 h-3.5"
                        style={{ color }}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex items-start gap-1">
                      {fact.pinned && (
                        <Pin
                          className="w-3 h-3 fill-current text-[#F4A261] flex-shrink-0 mt-0.5"
                          aria-label="Pinned"
                        />
                      )}
                      <p
                        className="text-[12px] text-[#3D3D3D] leading-snug"
                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {fact.text}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(232,221,208,0.4)' }}>
              <Link
                to="/health-timeline"
                className="inline-flex items-center gap-1 text-[12px] font-bold text-[#F4A261] hover:text-[#E8924F] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 rounded"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                View timeline
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HealthSnapshot
