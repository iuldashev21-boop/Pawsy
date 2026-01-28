import { motion, useReducedMotion } from 'framer-motion'
import { Eye, Clock, AlertTriangle, CheckCircle2, AlertCircle, Bone } from 'lucide-react'

const IMPRESSION_ICON = {
  normal: { icon: CheckCircle2, color: '#66BB6A' },
  abnormal_non_urgent: { icon: AlertCircle, color: '#FFCA28' },
  abnormal_urgent: { icon: AlertTriangle, color: '#E65100' },
  critical: { icon: AlertTriangle, color: '#EF5350' },
}

const BODY_REGION_LABEL = {
  thorax: 'Chest',
  abdomen: 'Abdomen',
  skull: 'Head',
  spine: 'Spine',
  pelvis: 'Pelvis',
  limb: 'Limb',
  whole_body: 'Full Body',
  unknown: 'X-Ray',
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

function XrayAnalysisCard({ analysis, onClick }) {
  const impressionInfo = IMPRESSION_ICON[analysis.overall_impression] || IMPRESSION_ICON.normal
  const ImpressionIcon = impressionInfo.icon
  const regionLabel = BODY_REGION_LABEL[analysis.body_region] || 'X-Ray'

  // Count abnormal findings
  const abnormalCount = analysis.findings?.filter(f => f.significance !== 'normal').length || 0

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
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
          <Bone className="w-3 h-3" aria-hidden="true" />
          {regionLabel}
        </span>
        <ImpressionIcon className="w-4 h-4 flex-shrink-0" style={{ color: impressionInfo.color }} aria-hidden="true" />
      </div>

      <p className="text-sm text-[#3D3D3D] line-clamp-2 mb-2 leading-relaxed">
        {analysis.summary}
      </p>

      <div className="flex items-center gap-1.5 text-xs text-[#9E9E9E]">
        <Clock className="w-3 h-3" aria-hidden="true" />
        <time dateTime={analysis.createdAt}>{formatDate(analysis.createdAt)}</time>
        {analysis.view_type && analysis.view_type !== 'unknown' && (
          <>
            <span>&bull;</span>
            <span className="text-[#7EC8C8]">{analysis.view_type.toUpperCase()}</span>
          </>
        )}
        {abnormalCount > 0 && (
          <>
            <span>&bull;</span>
            <span className="text-[#EF5350] font-medium">{abnormalCount} abnormal</span>
          </>
        )}
      </div>
    </motion.button>
  )
}

function XrayGallery({ analyses = [], onSelect }) {
  const prefersReducedMotion = useReducedMotion()

  if (analyses.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#E0F2F2] flex items-center justify-center">
          <Eye className="w-7 h-7 text-[#5FB3B3]" aria-hidden="true" />
        </div>
        <p className="text-sm text-[#6B6B6B]">
          No X-ray analyses yet. Upload your first radiograph to get started!
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
        Past X-Ray Analyses
      </h3>

      <div className="space-y-3">
        {analyses.map((analysis) => (
          <XrayAnalysisCard
            key={analysis.id}
            analysis={analysis}
            onClick={onSelect}
          />
        ))}
      </div>
    </motion.section>
  )
}

export default XrayGallery
