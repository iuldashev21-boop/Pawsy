import { motion, useReducedMotion } from 'framer-motion'
import { Camera, Clock } from 'lucide-react'
import { usePremium } from '../../hooks/usePremium'
import PremiumGate from '../common/PremiumGate'

const FREE_LIMIT = 3

const URGENCY_BADGE = {
  emergency: { label: 'Emergency', classes: 'bg-red-100 text-red-700' },
  urgent:    { label: 'Urgent',    classes: 'bg-orange-100 text-orange-700' },
  moderate:  { label: 'Moderate',  classes: 'bg-yellow-100 text-yellow-700' },
  low:       { label: 'Low',       classes: 'bg-green-100 text-green-700' },
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function AnalysisCard({ analysis, onClick }) {
  const badge = URGENCY_BADGE[analysis.urgency_level] || URGENCY_BADGE.moderate

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(analysis)}
      className="w-full text-left bg-white rounded-2xl p-4 border border-[#F4A261]/10 transition-colors hover:border-[#F4A261]/30"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs font-medium text-[#6B6B6B]">
          {analysis.bodyArea || analysis.body_area}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge.classes}`}
        >
          {badge.label}
        </span>
      </div>

      <p className="text-sm text-[#3D3D3D] line-clamp-2 mb-2 leading-relaxed">
        {analysis.summary}
      </p>

      <div className="flex items-center gap-1.5 text-xs text-[#9E9E9E]">
        <Clock className="w-3 h-3" aria-hidden="true" />
        <time dateTime={analysis.createdAt}>{formatDate(analysis.createdAt)}</time>
      </div>
    </motion.button>
  )
}

function PhotoGallery({ analyses = [], onSelect }) {
  const { isPremium } = usePremium()
  const prefersReducedMotion = useReducedMotion()

  // ── Empty state ──────────────────────────────────────────────────────────

  if (analyses.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#FDF8F3] flex items-center justify-center">
          <Camera className="w-7 h-7 text-[#F4A261]" aria-hidden="true" />
        </div>
        <p className="text-sm text-[#6B6B6B]">
          No photo analyses yet. Take your first photo to get started!
        </p>
      </div>
    )
  }

  // ── Split visible vs gated for free users ─────────────────────────────

  const visibleAnalyses = isPremium ? analyses : analyses.slice(0, FREE_LIMIT)
  const gatedAnalyses = isPremium ? [] : analyses.slice(FREE_LIMIT)

  const containerAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }

  return (
    <motion.section {...containerAnimation}>
      <h3
        className="text-base font-bold text-[#3D3D3D] mb-4"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        Past Analyses
      </h3>

      <div className="space-y-3">
        {visibleAnalyses.map((analysis) => (
          <AnalysisCard
            key={analysis.id}
            analysis={analysis}
            onClick={onSelect}
          />
        ))}
      </div>

      {/* Gated content for free users */}
      {gatedAnalyses.length > 0 && (
        <div className="mt-3">
          <PremiumGate
            variant="overlay"
            title="Full Analysis History"
            description="Unlock your complete photo analysis history to track patterns and share with your vet."
          >
            <div className="space-y-3">
              {gatedAnalyses.map((analysis) => (
                <AnalysisCard
                  key={analysis.id}
                  analysis={analysis}
                  onClick={onSelect}
                />
              ))}
            </div>
          </PremiumGate>
        </div>
      )}
    </motion.section>
  )
}

export default PhotoGallery
