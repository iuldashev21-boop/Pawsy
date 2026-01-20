import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, CheckCircle, AlertCircle, Clock,
  Stethoscope, MessageCircle, ChevronDown, ChevronUp,
  Eye, Home, Shield, Camera, Dog
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Map urgency_level to visual config (new schema)
const urgencyLevelConfig = {
  emergency: {
    color: 'text-[#EF5350]',
    bg: 'bg-[#EF5350]/10',
    border: 'border-[#EF5350]/30',
    icon: AlertTriangle,
    label: 'Emergency',
  },
  urgent: {
    color: 'text-[#FF9800]',
    bg: 'bg-[#FF9800]/10',
    border: 'border-[#FF9800]/30',
    icon: AlertTriangle,
    label: 'Urgent',
  },
  moderate: {
    color: 'text-[#FFD54F]',
    bg: 'bg-[#FFD54F]/10',
    border: 'border-[#FFD54F]/30',
    icon: AlertCircle,
    label: 'Moderate Concern',
  },
  low: {
    color: 'text-[#81C784]',
    bg: 'bg-[#81C784]/10',
    border: 'border-[#81C784]/30',
    icon: CheckCircle,
    label: 'Low Concern',
  },
}

// Map vet_urgency to display labels (new schema)
const vetUrgencyConfig = {
  immediately: {
    label: 'Seek emergency veterinary care immediately',
    icon: AlertTriangle,
    priority: 'high'
  },
  within_24_hours: {
    label: 'See a veterinarian within 24 hours',
    icon: Stethoscope,
    priority: 'high'
  },
  within_week: {
    label: 'Schedule a vet visit this week',
    icon: Clock,
    priority: 'medium'
  },
  routine_checkup: {
    label: 'Mention at next routine checkup',
    icon: Clock,
    priority: 'low'
  },
  not_required: {
    label: 'No vet visit needed at this time',
    icon: CheckCircle,
    priority: 'none'
  },
}

// Map confidence to display
const confidenceConfig = {
  high: { label: 'High confidence', color: 'text-[#81C784]', bg: 'bg-[#81C784]/10' },
  medium: { label: 'Medium confidence', color: 'text-[#FFD54F]', bg: 'bg-[#FFD54F]/10' },
  low: { label: 'Low confidence', color: 'text-[#FF9800]', bg: 'bg-[#FF9800]/10' },
}

function AnalysisResult({ analysis, imageUrl, photo, bodyArea, onReset, profileBreed }) {
  const [showHomeCare, setShowHomeCare] = useState(false)
  const navigate = useNavigate()

  // Dog validation fields
  const isDog = analysis.is_dog ?? true
  const detectedSubject = analysis.detected_subject || 'unknown'

  // Breed verification fields
  const detectedBreed = analysis.detected_breed || null
  const breedMatchesProfile = analysis.breed_matches_profile ?? true

  // Handle new schema with snake_case keys
  const imageQuality = analysis.image_quality || 'good'
  const imageQualityNote = analysis.image_quality_note || null
  const urgencyLevel = analysis.urgency_level || 'moderate'
  const confidence = analysis.confidence || 'medium'
  const possibleConditions = analysis.possible_conditions || []
  const visibleSymptoms = analysis.visible_symptoms || []
  const recommendedActions = analysis.recommended_actions || []
  const shouldSeeVet = analysis.should_see_vet ?? true
  const vetUrgency = analysis.vet_urgency || 'routine_checkup'
  const homeCareTips = analysis.home_care_tips || []
  const summary = analysis.summary || ''

  const hasImageQualityIssue = imageQuality !== 'good' && imageQualityNote

  const urgencyConfig = urgencyLevelConfig[urgencyLevel] || urgencyLevelConfig.moderate
  const vetConfig = vetUrgencyConfig[vetUrgency] || vetUrgencyConfig.routine_checkup
  const confConfig = confidenceConfig[confidence] || confidenceConfig.medium
  const UrgencyIcon = urgencyConfig.icon
  const VetIcon = vetConfig.icon

  // If not a dog, show a friendly message instead of health analysis
  if (!isDog) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Image preview */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#E8E8E8] shadow-md bg-[#F5F5F5]">
          <img
            src={imageUrl}
            alt="Uploaded photo"
            className="w-full h-48 object-contain"
          />
        </div>

        {/* Not a dog message */}
        <div className="bg-gradient-to-br from-[#FFF8E1] to-[#FFECB3] rounded-2xl p-6 shadow-md border border-[#FFD54F]/30 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
            <Dog className="w-8 h-8 text-[#F4A261]" />
          </div>
          <h3
            className="text-lg font-bold text-[#3D3D3D] mb-2"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Oops! This doesn't look like a dog
          </h3>
          <p className="text-sm text-[#6B6B6B] mb-4">
            {detectedSubject !== 'unknown' && detectedSubject !== 'dog' ? (
              <>This appears to be a <span className="font-semibold text-[#F4A261]">{detectedSubject}</span>. </>
            ) : null}
            Pawsy is designed specifically for dog health analysis. Please upload a photo of your pup!
          </p>

          {/* Upload button */}
          {onReset && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onReset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-xl shadow-md"
            >
              <Camera className="w-5 h-5" />
              Upload Dog Photo
            </motion.button>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-[#9E9E9E] text-center px-4">
          Pawsy can only analyze photos of dogs.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Image preview with urgency badge */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-[#E8E8E8] shadow-md bg-[#F5F5F5]">
        <img
          src={imageUrl}
          alt="Analyzed photo"
          className="w-full h-48 object-contain"
        />
        <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full ${urgencyConfig.bg} ${urgencyConfig.border} border flex items-center gap-1.5`}>
          <UrgencyIcon className={`w-4 h-4 ${urgencyConfig.color}`} />
          <span className={`text-xs font-semibold ${urgencyConfig.color}`}>{urgencyConfig.label}</span>
        </div>
        {/* Confidence badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full ${confConfig.bg} border border-white/20`}>
          <span className={`text-xs font-medium ${confConfig.color}`}>{confConfig.label}</span>
        </div>
      </div>

      {/* Image quality warning */}
      {hasImageQualityIssue && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFF8E1] rounded-2xl p-4 border border-[#FFD54F]/30 flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-[#FFD54F]/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-[#FF9800]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#E65100] mb-1">
              {imageQuality === 'poor' ? 'Image Quality Issue' : 'Image Could Be Clearer'}
            </p>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">
              {imageQualityNote}
            </p>
          </div>
        </motion.div>
      )}

      {/* Breed mismatch note */}
      {!breedMatchesProfile && detectedBreed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#E3F2FD] rounded-xl px-4 py-3 border border-[#90CAF9]/30 flex items-center gap-2"
        >
          <Dog className="w-4 h-4 text-[#1976D2] flex-shrink-0" />
          <p className="text-sm text-[#1565C0]">
            <span className="font-medium">Detected breed:</span> {detectedBreed}
            {profileBreed && (
              <span className="text-[#64B5F6]"> (profile says {profileBreed})</span>
            )}
          </p>
        </motion.div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-[#F4A261]/10">
        <h3
          className="text-lg font-bold text-[#3D3D3D] mb-2"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Analysis Summary
        </h3>
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Visible Symptoms */}
      {visibleSymptoms.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-md border border-[#F4A261]/10">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-[#7EC8C8]" />
            <h3
              className="text-sm font-bold text-[#3D3D3D]"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Visible Symptoms
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleSymptoms.map((symptom, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-[#7EC8C8]/10 text-[#5FB3B3] text-sm rounded-full border border-[#7EC8C8]/20"
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Possible conditions */}
      {possibleConditions.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-md border border-[#F4A261]/10">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-[#F4A261]" />
            <h3
              className="text-sm font-bold text-[#3D3D3D]"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Possible Conditions
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {possibleConditions.map((condition, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-[#FDF8F3] text-[#6B6B6B] text-sm rounded-full border border-[#E8E8E8]"
              >
                {condition}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendedActions.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-md border border-[#F4A261]/10">
          <h3
            className="text-sm font-bold text-[#3D3D3D] mb-3"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Recommended Actions
          </h3>
          <ol className="space-y-2">
            {recommendedActions.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-[#6B6B6B]">
                <span className="w-5 h-5 rounded-full bg-[#7EC8C8]/20 text-[#5FB3B3] flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                  {idx + 1}
                </span>
                {rec}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Home Care Tips - Expandable */}
      {homeCareTips.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-[#F4A261]/10 overflow-hidden">
          <button
            onClick={() => setShowHomeCare(!showHomeCare)}
            className="w-full p-5 flex items-center justify-between hover:bg-[#FDF8F3]/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-[#F4A261]" />
              <h3
                className="text-sm font-bold text-[#3D3D3D]"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Home Care Tips
              </h3>
              <span className="text-xs text-[#9E9E9E]">({homeCareTips.length})</span>
            </div>
            {showHomeCare ? (
              <ChevronUp className="w-4 h-4 text-[#9E9E9E]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#9E9E9E]" />
            )}
          </button>
          <AnimatePresence>
            {showHomeCare && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <ul className="px-5 pb-5 space-y-2">
                  {homeCareTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-[#6B6B6B]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F4A261] mt-2 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Vet Urgency banner */}
      <div className={`rounded-2xl p-4 ${urgencyConfig.bg} ${urgencyConfig.border} border flex items-center gap-3`}>
        <div className={`w-10 h-10 rounded-full ${urgencyConfig.bg} flex items-center justify-center`}>
          <VetIcon className={`w-5 h-5 ${urgencyConfig.color}`} />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${urgencyConfig.color}`}>
            {vetConfig.label}
          </p>
          {shouldSeeVet && vetUrgency !== 'not_required' && (
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Professional evaluation recommended
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Navigate to chat with photo analysis context
            navigate('/chat', {
              state: {
                fromPhotoAnalysis: true,
                photo: photo ? {
                  preview: photo.preview,
                  base64Data: photo.base64Data,
                  mimeType: photo.mimeType
                } : null,
                analysis: {
                  summary,
                  urgency_level: urgencyLevel,
                  possible_conditions: possibleConditions,
                  visible_symptoms: visibleSymptoms,
                  body_area: bodyArea
                }
              }
            })
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] text-white font-semibold rounded-xl shadow-md"
        >
          <MessageCircle className="w-5 h-5" />
          Discuss with Pawsy
        </motion.button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-[#9E9E9E] text-center px-4">
        This analysis is for informational purposes only and should not replace professional veterinary advice.
      </p>
    </motion.div>
  )
}

export default AnalysisResult
