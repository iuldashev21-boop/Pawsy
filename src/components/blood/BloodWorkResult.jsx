import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ChevronRight,
  TestTube2,
  Activity,
  Pill,
  Heart,
  Droplet,
} from 'lucide-react'
import { warmCardStyle } from '../../constants/cardStyles'

const ASSESSMENT_CONFIG = {
  normal: { label: 'Normal', color: '#66BB6A', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2 },
  needs_attention: { label: 'Needs Attention', color: '#FFCA28', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertCircle },
  concerning: { label: 'Concerning', color: '#EF5350', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle },
}

const STATUS_BADGE = {
  normal: { label: 'Normal', classes: 'bg-green-100 text-green-700' },
  high: { label: 'High', classes: 'bg-orange-100 text-orange-700' },
  low: { label: 'Low', classes: 'bg-blue-100 text-blue-700' },
  critical: { label: 'Critical', classes: 'bg-red-100 text-red-700' },
}

const ORGAN_SYSTEM_CONFIG = {
  RBC: { label: 'Red Blood Cells', icon: Droplet, color: '#EF5350' },
  WBC: { label: 'White Blood Cells', icon: Activity, color: '#7EC8C8' },
  liver: { label: 'Liver Function', icon: Heart, color: '#F4A261' },
  kidney: { label: 'Kidney Function', icon: Droplet, color: '#5FB3B3' },
  electrolytes: { label: 'Electrolytes', icon: Activity, color: '#FFCA28' },
  other: { label: 'Other Markers', icon: TestTube2, color: '#9E9E9E' },
}

const ORGAN_STATUS_CONFIG = {
  normal: { label: 'Normal', color: '#66BB6A', bg: 'bg-green-50' },
  needs_attention: { label: 'Needs Attention', color: '#FFCA28', bg: 'bg-yellow-50' },
  concerning: { label: 'Concerning', color: '#EF5350', bg: 'bg-red-50' },
}

const PANEL_TYPE_CONFIG = {
  CBC: { label: 'Complete Blood Count (CBC)', color: '#EF5350' },
  chemistry: { label: 'Chemistry Panel', color: '#5FB3B3' },
  CBC_and_chemistry: { label: 'CBC + Chemistry', color: '#7EC8C8' },
  other: { label: 'Blood Work Panel', color: '#9E9E9E' },
}

const CONFIDENCE_CONFIG = {
  high: { label: 'High Confidence', color: '#66BB6A' },
  medium: { label: 'Medium Confidence', color: '#FFCA28' },
  low: { label: 'Low Confidence', color: '#EF5350' },
}

function BloodWorkResult({ analysis, onReset }) {
  const prefersReducedMotion = useReducedMotion()
  const navigate = useNavigate()

  if (!analysis) return null

  const assessment = ASSESSMENT_CONFIG[analysis.overall_assessment] || ASSESSMENT_CONFIG.needs_attention
  const AssessmentIcon = assessment.icon
  const panelType = PANEL_TYPE_CONFIG[analysis.detected_panel_type] || PANEL_TYPE_CONFIG.other
  const confidence = CONFIDENCE_CONFIG[analysis.confidence] || CONFIDENCE_CONFIG.medium

  const animProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

  const handleDiscussWithPawsy = () => {
    navigate('/chat', {
      state: {
        bloodWorkContext: {
          assessment: analysis.overall_assessment,
          summary: analysis.summary,
          abnormalCount: analysis.abnormal_count,
          keyFindings: analysis.key_findings,
          organSummary: analysis.organ_system_summary,
        },
      },
    })
  }

  // Group values by category
  const valuesByCategory = (analysis.values || []).reduce((acc, val) => {
    const cat = val.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(val)
    return acc
  }, {})

  const categoryOrder = ['RBC', 'WBC', 'liver', 'kidney', 'electrolytes', 'other']

  return (
    <motion.div {...animProps} className="space-y-4">
      {/* Assessment Header */}
      <div className={`rounded-2xl p-4 ${assessment.bg} border ${assessment.border}`}>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${assessment.color}20` }}
          >
            <AssessmentIcon className="w-5 h-5" style={{ color: assessment.color }} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#2D2A26]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {assessment.label}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${panelType.color}15`, color: panelType.color }}
              >
                <TestTube2 className="w-3 h-3" aria-hidden="true" />
                {panelType.label}
              </span>
              {analysis.abnormal_count > 0 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  {analysis.abnormal_count} abnormal values
                </span>
              )}
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

      {/* Organ System Summary Cards */}
      {analysis.organ_system_summary?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-[#2D2A26] px-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Organ System Overview
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {analysis.organ_system_summary.map((organ, idx) => {
              const statusConfig = ORGAN_STATUS_CONFIG[organ.status] || ORGAN_STATUS_CONFIG.normal
              const organConfig = Object.values(ORGAN_SYSTEM_CONFIG).find(
                c => c.label.toLowerCase().includes(organ.system.toLowerCase())
              ) || ORGAN_SYSTEM_CONFIG.other
              const OrganIcon = organConfig.icon

              return (
                <div
                  key={idx}
                  className={`rounded-xl p-3 ${statusConfig.bg} border`}
                  style={{ borderColor: `${statusConfig.color}30` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <OrganIcon className="w-4 h-4" style={{ color: organConfig.color }} aria-hidden="true" />
                    <span className="text-xs font-bold text-[#2D2A26]">{organ.system}</span>
                  </div>
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: statusConfig.color }}
                  >
                    {statusConfig.label}
                  </span>
                  {organ.notes && (
                    <p className="text-[10px] text-[#6B6B6B] mt-1 line-clamp-2">{organ.notes}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Lab Values by Category */}
      {Object.keys(valuesByCategory).length > 0 && (
        <div className="space-y-3">
          {categoryOrder.map((cat) => {
            const values = valuesByCategory[cat]
            if (!values || values.length === 0) return null

            const catConfig = ORGAN_SYSTEM_CONFIG[cat] || ORGAN_SYSTEM_CONFIG.other
            const CatIcon = catConfig.icon
            const abnormalInCategory = values.filter(v => v.status !== 'normal').length

            return (
              <div key={cat} className="rounded-2xl overflow-hidden" style={warmCardStyle}>
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(232,221,208,0.4)' }}>
                  <h4 className="text-sm font-bold text-[#2D2A26] flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    <CatIcon className="w-4 h-4" style={{ color: catConfig.color }} aria-hidden="true" />
                    {catConfig.label}
                  </h4>
                  {abnormalInCategory > 0 && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                      {abnormalInCategory} abnormal
                    </span>
                  )}
                </div>

                <div className="divide-y" style={{ borderColor: 'rgba(232,221,208,0.3)' }}>
                  {values.map((val, idx) => {
                    const badge = STATUS_BADGE[val.status] || STATUS_BADGE.normal
                    const isAbnormal = val.status !== 'normal'
                    return (
                      <div
                        key={idx}
                        className="px-4 py-3"
                        style={isAbnormal ? { backgroundColor: val.status === 'critical' ? 'rgba(239,83,80,0.04)' : 'rgba(255,202,40,0.04)' } : {}}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[#2D2A26]">{val.name}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.classes}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                          <span className="font-semibold text-[#3D3D3D]">
                            {val.value}{val.unit ? ` ${val.unit}` : ''}
                          </span>
                          {val.reference_range && (
                            <>
                              <span className="text-[#9E9E9E]">&bull;</span>
                              <span>Ref: {val.reference_range}</span>
                            </>
                          )}
                        </div>
                        {val.interpretation && (
                          <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">{val.interpretation}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Medication Interactions */}
      {analysis.medication_interactions?.length > 0 && (
        <div className="rounded-2xl p-4 bg-amber-50 border border-amber-200">
          <h4 className="text-sm font-bold text-[#2D2A26] mb-3 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <Pill className="w-4 h-4 text-amber-600" aria-hidden="true" />
            Medication Interactions
          </h4>
          <ul className="space-y-2">
            {analysis.medication_interactions.map((interaction, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-[#3D3D3D] leading-relaxed">{interaction}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Findings */}
      {analysis.key_findings?.length > 0 && (
        <div className="rounded-2xl p-4" style={warmCardStyle}>
          <h4 className="text-sm font-bold text-[#2D2A26] mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Key Findings
          </h4>
          <ul className="space-y-2">
            {analysis.key_findings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-[#F4A261] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-[#3D3D3D] leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Possible Conditions */}
      {analysis.possible_conditions?.length > 0 && (
        <div className="rounded-2xl p-4" style={warmCardStyle}>
          <h4 className="text-sm font-bold text-[#2D2A26] mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Possible Conditions
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.possible_conditions.map((condition, idx) => (
              <span
                key={idx}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#FFF5ED] text-[#E8924F] border border-[#F4A261]/20"
              >
                {condition}
              </span>
            ))}
          </div>
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
          This AI blood work interpretation is for educational purposes only and is not a substitute for professional veterinary review.
          Always consult your veterinarian for medical decisions.
        </p>
      </div>
    </motion.div>
  )
}

export default BloodWorkResult
