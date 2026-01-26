import { useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X, Check, Clock, AlertTriangle } from 'lucide-react'
import PremiumIcon from '../common/PremiumIcon'
import { getFeatureById } from '../../constants/premiumFeatures'

const MEDICATIONS = [
  { name: 'Heartgard Plus', time: '8:00 AM', done: true },
  { name: 'NexGard (Afoxolaner)', time: '8:00 AM', done: true },
  { name: 'Drontal Plus', time: '6:00 PM', done: false },
]

function MedicationPreview() {
  return (
    <div className="space-y-2 px-3 py-2">
      {MEDICATIONS.map((med) => (
        <div key={med.name} className="flex items-center gap-2.5">
          <div
            className="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0"
            style={{
              borderColor: med.done ? '#66BB6A' : '#D4D0CA',
              background: med.done ? '#E8F5E9' : '#FAFAFA',
            }}
          >
            {med.done && <Check className="w-3 h-3 text-[#43A047]" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[#2D2A26] truncate" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {med.name}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#8C7B6B]">
            <Clock className="w-3 h-3" />
            {med.time}
          </div>
        </div>
      ))}
    </div>
  )
}

const TIMELINE_EVENTS = [
  { label: 'Annual Checkup', date: 'Jan 15', color: '#5B8DEF' },
  { label: 'DHPP Vaccine Booster', date: 'Jan 8', color: '#E8924F' },
  { label: 'Weight Check — 24.5 lbs', date: 'Dec 20', color: '#43A047' },
]

function TimelinePreview() {
  return (
    <div className="px-3 py-2">
      <div className="relative pl-4">
        <div className="absolute left-[5px] top-1 bottom-1 w-px bg-[#E8DDD0]" />
        <div className="space-y-3">
          {TIMELINE_EVENTS.map((evt) => (
            <div key={evt.label} className="flex items-center gap-2.5 relative">
              <div
                className="absolute left-[-13px] w-2.5 h-2.5 rounded-full border-2 border-white"
                style={{ background: evt.color }}
              />
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-[#2D2A26]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {evt.label}
                </p>
              </div>
              <span className="text-[10px] text-[#8C7B6B]">{evt.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ClinicalProfilePreview() {
  return (
    <div className="px-3 py-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFE8D6] to-[#FFD6B0]" />
        <div>
          <p className="text-[11px] font-bold text-[#2D2A26]" style={{ fontFamily: 'Nunito, sans-serif' }}>Buddy</p>
          <p className="text-[9px] text-[#8C7B6B]">Golden Retriever</p>
        </div>
      </div>
      <div className="flex gap-1.5">
        <span className="text-[9px] px-1.5 py-0.5 bg-[#FEF0EC] text-[#C75B3A] rounded-full font-medium">Allergies: 2</span>
        <span className="text-[9px] px-1.5 py-0.5 bg-[#EBF1FF] text-[#5B8DEF] rounded-full font-medium">Conditions: 1</span>
      </div>
      <div className="rounded-lg bg-[#F9F6F2] p-2">
        <p className="text-[9px] text-[#8C7B6B] font-medium">Primary Vet</p>
        <p className="text-[10px] text-[#2D2A26] font-semibold">Dr. Sarah Mitchell</p>
      </div>
    </div>
  )
}

const BREED_RISKS = [
  { condition: 'Hip Dysplasia', severity: 'moderate risk', color: '#E8924F', bg: '#FFF5ED' },
  { condition: 'Eye Conditions', severity: 'annual check', color: '#E8B84F', bg: '#FFF9E6' },
  { condition: 'Joint Health', severity: 'supplement rec.', color: '#43A047', bg: '#E8F5E9' },
]

function BreedInsightsPreview() {
  return (
    <div className="px-3 py-2 space-y-1.5">
      {BREED_RISKS.map((risk) => (
        <div key={risk.condition} className="flex items-center gap-2 rounded-lg p-1.5" style={{ background: risk.bg }}>
          <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: risk.color }} />
          <span className="text-[10px] font-semibold text-[#2D2A26] flex-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {risk.condition}
          </span>
          <span className="text-[9px] font-medium capitalize" style={{ color: risk.color }}>
            {risk.severity}
          </span>
        </div>
      ))}
    </div>
  )
}

function VetReportPreview() {
  return (
    <div className="px-3 py-2 space-y-2">
      <div className="border-b border-[#E8DDD0]/60 pb-1.5">
        <p className="text-[10px] font-bold text-[#7C6BC4] uppercase tracking-wider">Health Summary Report</p>
        <p className="text-[9px] text-[#8C7B6B]">Generated Jan 20, 2025</p>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#43A047]" />
          <p className="text-[10px] text-[#2D2A26] font-medium">Overall Status: Good</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#E8924F]" />
          <p className="text-[10px] text-[#2D2A26] font-medium">Recent Concerns: 1</p>
        </div>
      </div>
      <div className="rounded-lg bg-[#F9F6F2] p-1.5">
        <p className="text-[9px] text-[#8C7B6B]">AI analysis notes attached</p>
      </div>
    </div>
  )
}

const previewComponents = {
  clinicalProfile: ClinicalProfilePreview,
  vetReport: VetReportPreview,
  medicationManager: MedicationPreview,
  healthTimeline: TimelinePreview,
  breedInsights: BreedInsightsPreview,
}

function PremiumFeatureModal({ featureId, isOpen, onClose, onUpgrade, dogName, breed }) {
  const prefersReducedMotion = useReducedMotion()
  const feature = featureId ? getFeatureById(featureId) : null

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!feature) return null

  const FeatureIcon = feature.icon
  const PreviewComponent = previewComponents[feature.id]

  const handleUpgrade = () => {
    onUpgrade()
    onClose()
  }

  const overlayAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      }

  const cardAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 10 },
        transition: { type: 'spring', stiffness: 300, damping: 24 },
      }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          {...overlayAnimation}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label={`${feature.label} — Premium Feature`}
            {...cardAnimation}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-[#6B6B6B]" />
            </button>

            {/* Header */}
            <div
              className="px-5 pt-5 pb-4"
              style={{ background: 'linear-gradient(135deg, #FDF8F3 0%, #FFE8D6 100%)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: feature.iconBg }}
                >
                  <FeatureIcon className="w-5.5 h-5.5" style={{ color: feature.color, width: 22, height: 22 }} />
                </div>
                <div>
                  <h3
                    className="font-bold text-[15px] text-[#2D2A26] leading-tight"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {feature.label}
                  </h3>
                  <p className="text-[12px] text-[#8C7B6B] mt-0.5" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Blurred preview */}
            {PreviewComponent && (
              <div className="relative mx-4 mt-3 rounded-xl overflow-hidden border border-[#E8DDD0]/50">
                <div
                  className="pointer-events-none select-none"
                  style={{ filter: 'blur(1px)', opacity: 0.85 }}
                  aria-hidden="true"
                >
                  <PreviewComponent />
                </div>
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.15) 90%, rgba(255,255,255,0.35) 100%)',
                  }}
                />
              </div>
            )}

            {/* Personalized copy */}
            <div className="px-5 pt-4 pb-2">
              <p className="text-[13px] text-[#3D3D3D] leading-relaxed text-center" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {feature.personalizedText(dogName, breed)}
              </p>
            </div>

            {/* CTA */}
            <div className="px-5 pt-2 pb-5">
              <button
                onClick={handleUpgrade}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-[14px] transition-all hover:shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  background: 'linear-gradient(135deg, #FFD54F 0%, #F4A261 50%, #E8924F 100%)',
                  boxShadow: '0 2px 12px rgba(244,162,97,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
              >
                <PremiumIcon size={16} gradient={false} className="text-white" />
                Unlock with Premium
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PremiumFeatureModal
