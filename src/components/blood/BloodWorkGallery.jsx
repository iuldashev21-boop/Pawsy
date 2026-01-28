import { motion, useReducedMotion } from 'framer-motion'
import { TestTube2, Clock, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react'

const ASSESSMENT_ICON = {
  normal: { icon: CheckCircle2, color: '#66BB6A' },
  needs_attention: { icon: AlertCircle, color: '#FFCA28' },
  concerning: { icon: AlertTriangle, color: '#EF5350' },
}

const PANEL_TYPE_LABEL = {
  CBC: 'CBC',
  chemistry: 'Chemistry',
  CBC_and_chemistry: 'CBC + Chem',
  other: 'Blood Work',
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

function BloodWorkAnalysisCard({ analysis, onClick }) {
  const assessmentInfo = ASSESSMENT_ICON[analysis.overall_assessment] || ASSESSMENT_ICON.needs_attention
  const AssessmentIcon = assessmentInfo.icon
  const panelLabel = PANEL_TYPE_LABEL[analysis.detected_panel_type] || 'Blood Work'

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
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
          <TestTube2 className="w-3 h-3" aria-hidden="true" />
          {panelLabel}
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

function BloodWorkGallery({ analyses = [], onSelect }) {
  const prefersReducedMotion = useReducedMotion()

  if (analyses.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#FFEAEA] flex items-center justify-center">
          <TestTube2 className="w-7 h-7 text-[#EF5350]" aria-hidden="true" />
        </div>
        <p className="text-sm text-[#6B6B6B]">
          No blood work analyses yet. Upload your first blood panel to get started!
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
        Past Blood Work Analyses
      </h3>

      <div className="space-y-3">
        {analyses.map((analysis) => (
          <BloodWorkAnalysisCard
            key={analysis.id}
            analysis={analysis}
            onClick={onSelect}
          />
        ))}
      </div>
    </motion.section>
  )
}

export default BloodWorkGallery
