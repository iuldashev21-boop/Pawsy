import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ChevronRight,
  Eye,
  Stethoscope,
  FlaskConical,
  TestTube2,
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

const LAB_TYPE_CONFIG = {
  blood_work: { label: 'Blood Work', icon: TestTube2, color: '#EF5350' },
  xray: { label: 'X-Ray / Radiograph', icon: Eye, color: '#5FB3B3' },
  urinalysis: { label: 'Urinalysis', icon: FlaskConical, color: '#F4A261' },
  other: { label: 'Lab Report', icon: FileSearch, color: '#6B6B6B' },
}

const READABILITY_CONFIG = {
  clear: { label: 'Clear', color: '#66BB6A' },
  partial: { label: 'Partially Readable', color: '#FFCA28' },
  poor: { label: 'Poor Quality', color: '#EF5350' },
}

const VET_URGENCY_CONFIG = {
  immediately: { label: 'See Vet Immediately', color: '#EF5350', bg: 'bg-red-50' },
  within_24_hours: { label: 'See Vet Within 24 Hours', color: '#E65100', bg: 'bg-orange-50' },
  within_week: { label: 'Schedule Vet Visit This Week', color: '#F4A261', bg: 'bg-orange-50' },
  routine_checkup: { label: 'Discuss at Next Checkup', color: '#7EC8C8', bg: 'bg-teal-50' },
  not_required: { label: 'No Vet Visit Needed', color: '#66BB6A', bg: 'bg-green-50' },
}

function LabResult({ analysis, onReset }) {
  const prefersReducedMotion = useReducedMotion()
  const navigate = useNavigate()

  if (!analysis) return null

  const assessment = ASSESSMENT_CONFIG[analysis.overall_assessment] || ASSESSMENT_CONFIG.needs_attention
  const AssessmentIcon = assessment.icon
  const labType = LAB_TYPE_CONFIG[analysis.detected_type] || LAB_TYPE_CONFIG.other
  const LabTypeIcon = labType.icon
  const readability = READABILITY_CONFIG[analysis.readability] || READABILITY_CONFIG.partial
  const vetUrgency = VET_URGENCY_CONFIG[analysis.vet_urgency] || VET_URGENCY_CONFIG.routine_checkup

  const animProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

  const handleDiscussWithPawsy = () => {
    navigate('/chat', {
      state: {
        labContext: {
          type: analysis.detected_type,
          summary: analysis.summary,
          abnormalCount: analysis.abnormal_count,
          keyFindings: analysis.key_findings,
        },
      },
    })
  }

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
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${labType.color}15`, color: labType.color }}
              >
                <LabTypeIcon className="w-3 h-3" aria-hidden="true" />
                {labType.label}
              </span>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${readability.color}15`, color: readability.color }}
              >
                {readability.label}
              </span>
            </div>
          </div>
        </div>

        {analysis.readability_note && (
          <p className="text-xs text-[#6B6B6B] mt-2 italic">{analysis.readability_note}</p>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-2xl p-4" style={warmCardStyle}>
        <h4 className="text-sm font-bold text-[#2D2A26] mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Summary
        </h4>
        <p className="text-sm text-[#3D3D3D] leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Extracted Values Table */}
      {analysis.values?.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={warmCardStyle}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(232,221,208,0.4)' }}>
            <h4 className="text-sm font-bold text-[#2D2A26] flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <Stethoscope className="w-4 h-4 text-[#7EC8C8]" aria-hidden="true" />
              Lab Values
              {analysis.abnormal_count > 0 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  {analysis.abnormal_count} abnormal
                </span>
              )}
            </h4>
          </div>

          <div className="divide-y" style={{ borderColor: 'rgba(232,221,208,0.3)' }}>
            {analysis.values.map((val, idx) => {
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

      {/* Additional Tests */}
      {analysis.additional_tests_suggested?.length > 0 && (
        <div className="rounded-2xl p-4" style={warmCardStyle}>
          <h4 className="text-sm font-bold text-[#2D2A26] mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Additional Tests Suggested
          </h4>
          <ul className="space-y-1.5">
            {analysis.additional_tests_suggested.map((test, idx) => (
              <li key={idx} className="text-sm text-[#6B6B6B] flex items-center gap-2">
                <FlaskConical className="w-3.5 h-3.5 text-[#9E9E9E] flex-shrink-0" aria-hidden="true" />
                {test}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vet Urgency Banner */}
      {analysis.should_see_vet && (
        <div className={`rounded-2xl p-4 ${vetUrgency.bg} border`} style={{ borderColor: `${vetUrgency.color}30` }}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: vetUrgency.color }} aria-hidden="true" />
            <div>
              <p className="text-sm font-bold" style={{ color: vetUrgency.color, fontFamily: 'Nunito, sans-serif' }}>
                {vetUrgency.label}
              </p>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Bring these lab results to your veterinarian for professional review.
              </p>
            </div>
          </div>
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
          This AI interpretation is for educational purposes only and is not a substitute for professional veterinary diagnosis.
          Always consult your veterinarian for medical decisions.
        </p>
      </div>
    </motion.div>
  )
}

export default LabResult
