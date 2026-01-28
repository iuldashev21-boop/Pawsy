import { motion, useReducedMotion } from 'framer-motion'
import {
  FileText,
  Copy,
  Share2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Pill,
  Stethoscope,
  FileSearch,
  ClipboardList,
  RefreshCw,
} from 'lucide-react'
import { warmCardStyle } from '../../constants/cardStyles'

const PROBLEM_STATUS_CONFIG = {
  active: { label: 'Active', color: '#EF5350', bg: 'bg-red-100' },
  stable: { label: 'Stable', color: '#66BB6A', bg: 'bg-green-100' },
  improving: { label: 'Improving', color: '#81C784', bg: 'bg-green-100' },
  worsening: { label: 'Worsening', color: '#FFA726', bg: 'bg-orange-100' },
  resolved: { label: 'Resolved', color: '#9E9E9E', bg: 'bg-gray-100' },
}

function VetReportPreview({ report, onRegenerate, isRegenerating = false, onCopy, onShare }) {
  const prefersReducedMotion = useReducedMotion()

  if (!report) return null

  const animProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

  const handleCopyToClipboard = async () => {
    const reportText = formatReportAsText(report)
    try {
      await navigator.clipboard.writeText(reportText)
      onCopy?.()
    } catch (err) {
      console.error('Failed to copy report:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Veterinary Report - ${report.patient_header?.name}`,
          text: formatReportAsText(report),
        })
        onShare?.()
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to share:', err)
        }
      }
    } else {
      handleCopyToClipboard()
    }
  }

  return (
    <motion.div {...animProps} className="space-y-4">
      {/* Report Header */}
      <div className="rounded-2xl p-4 bg-[#FDF8F3] border border-[#E8E8E8]/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7EC8C8]/20 to-[#5FB3B3]/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#5FB3B3]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-[#2D2A26]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Veterinary Report
              </h3>
              <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                <Clock className="w-3 h-3" aria-hidden="true" />
                <span>Generated {new Date(report.generated_at || report.report_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRegenerate && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="p-2 rounded-xl hover:bg-[#7EC8C8]/10 transition-colors disabled:opacity-50"
                aria-label="Regenerate report"
              >
                <RefreshCw
                  className={`w-5 h-5 text-[#6B6B6B] ${isRegenerating ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
              </motion.button>
            )}
          </div>
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[#9E9E9E]">Patient: </span>
            <span className="text-[#3D3D3D] font-medium">{report.patient_header?.name}</span>
          </div>
          <div>
            <span className="text-[#9E9E9E]">Species: </span>
            <span className="text-[#3D3D3D]">{report.patient_header?.species}</span>
          </div>
          <div>
            <span className="text-[#9E9E9E]">Breed: </span>
            <span className="text-[#3D3D3D]">{report.patient_header?.breed}</span>
          </div>
          <div>
            <span className="text-[#9E9E9E]">Age: </span>
            <span className="text-[#3D3D3D]">{report.patient_header?.age}</span>
          </div>
          <div>
            <span className="text-[#9E9E9E]">Weight: </span>
            <span className="text-[#3D3D3D]">{report.patient_header?.weight}</span>
          </div>
          <div>
            <span className="text-[#9E9E9E]">Sex: </span>
            <span className="text-[#3D3D3D]">{report.patient_header?.sex}</span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-[#E8E8E8]/50">
          <span className="text-xs text-[#9E9E9E]">Report Period: </span>
          <span className="text-xs text-[#3D3D3D]">{report.report_period}</span>
        </div>
      </div>

      {/* SUBJECTIVE Section */}
      <div className="rounded-2xl p-4" style={warmCardStyle}>
        <h4 className="text-sm font-bold text-[#2D2A26] mb-3 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
          <span className="w-6 h-6 rounded-lg bg-[#F4A261]/20 flex items-center justify-center text-[#F4A261] text-xs font-bold">S</span>
          Subjective
        </h4>

        {report.subjective?.chief_concerns?.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-[#6B6B6B] mb-1">Chief Concerns:</p>
            <ul className="text-sm text-[#3D3D3D] space-y-1">
              {report.subjective.chief_concerns.map((concern, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertCircle className="w-3 h-3 text-[#F4A261] mt-1 flex-shrink-0" aria-hidden="true" />
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.subjective?.history && (
          <div className="mb-3">
            <p className="text-xs font-medium text-[#6B6B6B] mb-1">History:</p>
            <p className="text-sm text-[#3D3D3D] leading-relaxed">{report.subjective.history}</p>
          </div>
        )}

        {report.subjective?.behavioral_notes && (
          <div>
            <p className="text-xs font-medium text-[#6B6B6B] mb-1">Behavioral Notes:</p>
            <p className="text-sm text-[#3D3D3D] leading-relaxed">{report.subjective.behavioral_notes}</p>
          </div>
        )}
      </div>

      {/* OBJECTIVE Section */}
      <div className="rounded-2xl p-4" style={warmCardStyle}>
        <h4 className="text-sm font-bold text-[#2D2A26] mb-3 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
          <span className="w-6 h-6 rounded-lg bg-[#7EC8C8]/20 flex items-center justify-center text-[#5FB3B3] text-xs font-bold">O</span>
          Objective
        </h4>

        {/* Current Medications */}
        {report.objective?.current_medications?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-[#6B6B6B] mb-2 flex items-center gap-1">
              <Pill className="w-3 h-3" aria-hidden="true" />
              Current Medications:
            </p>
            <div className="space-y-2">
              {report.objective.current_medications.map((med, idx) => (
                <div key={idx} className="bg-[#FDF8F3] rounded-lg p-2">
                  <p className="text-sm font-medium text-[#2D2A26]">{med.medication}</p>
                  <p className="text-xs text-[#6B6B6B]">{med.dosage}</p>
                  {med.indication && <p className="text-xs text-[#9E9E9E] italic">{med.indication}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Laboratory Findings */}
        {report.objective?.laboratory_findings?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-[#6B6B6B] mb-2 flex items-center gap-1">
              <Stethoscope className="w-3 h-3" aria-hidden="true" />
              Laboratory Findings:
            </p>
            <div className="space-y-2">
              {report.objective.laboratory_findings.map((lab, idx) => (
                <div key={idx} className="bg-[#FDF8F3] rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-[#2D2A26]">{lab.test_type}</p>
                    <p className="text-[10px] text-[#9E9E9E]">{lab.test_date}</p>
                  </div>
                  <p className="text-xs text-[#3D3D3D]">{lab.summary}</p>
                  {lab.abnormal_values?.length > 0 && (
                    <p className="text-xs text-[#EF5350] mt-1">Abnormal: {lab.abnormal_values.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Imaging Findings */}
        {report.objective?.imaging_findings?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-[#6B6B6B] mb-2 flex items-center gap-1">
              <FileSearch className="w-3 h-3" aria-hidden="true" />
              Imaging Findings:
            </p>
            <div className="space-y-2">
              {report.objective.imaging_findings.map((img, idx) => (
                <div key={idx} className="bg-[#FDF8F3] rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-[#2D2A26]">{img.study_type} - {img.body_region}</p>
                    <p className="text-[10px] text-[#9E9E9E]">{img.study_date}</p>
                  </div>
                  <p className="text-xs text-[#3D3D3D]">{img.findings}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Allergies */}
        <div>
          <p className="text-xs font-medium text-[#6B6B6B] mb-1">Allergies:</p>
          <p className="text-sm text-[#3D3D3D]">
            {report.objective?.allergies?.length > 0
              ? report.objective.allergies.join(', ')
              : 'NKDA (No Known Drug Allergies)'}
          </p>
        </div>
      </div>

      {/* ASSESSMENT Section */}
      <div className="rounded-2xl p-4" style={warmCardStyle}>
        <h4 className="text-sm font-bold text-[#2D2A26] mb-3 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
          <span className="w-6 h-6 rounded-lg bg-[#FFCA28]/20 flex items-center justify-center text-[#F4A261] text-xs font-bold">A</span>
          Assessment
        </h4>

        {/* Problem List */}
        {report.assessment?.problem_list?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-[#6B6B6B] mb-2 flex items-center gap-1">
              <ClipboardList className="w-3 h-3" aria-hidden="true" />
              Problem List:
            </p>
            <div className="space-y-2">
              {report.assessment.problem_list.map((problem, idx) => {
                const statusConfig = PROBLEM_STATUS_CONFIG[problem.status] || PROBLEM_STATUS_CONFIG.active
                return (
                  <div key={idx} className="flex items-center justify-between bg-[#FDF8F3] rounded-lg p-2">
                    <div>
                      <p className="text-sm font-medium text-[#2D2A26]">{problem.problem}</p>
                      {problem.onset && <p className="text-xs text-[#9E9E9E]">Onset: {problem.onset}</p>}
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig.bg}`}
                      style={{ color: statusConfig.color }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Clinical Impression */}
        {report.assessment?.clinical_impression && (
          <div className="mb-3">
            <p className="text-xs font-medium text-[#6B6B6B] mb-1">Clinical Impression:</p>
            <p className="text-sm text-[#3D3D3D] leading-relaxed">{report.assessment.clinical_impression}</p>
          </div>
        )}

        {/* Differentials */}
        {report.assessment?.differentials?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[#6B6B6B] mb-1">Differentials:</p>
            <div className="flex flex-wrap gap-2">
              {report.assessment.differentials.map((diff, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded-full bg-[#FFF5ED] text-[#E8924F] border border-[#F4A261]/20"
                >
                  {diff}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PLAN Section */}
      <div className="rounded-2xl p-4" style={warmCardStyle}>
        <h4 className="text-sm font-bold text-[#2D2A26] mb-3 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
          <span className="w-6 h-6 rounded-lg bg-[#66BB6A]/20 flex items-center justify-center text-[#66BB6A] text-xs font-bold">P</span>
          Plan
        </h4>

        {report.plan?.follow_up?.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-[#6B6B6B] mb-1">Follow-up:</p>
            <ul className="text-sm text-[#3D3D3D] space-y-1">
              {report.plan.follow_up.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[#66BB6A] mt-1 flex-shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.plan?.monitoring?.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-[#6B6B6B] mb-1">Monitoring:</p>
            <ul className="text-sm text-[#3D3D3D] space-y-1">
              {report.plan.monitoring.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[#7EC8C8] mt-1 flex-shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.plan?.owner_instructions?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[#6B6B6B] mb-1">Owner Instructions:</p>
            <ul className="text-sm text-[#3D3D3D] space-y-1">
              {report.plan.owner_instructions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[#F4A261] mt-1 flex-shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Data Sources */}
      {report.data_sources?.length > 0 && (
        <div className="rounded-xl bg-[#FDF8F3] p-3 border border-[#E8E8E8]/50">
          <p className="text-xs font-medium text-[#6B6B6B] mb-1">Data Sources:</p>
          <ul className="text-[11px] text-[#9E9E9E] space-y-0.5">
            {report.data_sources.map((source, idx) => (
              <li key={idx}>&bull; {source}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopyToClipboard}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-[#7EC8C8]/30 text-[#5FB3B3] font-bold rounded-xl hover:bg-[#7EC8C8]/5 transition-colors"
        >
          <Copy className="w-5 h-5" />
          Copy Report
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <Share2 className="w-5 h-5" />
          Share
        </motion.button>
      </div>

      {/* AI Disclaimer */}
      <div className="rounded-xl bg-[#FDF8F3] p-3 border border-[#E8E8E8]/50">
        <p className="text-[11px] text-[#9E9E9E] leading-relaxed text-center">
          {report.ai_disclosure || 'This report was generated by AI and is intended for informational purposes only. It is not a substitute for professional veterinary examination and diagnosis.'}
        </p>
      </div>
    </motion.div>
  )
}

function formatReportAsText(report) {
  const lines = []

  lines.push('VETERINARY REPORT')
  lines.push('='.repeat(50))
  lines.push('')

  // Patient Header
  lines.push('PATIENT INFORMATION')
  lines.push('-'.repeat(30))
  const ph = report.patient_header || {}
  lines.push(`Patient: ${ph.name || 'Unknown'}`)
  lines.push(`Species: ${ph.species || 'Canine'}`)
  lines.push(`Breed: ${ph.breed || 'Unknown'}`)
  lines.push(`Age: ${ph.age || 'Unknown'}`)
  lines.push(`Weight: ${ph.weight || 'Not recorded'}`)
  lines.push(`Sex: ${ph.sex || 'Unknown'}`)
  lines.push(`Report Period: ${report.report_period || 'N/A'}`)
  lines.push(`Generated: ${new Date(report.generated_at || report.report_date).toLocaleDateString()}`)
  lines.push('')

  // Subjective
  lines.push('SUBJECTIVE')
  lines.push('-'.repeat(30))
  if (report.subjective?.chief_concerns?.length > 0) {
    lines.push('Chief Concerns:')
    report.subjective.chief_concerns.forEach(c => lines.push(`  - ${c}`))
  }
  if (report.subjective?.history) {
    lines.push(`\nHistory: ${report.subjective.history}`)
  }
  if (report.subjective?.behavioral_notes) {
    lines.push(`\nBehavioral Notes: ${report.subjective.behavioral_notes}`)
  }
  lines.push('')

  // Objective
  lines.push('OBJECTIVE')
  lines.push('-'.repeat(30))
  if (report.objective?.current_medications?.length > 0) {
    lines.push('Current Medications:')
    report.objective.current_medications.forEach(m => {
      lines.push(`  - ${m.medication}: ${m.dosage}`)
    })
  }
  if (report.objective?.laboratory_findings?.length > 0) {
    lines.push('\nLaboratory Findings:')
    report.objective.laboratory_findings.forEach(l => {
      lines.push(`  - ${l.test_date}: ${l.test_type} - ${l.summary}`)
    })
  }
  lines.push(`\nAllergies: ${report.objective?.allergies?.join(', ') || 'NKDA'}`)
  lines.push('')

  // Assessment
  lines.push('ASSESSMENT')
  lines.push('-'.repeat(30))
  if (report.assessment?.problem_list?.length > 0) {
    lines.push('Problem List:')
    report.assessment.problem_list.forEach(p => {
      lines.push(`  - ${p.problem} (${p.status})`)
    })
  }
  if (report.assessment?.clinical_impression) {
    lines.push(`\nClinical Impression: ${report.assessment.clinical_impression}`)
  }
  lines.push('')

  // Plan
  lines.push('PLAN')
  lines.push('-'.repeat(30))
  if (report.plan?.follow_up?.length > 0) {
    lines.push('Follow-up:')
    report.plan.follow_up.forEach(f => lines.push(`  - ${f}`))
  }
  if (report.plan?.monitoring?.length > 0) {
    lines.push('Monitoring:')
    report.plan.monitoring.forEach(m => lines.push(`  - ${m}`))
  }
  if (report.plan?.owner_instructions?.length > 0) {
    lines.push('Owner Instructions:')
    report.plan.owner_instructions.forEach(i => lines.push(`  - ${i}`))
  }
  lines.push('')

  // Footer
  lines.push('='.repeat(50))
  lines.push('AI DISCLOSURE')
  lines.push(report.ai_disclosure || 'This report was generated by AI.')
  lines.push('')
  lines.push(`Generated by Pawsy - ${new Date().toLocaleDateString()}`)

  return lines.join('\n')
}

export default VetReportPreview
