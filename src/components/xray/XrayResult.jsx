import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ChevronRight,
  Eye,
  Bone,
  Search,
  Camera,
} from 'lucide-react'
import { warmCardStyle } from '../../constants/cardStyles'

const IMPRESSION_CONFIG = {
  normal: { label: 'Normal', color: '#66BB6A', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2 },
  abnormal_non_urgent: { label: 'Abnormal - Non-Urgent', color: '#FFCA28', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertCircle },
  abnormal_urgent: { label: 'Abnormal - Urgent', color: '#E65100', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertTriangle },
  critical: { label: 'Critical', color: '#EF5350', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle },
}

const SIGNIFICANCE_BADGE = {
  normal: { label: 'Normal', classes: 'bg-green-100 text-green-700' },
  abnormal: { label: 'Abnormal', classes: 'bg-orange-100 text-orange-700' },
  incidental: { label: 'Incidental', classes: 'bg-blue-100 text-blue-700' },
  critical: { label: 'Critical', classes: 'bg-red-100 text-red-700' },
}

const QUALITY_CONFIG = {
  good: { label: 'Good Quality', color: '#66BB6A' },
  acceptable: { label: 'Acceptable Quality', color: '#FFCA28' },
  poor: { label: 'Poor Quality', color: '#EF5350' },
}

const CONFIDENCE_CONFIG = {
  high: { label: 'High Confidence', color: '#66BB6A' },
  medium: { label: 'Medium Confidence', color: '#FFCA28' },
  low: { label: 'Low Confidence', color: '#EF5350' },
}

function XrayResult({ analysis, onReset }) {
  const prefersReducedMotion = useReducedMotion()
  const navigate = useNavigate()

  if (!analysis) return null

  const impression = IMPRESSION_CONFIG[analysis.overall_impression] || IMPRESSION_CONFIG.normal
  const ImpressionIcon = impression.icon
  const quality = QUALITY_CONFIG[analysis.image_quality] || QUALITY_CONFIG.acceptable
  const confidence = CONFIDENCE_CONFIG[analysis.confidence] || CONFIDENCE_CONFIG.medium

  const animProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

  const handleDiscussWithPawsy = () => {
    navigate('/chat', {
      state: {
        xrayContext: {
          impression: analysis.overall_impression,
          summary: analysis.summary,
          bodyRegion: analysis.body_region,
          findings: analysis.findings,
          differentialDiagnoses: analysis.differential_diagnoses,
        },
      },
    })
  }

  // Count abnormal findings
  const abnormalCount = analysis.findings?.filter(f => f.significance !== 'normal').length || 0

  return (
    <motion.div {...animProps} className="space-y-4">
      {/* Impression Header */}
      <div className={`rounded-2xl p-4 ${impression.bg} border ${impression.border}`}>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${impression.color}20` }}
          >
            <ImpressionIcon className="w-5 h-5" style={{ color: impression.color }} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#2D2A26]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {impression.label}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {analysis.view_type && analysis.view_type !== 'unknown' && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#5FB3B315', color: '#5FB3B3' }}
                >
                  <Eye className="w-3 h-3" aria-hidden="true" />
                  {analysis.view_type.toUpperCase()} View
                </span>
              )}
              {analysis.body_region && analysis.body_region !== 'unknown' && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#7EC8C815', color: '#7EC8C8' }}
                >
                  <Bone className="w-3 h-3" aria-hidden="true" />
                  {analysis.body_region.charAt(0).toUpperCase() + analysis.body_region.slice(1)}
                </span>
              )}
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${quality.color}15`, color: quality.color }}
              >
                {quality.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl p-4" style={warmCardStyle}>
        <h4 className="text-sm font-bold text-[#2D2A26] mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Summary
        </h4>
        <p className="text-sm text-[#3D3D3D] leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Radiographic Findings */}
      {analysis.findings?.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={warmCardStyle}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(232,221,208,0.4)' }}>
            <h4 className="text-sm font-bold text-[#2D2A26] flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <Search className="w-4 h-4 text-[#7EC8C8]" aria-hidden="true" />
              Radiographic Findings
              {abnormalCount > 0 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  {abnormalCount} abnormal
                </span>
              )}
            </h4>
          </div>

          <div className="divide-y" style={{ borderColor: 'rgba(232,221,208,0.3)' }}>
            {analysis.findings.map((finding, idx) => {
              const badge = SIGNIFICANCE_BADGE[finding.significance] || SIGNIFICANCE_BADGE.normal
              const isAbnormal = finding.significance !== 'normal'
              return (
                <div
                  key={idx}
                  className="px-4 py-3"
                  style={isAbnormal ? { backgroundColor: finding.significance === 'critical' ? 'rgba(239,83,80,0.04)' : 'rgba(255,202,40,0.04)' } : {}}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#2D2A26]">{finding.structure}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.classes}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-sm text-[#3D3D3D] leading-relaxed">{finding.observation}</p>
                  {finding.location && (
                    <p className="text-xs text-[#9E9E9E] mt-1">Location: {finding.location}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Assessment Cards */}
      <div className="grid grid-cols-1 gap-3">
        {analysis.bone_assessment && (
          <div className="rounded-2xl p-4" style={warmCardStyle}>
            <h4 className="text-sm font-bold text-[#2D2A26] mb-2 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <Bone className="w-4 h-4 text-[#7EC8C8]" aria-hidden="true" />
              Bone Assessment
            </h4>
            <p className="text-sm text-[#3D3D3D] leading-relaxed">{analysis.bone_assessment}</p>
          </div>
        )}

        {analysis.soft_tissue_assessment && (
          <div className="rounded-2xl p-4" style={warmCardStyle}>
            <h4 className="text-sm font-bold text-[#2D2A26] mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Soft Tissue Assessment
            </h4>
            <p className="text-sm text-[#3D3D3D] leading-relaxed">{analysis.soft_tissue_assessment}</p>
          </div>
        )}

        {analysis.joint_assessment && (
          <div className="rounded-2xl p-4" style={warmCardStyle}>
            <h4 className="text-sm font-bold text-[#2D2A26] mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Joint Assessment
            </h4>
            <p className="text-sm text-[#3D3D3D] leading-relaxed">{analysis.joint_assessment}</p>
          </div>
        )}
      </div>

      {/* Foreign Body Alert */}
      {analysis.foreign_body_detected && (
        <div className="rounded-2xl p-4 bg-red-50 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#EF5350] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h4 className="text-sm font-bold text-[#EF5350]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Foreign Body Detected
              </h4>
              {analysis.foreign_body_description && (
                <p className="text-sm text-[#3D3D3D] mt-1">{analysis.foreign_body_description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Differential Diagnoses */}
      {analysis.differential_diagnoses?.length > 0 && (
        <div className="rounded-2xl p-4" style={warmCardStyle}>
          <h4 className="text-sm font-bold text-[#2D2A26] mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Differential Diagnoses
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.differential_diagnoses.map((diagnosis, idx) => (
              <span
                key={idx}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#FFF5ED] text-[#E8924F] border border-[#F4A261]/20"
              >
                {diagnosis}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Views Suggested */}
      {analysis.additional_views_suggested?.length > 0 && (
        <div className="rounded-2xl p-4" style={warmCardStyle}>
          <h4 className="text-sm font-bold text-[#2D2A26] mb-3 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <Camera className="w-4 h-4 text-[#7EC8C8]" aria-hidden="true" />
            Additional Views Suggested
          </h4>
          <ul className="space-y-2">
            {analysis.additional_views_suggested.map((view, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-[#7EC8C8] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-[#3D3D3D] leading-relaxed">{view}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Actions */}
      {analysis.recommended_actions?.length > 0 && (
        <div className="rounded-2xl p-4" style={warmCardStyle}>
          <h4 className="text-sm font-bold text-[#2D2A26] mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Recommended Actions
          </h4>
          <ul className="space-y-2">
            {analysis.recommended_actions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#7EC8C8]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-[#5FB3B3]">{idx + 1}</span>
                </div>
                <span className="text-sm text-[#3D3D3D] leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confidence Badge */}
      <div className="flex justify-center">
        <span
          className="text-xs font-medium px-3 py-1 rounded-full"
          style={{ backgroundColor: `${confidence.color}15`, color: confidence.color }}
        >
          {confidence.label}
        </span>
      </div>

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
          This AI radiograph interpretation is for educational purposes only and is not a substitute for professional veterinary radiologist review.
          Always consult your veterinarian for medical decisions.
        </p>
      </div>
    </motion.div>
  )
}

export default XrayResult
