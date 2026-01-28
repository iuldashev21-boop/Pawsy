import { motion, useReducedMotion } from 'framer-motion'
import { FileSearch, Clock, TestTube2, Eye, FlaskConical, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react'

const LAB_TYPE_BADGE = {
  blood_work: { label: 'Blood Work', icon: TestTube2, classes: 'bg-red-100 text-red-700' },
  xray: { label: 'X-Ray', icon: Eye, classes: 'bg-teal-100 text-teal-700' },
  urinalysis: { label: 'Urinalysis', icon: FlaskConical, classes: 'bg-orange-100 text-orange-700' },
  other: { label: 'Lab Report', icon: FileSearch, classes: 'bg-gray-100 text-gray-700' },
}

const ASSESSMENT_ICON = {
  normal: { icon: CheckCircle2, color: '#66BB6A' },
  needs_attention: { icon: AlertCircle, color: '#FFCA28' },
  concerning: { icon: AlertTriangle, color: '#EF5350' },
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

function LabAnalysisCard({ analysis, onClick }) {
  const typeBadge = LAB_TYPE_BADGE[analysis.detected_type] || LAB_TYPE_BADGE.other
  const TypeIcon = typeBadge.icon
  const assessmentInfo = ASSESSMENT_ICON[analysis.overall_assessment] || ASSESSMENT_ICON.needs_attention
  const AssessmentIcon = assessmentInfo.icon

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(analysis)}
      className="w-full text-left bg-white rounded-2xl p-4 border border-[#7EC8C8]/10 transition-colors hover:border-[#7EC8C8]/30"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${typeBadge.classes}`}>
          <TypeIcon className="w-3 h-3" aria-hidden="true" />
          {typeBadge.label}
        </span>
        <AssessmentIcon className="w-4 h-4 flex-shrink-0" style={{ color: assessmentInfo.color }} aria-hidden="true" />
      </div>

      <p className="text-sm text-[#3D3D3D] line-clamp-2 mb-2 leading-relaxed">
        {analysis.summary}
      </p>

      <div className="flex items-center gap-1.5 text-xs text-[#9E9E9E]">
        <Clock className="w-3 h-3" aria-hidden="true" />
        <time dateTime={analysis.createdAt}>{formatDate(analysis.createdAt)}</time>
        {analysis.abnormal_count > 0 && (
          <>
            <span>&bull;</span>
            <span className="text-[#EF5350] font-medium">{analysis.abnormal_count} abnormal</span>
          </>
        )}
      </div>
    </motion.button>
  )
}

function LabGallery({ analyses = [], onSelect }) {
  const prefersReducedMotion = useReducedMotion()

  if (analyses.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#E0F2F2] flex items-center justify-center">
          <FileSearch className="w-7 h-7 text-[#5FB3B3]" aria-hidden="true" />
        </div>
        <p className="text-sm text-[#6B6B6B]">
          No lab analyses yet. Upload your first lab report to get started!
        </p>
      </div>
    )
  }

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
        {analyses.map((analysis) => (
          <LabAnalysisCard
            key={analysis.id}
            analysis={analysis}
            onClick={onSelect}
          />
        ))}
      </div>
    </motion.section>
  )
}

export default LabGallery
