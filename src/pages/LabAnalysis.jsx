import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Dog, PawPrint, Lock } from 'lucide-react'
import { useDog } from '../context/DogContext'
import { useUsage } from '../context/UsageContext'
import { usePremium } from '../hooks/usePremium'
import { geminiService } from '../services/api/gemini'
import LocalStorageService from '../services/storage/LocalStorageService'
import LabUploader from '../components/lab/LabUploader'
import LabResult from '../components/lab/LabResult'
import LabGallery from '../components/lab/LabGallery'
import ScanAnimation from '../components/photo/ScanAnimation'
import PawsyMascot from '../components/mascot/PawsyMascot'
import ErrorMessage from '../components/common/ErrorMessage'

const LAB_TYPES = [
  { id: 'blood_work', label: 'Blood Work (CBC / Chemistry)' },
  { id: 'xray', label: 'X-Ray / Radiograph' },
  { id: 'urinalysis', label: 'Urinalysis' },
  { id: 'other', label: 'Other Lab Report' },
]

function buildDemoResult(activeDog, labTypeLabel) {
  return {
    is_lab_report: true,
    detected_type: 'blood_work',
    readability: 'clear',
    readability_note: null,
    values: [
      { name: 'WBC', value: '12.5', unit: 'x10³/µL', reference_range: '5.5-16.9', status: 'normal', interpretation: 'White blood cell count within normal range.' },
      { name: 'RBC', value: '7.2', unit: 'x10⁶/µL', reference_range: '5.5-8.5', status: 'normal', interpretation: 'Red blood cell count normal.' },
      { name: 'ALT', value: '85', unit: 'U/L', reference_range: '10-125', status: 'normal', interpretation: 'Liver enzyme within normal limits.' },
      { name: 'BUN', value: '32', unit: 'mg/dL', reference_range: '7-27', status: 'high', interpretation: 'Blood urea nitrogen slightly elevated. May indicate dehydration or early kidney concern.' },
    ],
    overall_assessment: 'needs_attention',
    summary: `${activeDog?.name || 'Your dog'}'s ${labTypeLabel || 'lab'} results show mostly normal values with one slightly elevated marker (BUN). This may warrant monitoring.`,
    key_findings: [
      'Most values within normal canine reference ranges',
      'BUN slightly elevated at 32 mg/dL (normal: 7-27)',
      'Liver and kidney enzymes otherwise normal',
    ],
    abnormal_count: 1,
    possible_conditions: ['Mild dehydration', 'Early kidney changes'],
    recommended_actions: [
      'Ensure adequate water intake',
      'Recheck BUN in 2-4 weeks',
      'Discuss with veterinarian at next visit',
    ],
    additional_tests_suggested: ['SDMA (kidney marker)', 'Urinalysis for kidney function'],
    should_see_vet: true,
    vet_urgency: 'routine_checkup',
    confidence: 'medium',
  }
}

function LabAnalysis() {
  const { activeDog, dogs, loading: dogsLoading } = useDog()
  const { canPhoto, usePhoto: consumePhoto } = useUsage()
  const { isPremium } = usePremium()
  const navigate = useNavigate()

  const [file, setFile] = useState(null)
  const [labType, setLabType] = useState(null)
  const [notes, setNotes] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [pastAnalyses, setPastAnalyses] = useState(() =>
    activeDog ? LocalStorageService.getLabAnalyses(activeDog.id) : []
  )
  const [selectedGalleryAnalysis, setSelectedGalleryAnalysis] = useState(null)

  const refreshPastAnalyses = useCallback(() => {
    if (activeDog) {
      setPastAnalyses(LocalStorageService.getLabAnalyses(activeDog.id))
    }
  }, [activeDog])

  const selectedLabTypeLabel = LAB_TYPES.find(t => t.id === labType)?.label || labType

  // Gate: Premium only
  if (!isPremium) {
    return (
      <div className="bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC] flex items-center justify-center">
            <Lock className="w-8 h-8 text-[#F4A261]" />
          </div>
          <h2 className="text-xl font-bold text-[#2D2A26] mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Premium Feature
          </h2>
          <p className="text-sm text-[#6B6B6B] mb-4">
            Lab Analysis is available to Premium subscribers. Upgrade to unlock AI-powered interpretation of X-rays, blood work, and lab reports.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('pawsy:openUpgrade'))}
            className="px-6 py-3 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-bold rounded-xl shadow-md"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    )
  }

  if (dogsLoading || !activeDog) {
    return (
      <div className="bg-[#FDF8F3] flex items-center justify-center py-20">
        <div className="text-center">
          <Dog className="w-16 h-16 text-[#7EC8C8] mx-auto mb-4 animate-pulse" />
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
    if (!file || !labType) return

    if (!canPhoto) {
      setError('Daily analysis limit reached. Try again tomorrow.')
      return
    }

    consumePhoto()
    setIsAnalyzing(true)
    setError(null)

    try {
      let result

      if (!geminiService.isConfigured()) {
        await new Promise(resolve => setTimeout(resolve, 3000))
        result = buildDemoResult(activeDog, selectedLabTypeLabel)
      } else {
        const response = await geminiService.analyzeLab(
          file.base64Data,
          file.mimeType,
          activeDog,
          selectedLabTypeLabel,
          notes
        )

        if (response.error) {
          setError(response.message || 'Failed to analyze lab report. Please try again.')
          return
        }

        result = response
      }

      setAnalysis(result)

      LocalStorageService.saveLabAnalysis(activeDog.id, {
        ...result,
        labType: selectedLabTypeLabel,
        notes,
      })
      refreshPastAnalyses()
    } catch (err) {
      if (import.meta.env.DEV) console.error('Lab analysis error:', err)
      setError('Failed to analyze lab report. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setLabType(null)
    setNotes('')
    setAnalysis(null)
    setError(null)
    setSelectedGalleryAnalysis(null)
  }

  const handleGallerySelect = (galleryAnalysis) => {
    setSelectedGalleryAnalysis(galleryAnalysis)
    setAnalysis(null)
  }

  return (
    <div className="bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED]">
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
                  analysis?.overall_assessment === 'concerning' ? 'concerned' :
                  analysis ? 'celebrating' :
                  file ? 'listening' :
                  'happy'
                }
                size={36}
              />
              <div>
                <h1
                  className="text-lg font-bold text-[#3D3D3D]"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Lab Analysis
                </h1>
                <p className="text-xs text-[#6B6B6B]">AI-powered lab interpretation</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Dog context pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-[#7EC8C8]/15 shadow-sm">
            <div className="w-5 h-5 rounded-full overflow-hidden border border-[#7EC8C8]/30 bg-gradient-to-br from-[#E0F2F2] to-[#C8E8E8] flex-shrink-0">
              {activeDog.photoUrl ? (
                <img src={activeDog.photoUrl} alt={activeDog.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Dog className="w-3 h-3 text-[#5FB3B3]" />
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-[#3D3D3D]">{activeDog.name}</span>
            <span className="text-xs text-[#9E9E9E]">&bull;</span>
            <span className="text-xs text-[#6B6B6B]">{activeDog.breed}</span>
          </div>
        </motion.div>

        {/* Show gallery-selected analysis */}
        {selectedGalleryAnalysis && !analysis && (
          <div className="space-y-4 mb-6">
            <LabResult analysis={selectedGalleryAnalysis} onReset={() => setSelectedGalleryAnalysis(null)} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedGalleryAnalysis(null)}
              className="w-full py-3 text-[#5FB3B3] font-semibold rounded-xl border-2 border-[#7EC8C8]/30 hover:bg-[#7EC8C8]/5 transition-colors"
            >
              Back to Gallery
            </motion.button>
          </div>
        )}

        {/* Show analysis result */}
        {analysis ? (
          <div className="space-y-4">
            <LabResult analysis={analysis} onReset={handleReset} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="w-full py-3 text-[#5FB3B3] font-semibold rounded-xl border-2 border-[#7EC8C8]/30 hover:bg-[#7EC8C8]/5 transition-colors"
            >
              Analyze Another Report
            </motion.button>
          </div>
        ) : isAnalyzing ? (
          <ScanAnimation imageUrl={file?.preview} />
        ) : (
          /* Upload flow */
          <div className="space-y-6">
            {/* Lab uploader */}
            <LabUploader
              onFileSelect={setFile}
              selectedFile={file}
              onClear={() => setFile(null)}
            />

            {/* Lab type selection */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-md border border-[#7EC8C8]/10"
              >
                <h3
                  className="text-sm font-bold text-[#3D3D3D] mb-3"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  What type of report is this?
                </h3>
                <div className="flex flex-wrap gap-2">
                  {LAB_TYPES.map((type) => (
                    <motion.button
                      key={type.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLabType(type.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        labType === type.id
                          ? 'bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] text-white shadow-md'
                          : 'bg-[#FDF8F3] text-[#6B6B6B] border border-[#E8E8E8] hover:border-[#7EC8C8]/30'
                      }`}
                    >
                      {type.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Notes */}
            {file && labType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-md border border-[#7EC8C8]/10"
              >
                <h3
                  className="text-sm font-bold text-[#3D3D3D] mb-3"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Additional context (optional)
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g., pre-surgery blood panel, routine checkup, investigating lethargy..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#FDF8F3] border-2 border-[#E8E8E8] rounded-xl text-[#3D3D3D] placeholder:text-[#9E9E9E] focus:border-[#7EC8C8]/40 focus:outline-none transition-colors resize-none text-sm"
                />
              </motion.div>
            )}

            {/* Analyze button */}
            {file && labType && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <PawPrint className="w-5 h-5" />
                Analyze Report
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

        {/* Past Analyses Gallery */}
        {!selectedGalleryAnalysis && (
          <div className="mt-8">
            <LabGallery
              analyses={pastAnalyses}
              onSelect={handleGallerySelect}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default LabAnalysis
