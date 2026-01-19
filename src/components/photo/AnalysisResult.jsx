import { motion } from 'framer-motion'
import {
  AlertTriangle, CheckCircle, AlertCircle, Clock,
  Stethoscope, MessageCircle, ChevronRight
} from 'lucide-react'
import { Link } from 'react-router-dom'

const severityConfig = {
  low: {
    color: 'text-[#81C784]',
    bg: 'bg-[#81C784]/10',
    border: 'border-[#81C784]/30',
    icon: CheckCircle,
    label: 'Low Concern',
  },
  medium: {
    color: 'text-[#FFD54F]',
    bg: 'bg-[#FFD54F]/10',
    border: 'border-[#FFD54F]/30',
    icon: AlertCircle,
    label: 'Moderate Concern',
  },
  high: {
    color: 'text-[#F4A261]',
    bg: 'bg-[#F4A261]/10',
    border: 'border-[#F4A261]/30',
    icon: AlertTriangle,
    label: 'High Concern',
  },
  urgent: {
    color: 'text-[#EF5350]',
    bg: 'bg-[#EF5350]/10',
    border: 'border-[#EF5350]/30',
    icon: AlertTriangle,
    label: 'Urgent - See Vet',
  },
}

const urgencyConfig = {
  routine: { label: 'Routine checkup recommended', icon: Clock },
  soon: { label: 'Schedule vet visit soon', icon: Clock },
  urgent: { label: 'See vet within 24-48 hours', icon: Stethoscope },
  emergency: { label: 'Seek emergency care immediately', icon: AlertTriangle },
}

function AnalysisResult({ analysis, imageUrl }) {
  const severity = severityConfig[analysis.severity] || severityConfig.medium
  const urgency = urgencyConfig[analysis.urgency] || urgencyConfig.routine
  const SeverityIcon = severity.icon
  const UrgencyIcon = urgency.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Image preview */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-[#E8E8E8] shadow-md">
        <img
          src={imageUrl}
          alt="Analyzed photo"
          className="w-full h-48 object-cover"
        />
        <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full ${severity.bg} ${severity.border} border flex items-center gap-1.5`}>
          <SeverityIcon className={`w-4 h-4 ${severity.color}`} />
          <span className={`text-xs font-semibold ${severity.color}`}>{severity.label}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-[#F4A261]/10">
        <h3
          className="text-lg font-bold text-[#3D3D3D] mb-2"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Analysis Summary
        </h3>
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          {analysis.summary}
        </p>
      </div>

      {/* Possible conditions */}
      {analysis.possibleConditions && analysis.possibleConditions.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-md border border-[#F4A261]/10">
          <h3
            className="text-sm font-bold text-[#3D3D3D] mb-3"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Possible Conditions
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.possibleConditions.map((condition, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-[#FDF8F3] text-[#6B6B6B] text-sm rounded-full border border-[#E8E8E8]"
              >
                {condition}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-md border border-[#F4A261]/10">
          <h3
            className="text-sm font-bold text-[#3D3D3D] mb-3"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Recommendations
          </h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-[#6B6B6B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7EC8C8] mt-2 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Urgency banner */}
      <div className={`rounded-2xl p-4 ${severity.bg} ${severity.border} border flex items-center gap-3`}>
        <div className={`w-10 h-10 rounded-full ${severity.bg} flex items-center justify-center`}>
          <UrgencyIcon className={`w-5 h-5 ${severity.color}`} />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${severity.color}`}>
            {urgency.label}
          </p>
          {analysis.shouldSeeVet && (
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Professional evaluation recommended
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/chat" className="flex-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] text-white font-semibold rounded-xl shadow-md"
          >
            <MessageCircle className="w-5 h-5" />
            Discuss with Pawsy
          </motion.button>
        </Link>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-[#9E9E9E] text-center px-4">
        This analysis is for informational purposes only and should not replace professional veterinary advice.
      </p>
    </motion.div>
  )
}

export default AnalysisResult
