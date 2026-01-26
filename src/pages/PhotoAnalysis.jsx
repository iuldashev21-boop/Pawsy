import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Dog, PawPrint, AlertCircle } from 'lucide-react'
import { useDog } from '../context/DogContext'
import { useUsage } from '../context/UsageContext'
import { useOnboarding } from '../context/OnboardingContext'
import { geminiService } from '../services/api/gemini'
import PhotoUploader from '../components/photo/PhotoUploader'
import ScanAnimation from '../components/photo/ScanAnimation'
import AnalysisResult from '../components/photo/AnalysisResult'
import BottomNav from '../components/layout/BottomNav'
import PawsyMascot from '../components/mascot/PawsyMascot'
import UsageCounter from '../components/usage/UsageCounter'
import UsageLimitModal from '../components/usage/UsageLimitModal'
import InlinePremiumHint from '../components/common/InlinePremiumHint'
import ErrorMessage from '../components/common/ErrorMessage'
import { useToast } from '../context/ToastContext'

const BODY_AREAS = [
  { id: 'skin', label: 'Skin/Coat' },
  { id: 'ear', label: 'Ear' },
  { id: 'eye', label: 'Eye' },
  { id: 'paw', label: 'Paw/Leg' },
  { id: 'mouth', label: 'Mouth/Teeth' },
  { id: 'nose', label: 'Nose' },
  { id: 'other', label: 'Other' },
]

function buildDemoResult(activeDog, bodyAreaLabel) {
  return {
    is_dog: true,
    detected_subject: 'dog',
    detected_breed: activeDog?.breed || 'Mixed breed',
    breed_matches_profile: true,
    image_quality: 'good',
    image_quality_note: null,
    urgency_level: 'low',
    confidence: 'medium',
    possible_conditions: ['Minor irritation', 'Allergic reaction', 'Dry skin'],
    visible_symptoms: ['Slight redness', 'Minor swelling'],
    recommended_actions: [
      'Keep the area clean and dry',
      'Monitor for any changes over the next 24-48 hours',
      'Avoid letting your dog scratch or lick the area',
      'Consider a vet visit if symptoms persist or worsen',
    ],
    should_see_vet: false,
    vet_urgency: 'not_required',
    home_care_tips: [
      'Apply a cold compress if there is swelling',
      'Use an e-collar if your dog keeps licking the area',
    ],
    summary: `Based on the photo of ${activeDog?.name || 'your dog'}'s ${bodyAreaLabel.toLowerCase()}, I can see the area you're concerned about. While I cannot make a definitive diagnosis from a photo alone, this appears to be a minor issue that can likely be monitored at home.`,
  }
}

function getAreaLabel(selectedArea) {
  return BODY_AREAS.find(a => a.id === selectedArea)?.label || selectedArea
}

function PhotoAnalysis() {
  const { activeDog, dogs, loading: dogsLoading } = useDog()
  const {
    canPhoto,
    photosRemaining,
    usePhoto: consumePhoto,
    useEmergencyPhoto: consumeEmergencyPhoto,
    emergencyPhotosRemaining,
  } = useUsage()
  const { completeStep, progress } = useOnboarding()
  const navigate = useNavigate()

  const [photo, setPhoto] = useState(null)
  const [selectedArea, setSelectedArea] = useState(null)
  const [description, setDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const { showToast } = useToast()
  const [isEmergencyMode, setIsEmergencyMode] = useState(false)

  const selectedAreaLabel = getAreaLabel(selectedArea)

  const handleUpgrade = () => showToast('Premium upgrade coming soon! For now, enjoy free features.', 'premium')

  if (dogsLoading || !activeDog) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="text-center">
          <Dog className="w-16 h-16 text-[#F4A261] mx-auto mb-4 animate-pulse" />
          <p className="text-[#6B6B6B]">Loading...</p>
        </div>
      </div>
    )
  }

  if (dogs.length === 0) {
    navigate('/add-dog')
    return null
  }

  const handleAnalyze = async () => {
    if (!photo || !selectedArea) return

    if (!isEmergencyMode && !canPhoto) {
      setShowLimitModal(true)
      return
    }

    const allowed = isEmergencyMode ? consumeEmergencyPhoto() : consumePhoto()
    if (!allowed) {
      setShowLimitModal(true)
      return
    }

    if (!isEmergencyMode && photosRemaining === 2) {
      showToast('You have 1 photo analysis remaining today.', 'warning')
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      let result

      if (!geminiService.isConfigured()) {
        await new Promise(resolve => setTimeout(resolve, 3000))
        result = buildDemoResult(activeDog, selectedAreaLabel)
      } else {
        const response = await geminiService.analyzePhoto(
          photo.base64Data,
          photo.mimeType,
          activeDog,
          selectedAreaLabel,
          description
        )

        if (response.error) {
          setError(response.message || 'Failed to analyze photo. Please try again.')
          return
        }

        result = response
      }

      setAnalysis(result)
      if (!progress.firstPhoto) {
        completeStep('firstPhoto')
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Analysis error:', err)
      setError('Failed to analyze photo. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setPhoto(null)
    setSelectedArea(null)
    setDescription('')
    setAnalysis(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FDF8F3]/80 backdrop-blur-md border-b border-[#E8E8E8]/30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <motion.button
                whileTap={{ scale: 0.95 }}
                aria-label="Back to dashboard"
                className="p-2 rounded-xl hover:bg-[#F4A261]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]"
              >
                <ChevronLeft className="w-5 h-5 text-[#3D3D3D]" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-2">
              <PawsyMascot
                mood={
                  isAnalyzing ? 'thinking' :
                  analysis?.urgency_level === 'emergency' ? 'alert' :
                  analysis?.urgency_level === 'urgent' ? 'concerned' :
                  analysis ? 'celebrating' :
                  photo ? 'listening' :
                  'happy'
                }
                size={36}
              />
              <div>
                <h1
                  className="text-lg font-bold text-[#3D3D3D]"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Photo Analysis
                </h1>
                <p className="text-xs text-[#6B6B6B]">AI-powered health check</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Usage Counter */}
        {!isEmergencyMode && !analysis && (
          <div className="mb-4">
            <UsageCounter
              type="photo"
              showUpgrade={true}
              onUpgrade={handleUpgrade}
            />
          </div>
        )}

        {/* Emergency Mode Banner */}
        {isEmergencyMode && !analysis && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-xs text-red-700 font-medium">
                Emergency Mode • {emergencyPhotosRemaining} emergency scans remaining
              </p>
            </div>
            <button
              onClick={() => setIsEmergencyMode(false)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Exit
            </button>
          </div>
        )}

        {/* Dog context pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-[#F4A261]/15 shadow-sm">
            <div className="w-5 h-5 rounded-full overflow-hidden border border-[#F4A261]/30 bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC] flex-shrink-0">
              {activeDog.photoUrl ? (
                <img
                  src={activeDog.photoUrl}
                  alt={activeDog.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Dog className="w-3 h-3 text-[#F4A261]" />
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-[#3D3D3D]">{activeDog.name}</span>
            <span className="text-xs text-[#9E9E9E]">•</span>
            <span className="text-xs text-[#6B6B6B]">{activeDog.breed}</span>
          </div>
        </motion.div>

        {/* Show analysis result if complete */}
        {analysis ? (
          <div className="space-y-4">
            <AnalysisResult
              analysis={analysis}
              imageUrl={photo?.preview}
              photo={photo}
              bodyArea={selectedAreaLabel}
              onReset={handleReset}
              profileBreed={activeDog?.breed}
            />

            {/* Premium hint after analysis */}
            <InlinePremiumHint
              variant="card"
              message={`Track ${activeDog?.name || 'your dog'}'s health over time with Premium. See patterns and share history with your vet.`}
              actionText="Track health"
              delay={0.3}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="w-full py-3 text-[#F4A261] font-semibold rounded-xl border-2 border-[#F4A261]/30 hover:bg-[#F4A261]/5 transition-colors"
            >
              Analyze Another Photo
            </motion.button>
          </div>
        ) : isAnalyzing ? (
          /* Show scan animation while analyzing */
          <ScanAnimation imageUrl={photo?.preview} />
        ) : (
          /* Show upload flow */
          <div className="space-y-6">
            {/* Photo uploader */}
            <PhotoUploader
              onPhotoSelect={setPhoto}
              selectedPhoto={photo}
              onClear={() => setPhoto(null)}
            />

            {/* Area selection - show after photo selected */}
            {photo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-md border border-[#F4A261]/10"
              >
                <h3
                  className="text-sm font-bold text-[#3D3D3D] mb-3"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  What area is affected?
                </h3>
                <div className="flex flex-wrap gap-2">
                  {BODY_AREAS.map((area) => (
                    <motion.button
                      key={area.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedArea(area.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedArea === area.id
                          ? 'bg-gradient-to-br from-[#F4A261] to-[#E8924F] text-white shadow-md'
                          : 'bg-[#FDF8F3] text-[#6B6B6B] border border-[#E8E8E8] hover:border-[#F4A261]/30'
                      }`}
                    >
                      {area.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Description - show after area selected */}
            {photo && selectedArea && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-md border border-[#F4A261]/10"
              >
                <h3
                  className="text-sm font-bold text-[#3D3D3D] mb-3"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Describe what you see (optional)
                </h3>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., red bump appeared yesterday, seems itchy..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#FDF8F3] border-2 border-[#E8E8E8] rounded-xl text-[#3D3D3D] placeholder:text-[#9E9E9E] focus:border-[#F4A261]/40 focus:outline-none transition-colors resize-none text-sm"
                />
              </motion.div>
            )}

            {/* Analyze button */}
            {photo && selectedArea && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <PawPrint className="w-5 h-5" />
                Analyze Photo
              </motion.button>
            )}

            {/* Error message */}
            {error && (
              <ErrorMessage
                type="generic"
                message={error}
                onRetry={handleAnalyze}
                onDismiss={() => setError(null)}
              />
            )}
          </div>
        )}
      </main>

      <BottomNav />

      {/* Usage Limit Modal */}
      <UsageLimitModal
        type="photo"
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onEmergency={() => {
          setShowLimitModal(false)
          setIsEmergencyMode(true)
        }}
        onUpgrade={handleUpgrade}
        emergencyRemaining={emergencyPhotosRemaining}
      />
    </div>
  )
}

export default PhotoAnalysis
