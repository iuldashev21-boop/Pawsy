import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Dog, MessageCircle, Camera, Search, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'

function OnboardingChecklist() {
  const { progress, completedCount, totalSteps, showChecklist } = useOnboarding()
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  if (!showChecklist || dismissed) return null

  const steps = [
    {
      key: 'hasDog',
      label: 'Add dog',
      icon: Dog,
      done: progress.hasDog,
      link: '/add-dog',
    },
    {
      key: 'firstChat',
      label: 'Ask question',
      icon: MessageCircle,
      done: progress.firstChat,
      link: '/chat',
    },
    {
      key: 'checkedFood',
      label: 'Check food',
      icon: Search,
      done: progress.checkedFood,
      link: '/toxic-checker',
    },
    {
      key: 'firstPhoto',
      label: 'Photo scan',
      icon: Camera,
      done: progress.firstPhoto,
      link: '/photo',
    },
  ]

  const progressPercent = (completedCount / totalSteps) * 100
  const nextStep = steps.find(s => !s.done)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-xl shadow-sm border border-[#F4A261]/10 overflow-hidden"
    >
      {/* Compact header - always visible */}
      <div
        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-[#FAFAFA] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Progress circle */}
        <div className="relative w-8 h-8 flex-shrink-0">
          <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16" cy="16" r="14"
              fill="none"
              stroke="#E8E8E8"
              strokeWidth="3"
            />
            <circle
              cx="16" cy="16" r="14"
              fill="none"
              stroke="#F4A261"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${progressPercent * 0.88} 100`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#F4A261]">
            {completedCount}/{totalSteps}
          </span>
        </div>

        {/* Title and next action */}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-[#3D3D3D]">Getting Started</span>
          {nextStep && (
            <p className="text-[11px] text-[#9E9E9E] truncate">
              Next: {nextStep.label}
            </p>
          )}
          {completedCount === totalSteps && (
            <p className="text-[11px] text-[#81C784] font-medium">All done!</p>
          )}
        </div>

        {/* Expand/collapse */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-[#9E9E9E]" />
        </motion.div>

        {/* Dismiss */}
        <button
          onClick={(e) => { e.stopPropagation(); setDismissed(true) }}
          className="p-1 rounded-full hover:bg-[#E8E8E8]/50 text-[#9E9E9E]"
          aria-label="Dismiss checklist"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1.5 border-t border-[#E8E8E8]/50">
              <div className="pt-2" />
              {steps.map((step, index) => (
                <ChecklistItem key={step.key} step={step} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ChecklistItem({ step, index }) {
  const { icon: Icon, label, done, link } = step

  const content = (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${
        done
          ? 'bg-[#E8F5E9]/60'
          : 'bg-[#FDF8F3] hover:bg-[#F4A261]/10 cursor-pointer'
      }`}
    >
      {/* Checkbox */}
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
          done ? 'bg-[#81C784]' : 'border-2 border-[#E8E8E8]'
        }`}
      >
        {done && <Check className="w-3 h-3 text-white" />}
      </div>

      {/* Icon */}
      <Icon className={`w-3.5 h-3.5 ${done ? 'text-[#81C784]' : 'text-[#F4A261]'}`} />

      {/* Label */}
      <span
        className={`text-xs font-medium flex-1 ${
          done ? 'text-[#81C784] line-through' : 'text-[#3D3D3D]'
        }`}
      >
        {label}
      </span>

      {/* Arrow for incomplete */}
      {!done && (
        <span className="text-[#F4A261] text-[10px] font-medium">Go →</span>
      )}
    </motion.div>
  )

  if (done) {
    return content
  }

  return <Link to={link}>{content}</Link>
}

export default OnboardingChecklist
