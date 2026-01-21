import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Activity,
  Thermometer,
  Eye,
  Heart,
  Utensils,
  Droplets,
  Wind,
  Bone,
  RefreshCw,
  MapPin,
  MessageCircle
} from 'lucide-react'
import BottomNav from '../components/layout/BottomNav'
import PawsyMascot from '../components/mascot/PawsyMascot'

// Symptom categories and questions
const SYMPTOM_CATEGORIES = [
  {
    id: 'eating',
    icon: Utensils,
    label: 'Eating & Drinking',
    question: 'How is your dog eating and drinking?',
    options: [
      { id: 'normal', label: 'Normal appetite', severity: 0 },
      { id: 'reduced', label: 'Eating less than usual', severity: 1 },
      { id: 'not_eating', label: 'Refusing food (24+ hrs)', severity: 3 },
      { id: 'not_drinking', label: 'Not drinking water', severity: 4 },
    ]
  },
  {
    id: 'energy',
    icon: Activity,
    label: 'Energy Level',
    question: 'How active is your dog?',
    options: [
      { id: 'normal', label: 'Normal energy', severity: 0 },
      { id: 'tired', label: 'More tired than usual', severity: 1 },
      { id: 'lethargic', label: 'Very lethargic/weak', severity: 3 },
      { id: 'collapse', label: 'Collapsed or unable to stand', severity: 5 },
    ]
  },
  {
    id: 'breathing',
    icon: Wind,
    label: 'Breathing',
    question: 'How is your dog breathing?',
    options: [
      { id: 'normal', label: 'Breathing normally', severity: 0 },
      { id: 'panting', label: 'Panting more than usual', severity: 1 },
      { id: 'labored', label: 'Labored or rapid breathing', severity: 3 },
      { id: 'struggling', label: 'Struggling to breathe', severity: 5 },
    ]
  },
  {
    id: 'digestive',
    icon: Droplets,
    label: 'Digestive',
    question: 'Any vomiting or diarrhea?',
    options: [
      { id: 'none', label: 'None', severity: 0 },
      { id: 'once', label: 'Once or twice', severity: 1 },
      { id: 'multiple', label: 'Multiple times today', severity: 2 },
      { id: 'blood', label: 'Contains blood', severity: 4 },
    ]
  },
  {
    id: 'pain',
    icon: Heart,
    label: 'Pain Signs',
    question: 'Is your dog showing signs of pain?',
    options: [
      { id: 'none', label: 'No signs of pain', severity: 0 },
      { id: 'mild', label: 'Whining or restless', severity: 1 },
      { id: 'moderate', label: 'Limping or sensitive to touch', severity: 2 },
      { id: 'severe', label: 'Crying out, aggressive when touched', severity: 4 },
    ]
  },
]

// Risk level thresholds and recommendations
const RISK_LEVELS = {
  low: {
    threshold: 3,
    color: 'green',
    icon: CheckCircle,
    title: 'Low Concern',
    description: 'Symptoms appear mild. Monitor at home.',
    recommendations: [
      'Continue monitoring your dog\'s behavior',
      'Ensure fresh water is always available',
      'Keep your dog comfortable and rested',
      'Note any changes in symptoms',
    ],
    action: 'Monitor at home. If symptoms persist beyond 24-48 hours or worsen, consult a vet.',
  },
  moderate: {
    threshold: 7,
    color: 'yellow',
    icon: AlertCircle,
    title: 'Moderate Concern',
    description: 'Schedule a vet visit soon.',
    recommendations: [
      'Schedule a vet appointment within 24-48 hours',
      'Keep your dog calm and limit activity',
      'Monitor for worsening symptoms',
      'Take note of when symptoms started',
    ],
    action: 'Contact your vet for an appointment. Not immediately life-threatening but needs professional evaluation.',
  },
  urgent: {
    threshold: 12,
    color: 'orange',
    icon: AlertTriangle,
    title: 'Urgent - See Vet Today',
    description: 'Your dog needs veterinary care soon.',
    recommendations: [
      'Call your vet immediately for same-day appointment',
      'If your regular vet is unavailable, find an urgent care clinic',
      'Keep your dog calm and still',
      'Do not give any medications without vet guidance',
    ],
    action: 'Seek veterinary care today. These symptoms require professional attention.',
  },
  emergency: {
    threshold: Infinity,
    color: 'red',
    icon: AlertTriangle,
    title: 'Emergency - Go Now',
    description: 'Seek emergency veterinary care immediately.',
    recommendations: [
      'Go to the nearest emergency vet clinic NOW',
      'Call ahead if possible so they can prepare',
      'Keep your dog as calm and still as possible',
      'If breathing issues, ensure airway is clear',
    ],
    action: 'This is a medical emergency. Go to an emergency vet immediately.',
  },
}

function getRiskLevel(score) {
  if (score <= RISK_LEVELS.low.threshold) return 'low'
  if (score <= RISK_LEVELS.moderate.threshold) return 'moderate'
  if (score <= RISK_LEVELS.urgent.threshold) return 'urgent'
  return 'emergency'
}

const RISK_COLORS = {
  low: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: 'text-green-500',
    button: 'bg-green-500',
  },
  moderate: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    icon: 'text-yellow-500',
    button: 'bg-yellow-500',
  },
  urgent: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    icon: 'text-orange-500',
    button: 'bg-orange-500',
  },
  emergency: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-500',
    button: 'bg-red-500',
  },
}

function SymptomChecker() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  const currentCategory = SYMPTOM_CATEGORIES[currentStep]
  const totalSteps = SYMPTOM_CATEGORIES.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleAnswer = (optionId, severity) => {
    setAnswers(prev => ({
      ...prev,
      [currentCategory.id]: { optionId, severity }
    }))

    // Auto-advance after selection
    setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        setShowResults(true)
      }
    }, 300)
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setAnswers({})
    setShowResults(false)
  }

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, answer) => sum + answer.severity, 0)
  }

  const score = calculateScore()
  const riskLevel = getRiskLevel(score)
  const risk = RISK_LEVELS[riskLevel]
  const colors = RISK_COLORS[riskLevel]
  const RiskIcon = risk.icon

  // Results view
  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] pb-24">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#FDF8F3]/80 backdrop-blur-md border-b border-[#E8E8E8]/30">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Link to="/dashboard">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl hover:bg-[#F4A261]/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#3D3D3D]" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-2">
              <PawsyMascot
                mood={riskLevel === 'emergency' ? 'alert' : riskLevel === 'urgent' ? 'concerned' : 'happy'}
                size={36}
              />
              <h1
                className="text-lg font-bold text-[#3D3D3D]"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Assessment Results
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-6">
          {/* Risk Level Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-6 mb-6`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-full ${colors.button} flex items-center justify-center`}>
                <RiskIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2
                  className={`text-xl font-bold ${colors.text}`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {risk.title}
                </h2>
                <p className="text-sm text-[#6B6B6B]">{risk.description}</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl bg-white/60 ${colors.border} border`}>
              <p className={`text-sm font-medium ${colors.text}`}>
                {risk.action}
              </p>
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-md border border-[#E8E8E8]/50 mb-6"
          >
            <h3
              className="text-base font-bold text-[#3D3D3D] mb-4"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Recommended Actions
            </h3>
            <ul className="space-y-3">
              {risk.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full ${colors.button} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <span className="text-white text-xs font-bold">{idx + 1}</span>
                  </div>
                  <span className="text-sm text-[#3D3D3D]">{rec}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Summary of answers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 shadow-md border border-[#E8E8E8]/50 mb-6"
          >
            <h3
              className="text-base font-bold text-[#3D3D3D] mb-4"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Your Responses
            </h3>
            <div className="space-y-3">
              {SYMPTOM_CATEGORIES.map(cat => {
                const answer = answers[cat.id]
                const option = cat.options.find(o => o.id === answer?.optionId)
                const Icon = cat.icon
                return (
                  <div key={cat.id} className="flex items-center gap-3 text-sm">
                    <Icon className="w-4 h-4 text-[#9E9E9E]" />
                    <span className="text-[#6B6B6B]">{cat.label}:</span>
                    <span className="text-[#3D3D3D] font-medium">{option?.label || 'Not answered'}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {(riskLevel === 'urgent' || riskLevel === 'emergency') && (
              <Link to="/emergency-vet">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#EF5350] to-[#E53935] text-white font-bold rounded-xl shadow-lg"
                >
                  <MapPin className="w-5 h-5" />
                  Find Emergency Vet
                </motion.button>
              </Link>
            )}

            <Link to="/chat">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] text-white font-bold rounded-xl shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Discuss with Pawsy
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 py-3 text-[#6B6B6B] font-semibold rounded-xl border-2 border-[#E8E8E8] hover:bg-[#F4A261]/5"
            >
              <RefreshCw className="w-4 h-4" />
              Start Over
            </motion.button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-[#9E9E9E] text-center mt-6">
            This assessment is for guidance only and does not replace professional veterinary advice.
            Always consult a vet if you're concerned about your pet's health.
          </p>
        </main>

        <BottomNav />
      </div>
    )
  }

  // Question view
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FDF8F3]/80 backdrop-blur-md border-b border-[#E8E8E8]/30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={currentStep === 0 ? undefined : handleBack}
              className={`p-2 rounded-xl transition-colors ${
                currentStep === 0 ? 'opacity-50' : 'hover:bg-[#F4A261]/10'
              }`}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-5 h-5 text-[#3D3D3D]" />
            </motion.button>
            <div className="flex items-center gap-2">
              <PawsyMascot mood="listening" size={36} />
              <div>
                <h1
                  className="text-lg font-bold text-[#3D3D3D]"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Symptom Checker
                </h1>
                <p className="text-xs text-[#6B6B6B]">Quick health assessment</p>
              </div>
            </div>
          </div>
          <Link to="/dashboard">
            <span className="text-sm text-[#F4A261] font-medium">Cancel</span>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B] mb-2">
            <span>Question {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-[#E8E8E8] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#F4A261] to-[#E8924F] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Category icon and question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCategory.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F4A261]/20 to-[#F4A261]/10 flex items-center justify-center mx-auto mb-4">
                <currentCategory.icon className="w-8 h-8 text-[#F4A261]" />
              </div>
              <h2
                className="text-xl font-bold text-[#3D3D3D] mb-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {currentCategory.question}
              </h2>
              <p className="text-sm text-[#6B6B6B]">
                Select the option that best describes your dog's current state
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentCategory.options.map((option) => {
                const isSelected = answers[currentCategory.id]?.optionId === option.id
                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAnswer(option.id, option.severity)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#F4A261] to-[#E8924F] text-white shadow-lg'
                        : 'bg-white border-2 border-[#E8E8E8] hover:border-[#F4A261]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-white bg-white' : 'border-[#E8E8E8]'
                      }`}>
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#F4A261]" />
                        )}
                      </div>
                      <span className={`font-medium ${isSelected ? 'text-white' : 'text-[#3D3D3D]'}`}>
                        {option.label}
                      </span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation hint */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#9E9E9E]">
            Tap an option to continue
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default SymptomChecker
