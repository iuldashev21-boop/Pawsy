import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Heart,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  MessageCircle,
  Calendar,
  Activity,
  Stethoscope,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { warmCardStyle } from '../../constants/cardStyles'

const HEALTH_SCORE_CONFIG = {
  excellent: { label: 'Excellent', color: '#66BB6A', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2 },
  good: { label: 'Good', color: '#81C784', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2 },
  fair: { label: 'Fair', color: '#FFCA28', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertCircle },
  needs_attention: { label: 'Needs Attention', color: '#FFA726', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle },
  concerning: { label: 'Concerning', color: '#EF5350', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle },
}

const CONCERN_SEVERITY_CONFIG = {
  low: { color: '#81C784', bg: 'bg-green-100' },
  moderate: { color: '#FFA726', bg: 'bg-orange-100' },
  high: { color: '#EF5350', bg: 'bg-red-100' },
  critical: { color: '#D32F2F', bg: 'bg-red-200' },
}

const PRIORITY_CONFIG = {
  routine: { label: 'Routine', color: '#81C784', bg: 'bg-green-100' },
  soon: { label: 'Soon', color: '#FFA726', bg: 'bg-orange-100' },
  urgent: { label: 'Urgent', color: '#EF5350', bg: 'bg-red-100' },
}

const CONFIDENCE_CONFIG = {
  high: { label: 'High Confidence', color: '#66BB6A' },
  medium: { label: 'Medium Confidence', color: '#FFCA28' },
  low: { label: 'Limited Data', color: '#9E9E9E' },
}

function ClinicalNarrative({ profile, onRegenerate, isRegenerating = false }) {
  const prefersReducedMotion = useReducedMotion()
  const navigate = useNavigate()

  if (!profile) return null

  const healthScore = HEALTH_SCORE_CONFIG[profile.health_score] || HEALTH_SCORE_CONFIG.good
  const HealthIcon = healthScore.icon
  const confidence = CONFIDENCE_CONFIG[profile.confidence] || CONFIDENCE_CONFIG.medium

  const animProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

  const handleDiscussWithPawsy = () => {
    navigate('/chat', {
      state: {
        clinicalProfileContext: {
          healthScore: profile.health_score,
          overview: profile.overview,
          activeConcerns: profile.active_concerns,
          recommendations: profile.recommendations,
        },
      },
    })
  }

  return (
    <motion.div {...animProps} className="space-y-4">
      {/* Health Score Header */}
      <div className={`rounded-2xl p-4 ${healthScore.bg} border ${healthScore.border}`}>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${healthScore.color}20` }}
          >
            <HealthIcon className="w-6 h-6" style={{ color: healthScore.color }} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#2D2A26] text-lg" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {healthScore.label}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${confidence.color}15`, color: confidence.color }}
              >
                {confidence.label}
              </span>
              {profile.generated_at && (
                <span className="text-xs text-[#9E9E9E] flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {new Date(profile.generated_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          {onRegenerate && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="p-2 rounded-xl hover:bg-white/50 transition-colors disabled:opacity-50"
              aria-label="Regenerate profile"
            >
              <RefreshCw
                className={`w-5 h-5 text-[#6B6B6B] ${isRegenerating ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
            </motion.button>
          )}
        </div>
      </div>

      {/* Overview */}
      <div className="rounded-2xl p-4" style={warmCardStyle}>
        <h4 className="text-sm font-bold text-[#2D2A26] mb-2 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
          <Heart className="w-4 h-4 text-[#F4A261]" aria-hidden="true" />
          Overview
        </h4>
        <p className="text-sm text-[#3D3D3D] leading-relaxed">{profile.overview}</p>
      </div>

      {/* Active Concerns */}
      {profile.active_concerns?.length > 0 && (
        <div className="rounded-2xl p-4 bg-orange-50 border border-orange-200">
          <h4 className="text-sm font-bold text-[#2D2A26] mb-3 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <AlertCircle className="w-4 h-4 text-[#FFA726]" aria-hidden="true" />
            Active Concerns
          </h4>
          <div className="space-y-3">
            {profile.active_concerns.map((concern, idx) => {
              const severityConfig = CONCERN_SEVERITY_CONFIG[concern.severity] || CONCERN_SEVERITY_CONFIG.moderate
              return (
                <div key={idx} className="bg-white/60 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-[#2D2A26]">{concern.concern}</span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${severityConfig.bg}`}
                      style={{ color: severityConfig.color }}
                    >
                      {concern.severity}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed mb-2">{concern.details}</p>
                  {concern.recommendation && (
                    <p className="text-xs text-[#5FB3B3] font-medium">{concern.recommendation}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Positive Indicators */}
      {profile.positive_indicators?.length > 0 && (
        <div className="rounded-2xl p-4 bg-green-50 border border-green-200">
          <h4 className="text-sm font-bold text-[#2D2A26] mb-3 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <CheckCircle2 className="w-4 h-4 text-[#66BB6A]" aria-hidden="true" />
            Positive Indicators
          </h4>
          <ul className="space-y-2">
            {profile.positive_indicators.map((indicator, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#66BB6A] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-[#3D3D3D] leading-relaxed">{indicator}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Diagnostics Summary */}
      {profile.recent_diagnostics_summary && (
        <div className="rounded-2xl p-4" style={warmCardStyle}>
          <h4 className="text-sm font-bold text-[#2D2A26] mb-2 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <Stethoscope className="w-4 h-4 text-[#7EC8C8]" aria-hidden="true" />
            Recent Diagnostics
          </h4>
          <p className="text-sm text-[#3D3D3D] leading-relaxed">{profile.recent_diagnostics_summary}</p>
        </div>
      )}

      {/* Chronic Management */}
      {profile.chronic_management && (
        <div className="rounded-2xl p-4" style={warmCardStyle}>
          <h4 className="text-sm font-bold text-[#2D2A26] mb-2 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <Activity className="w-4 h-4 text-[#F4A261]" aria-hidden="true" />
            Ongoing Care
          </h4>
          <p className="text-sm text-[#3D3D3D] leading-relaxed">{profile.chronic_management}</p>
        </div>
      )}

      {/* Breed Considerations */}
      {profile.breed_considerations && (
        <div className="rounded-2xl p-4" style={warmCardStyle}>
          <h4 className="text-sm font-bold text-[#2D2A26] mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Breed Considerations
          </h4>
          <p className="text-sm text-[#3D3D3D] leading-relaxed">{profile.breed_considerations}</p>
        </div>
      )}

      {/* Recommendations */}
      {profile.recommendations?.length > 0 && (
        <div className="rounded-2xl p-4" style={warmCardStyle}>
          <h4 className="text-sm font-bold text-[#2D2A26] mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Recommendations
          </h4>
          <ul className="space-y-2">
            {profile.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#7EC8C8]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-[#5FB3B3]">{idx + 1}</span>
                </div>
                <span className="text-sm text-[#3D3D3D] leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upcoming Care */}
      {profile.upcoming_care?.length > 0 && (
        <div className="rounded-2xl p-4" style={warmCardStyle}>
          <h4 className="text-sm font-bold text-[#2D2A26] mb-3 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <Calendar className="w-4 h-4 text-[#F4A261]" aria-hidden="true" />
            Upcoming Care
          </h4>
          <div className="space-y-2">
            {profile.upcoming_care.map((item, idx) => {
              const priorityConfig = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.routine
              return (
                <div key={idx} className="flex items-center justify-between p-2 bg-[#FDF8F3] rounded-xl">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-[#9E9E9E]" aria-hidden="true" />
                    <span className="text-sm text-[#3D3D3D]">{item.item}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B6B6B]">{item.timeframe}</span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityConfig.bg}`}
                      style={{ color: priorityConfig.color }}
                    >
                      {priorityConfig.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Data Quality Notes */}
      {profile.data_quality_notes && (
        <div className="rounded-xl bg-[#FDF8F3] p-3 border border-[#E8E8E8]/50">
          <p className="text-[11px] text-[#9E9E9E] leading-relaxed text-center">
            {profile.data_quality_notes}
          </p>
        </div>
      )}

      {/* Discuss with Pawsy */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDiscussWithPawsy}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-shadow"
      >
        <MessageCircle className="w-5 h-5" />
        Discuss with Pawsy
      </motion.button>

      {/* Disclaimer */}
      <div className="rounded-xl bg-[#FDF8F3] p-3 border border-[#E8E8E8]/50">
        <p className="text-[11px] text-[#9E9E9E] leading-relaxed text-center">
          This AI-generated clinical profile is for informational purposes only and is not a substitute for professional veterinary care.
          Always consult your veterinarian for medical decisions.
        </p>
      </div>
    </motion.div>
  )
}

export default ClinicalNarrative
