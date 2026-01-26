import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, AlertTriangle, AlertCircle, AlertOctagon,
  Eye, Search, Home, Stethoscope, ChevronDown,
  Camera, MapPin, HelpCircle
} from 'lucide-react'

// Urgency configuration
const urgencyConfig = {
  low: {
    icon: CheckCircle,
    label: 'Low Concern',
    bg: 'bg-[#E8F5E9]',
    border: 'border-[#A5D6A7]',
    text: 'text-[#2E7D32]',
    iconColor: 'text-[#4CAF50]'
  },
  moderate: {
    icon: AlertTriangle,
    label: 'Moderate',
    bg: 'bg-[#FFF8E1]',
    border: 'border-[#FFD54F]',
    text: 'text-[#F57F17]',
    iconColor: 'text-[#FFC107]'
  },
  urgent: {
    icon: AlertCircle,
    label: 'Needs Attention',
    bg: 'bg-[#FFF3E0]',
    border: 'border-[#FFB74D]',
    text: 'text-[#E65100]',
    iconColor: 'text-[#FF9800]'
  },
  emergency: {
    icon: AlertOctagon,
    label: 'Emergency',
    bg: 'bg-[#FFEBEE]',
    border: 'border-[#EF9A9A]',
    text: 'text-[#C62828]',
    iconColor: 'text-[#F44336]'
  }
}

// Card component for each section
function InfoCard({ icon: Icon, title, items, iconColor, defaultOpen = true, collapsible = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (!items || items.length === 0) return null

  return (
    <div className="bg-white/80 rounded-xl border border-[#E8E8E8]/80 overflow-hidden">
      <button
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2 px-3 py-2 ${collapsible ? 'cursor-pointer hover:bg-[#F5F5F5]/50' : 'cursor-default'}`}
        disabled={!collapsible}
      >
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-xs font-semibold text-[#3D3D3D] flex-1 text-left">{title}</span>
        {collapsible && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-[#9E9E9E]" />
          </motion.div>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="px-3 pb-2.5 space-y-1">
              {items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-[#5A5A5A]">
                  <span className="text-[#7EC8C8] mt-0.5">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Action chip component
function ActionChip({ icon: Icon, label, onClick, variant = 'default' }) {
  const variants = {
    default: 'bg-[#F5F5F5] text-[#5A5A5A] border-[#E0E0E0] hover:bg-[#EEEEEE]',
    primary: 'bg-[#7EC8C8]/15 text-[#5FB3B3] border-[#7EC8C8]/30 hover:bg-[#7EC8C8]/25',
    warning: 'bg-[#FFF8E1] text-[#F57F17] border-[#FFD54F]/30 hover:bg-[#FFF3E0]'
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${variants[variant]}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </motion.button>
  )
}

function getField(metadata, key, fallback) {
  return metadata?.[key] ?? metadata?.photo_analysis?.[key] ?? fallback
}

function RichHealthResponse({ metadata, onAction }) {
  const urgencyLevel = getField(metadata, 'urgency_level', 'moderate')
  const visibleSymptoms = getField(metadata, 'visible_symptoms', [])
  const possibleConditions = getField(metadata, 'possible_conditions', [])
  const homeCareTips = getField(metadata, 'home_care_tips', [])
  const recommendedActions = getField(metadata, 'recommended_actions', [])
  const shouldSeeVet = getField(metadata, 'should_see_vet', false)
  const emergencySteps = metadata?.emergency_steps || []

  const config = urgencyConfig[urgencyLevel] || urgencyConfig.moderate
  const UrgencyIcon = config.icon

  const hasStructuredData = visibleSymptoms.length > 0 ||
                           possibleConditions.length > 0 ||
                           homeCareTips.length > 0 ||
                           recommendedActions.length > 0 ||
                           emergencySteps.length > 0

  if (!hasStructuredData) return null

  return (
    <div className="space-y-2 mt-3">
      {/* Urgency Badge */}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg} ${config.border} border`}>
        <UrgencyIcon className={`w-3.5 h-3.5 ${config.iconColor}`} />
        <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
      </div>

      {/* Info Cards */}
      <div className="space-y-2">
        {/* Emergency Steps - Always show first if present */}
        {emergencySteps.length > 0 && (
          <div className="bg-[#FFEBEE] rounded-xl border border-[#EF9A9A] overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2">
              <AlertOctagon className="w-4 h-4 text-[#F44336]" />
              <span className="text-xs font-semibold text-[#C62828]">Do This NOW</span>
            </div>
            <ol className="px-3 pb-2.5 space-y-1.5">
              {emergencySteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-[#C62828]">
                  <span className="font-bold min-w-[1rem]">{idx + 1}.</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* What I Observe */}
        <InfoCard
          icon={Eye}
          title="What I Observe"
          items={visibleSymptoms}
          iconColor="text-[#7EC8C8]"
        />

        {/* Possible Causes */}
        <InfoCard
          icon={Search}
          title="Possible Causes"
          items={possibleConditions}
          iconColor="text-[#F4A261]"
        />

        {/* Recommendations */}
        <InfoCard
          icon={Stethoscope}
          title="Recommendations"
          items={recommendedActions}
          iconColor="text-[#9575CD]"
        />

        {/* Home Care - Collapsible */}
        <InfoCard
          icon={Home}
          title="Home Care Tips"
          items={homeCareTips}
          iconColor="text-[#4DB6AC]"
          collapsible
          defaultOpen={false}
        />
      </div>

      {/* Action Chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {shouldSeeVet && (
          <ActionChip
            icon={MapPin}
            label="Find Vet"
            variant="warning"
            onClick={() => onAction?.('find_vet')}
          />
        )}
        <ActionChip
          icon={Camera}
          label="Share Photo"
          variant="primary"
          onClick={() => onAction?.('upload_photo')}
        />
        <ActionChip
          icon={HelpCircle}
          label="Ask More"
          onClick={() => onAction?.('ask_more')}
        />
      </div>
    </div>
  )
}

export default RichHealthResponse
