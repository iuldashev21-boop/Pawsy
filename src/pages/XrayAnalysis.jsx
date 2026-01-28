import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Dog, PawPrint, Lock, Eye } from 'lucide-react'
import { useDog } from '../context/DogContext'
import { useUsage } from '../context/UsageContext'
import { usePremium } from '../hooks/usePremium'
import { geminiService } from '../services/api/gemini'
import LocalStorageService from '../services/storage/LocalStorageService'
import { runLabAnalysis as orchestrateLab } from '../services/orchestrator/analysisOrchestrator'
import LabUploader from '../components/lab/LabUploader'
import XrayResult from '../components/xray/XrayResult'
import XrayGallery from '../components/xray/XrayGallery'
import ScanAnimation from '../components/photo/ScanAnimation'
import PawsyMascot from '../components/mascot/PawsyMascot'
import ErrorMessage from '../components/common/ErrorMessage'

const BODY_REGIONS = [
  { id: 'thorax', label: 'Chest / Thorax' },
  { id: 'abdomen', label: 'Abdomen' },
  { id: 'limb', label: 'Limb / Extremity' },
  { id: 'spine', label: 'Spine' },
  { id: 'pelvis', label: 'Pelvis / Hip' },
  { id: 'skull', label: 'Skull / Head' },
  { id: 'whole_body', label: 'Whole Body' },
]

function buildDemoResult(activeDog, bodyRegion) {
  return {
    is_xray: true,
    detected_species: 'dog',
    image_quality: 'good',
    view_type: 'lateral',
    body_region: bodyRegion || 'thorax',
    overall_impression: 'normal',
    findings: [
      { structure: 'Heart', observation: 'Normal cardiac silhouette size and shape', significance: 'normal', location: 'midline' },
      { structure: 'Lungs', observation: 'Clear lung fields, no infiltrates or masses', significance: 'normal', location: 'bilateral' },
      { structure: 'Ribs', observation: 'All ribs intact, normal density', significance: 'normal', location: 'bilateral' },
    ],
    bone_assessment: 'All visible bones appear normal with appropriate density and alignment.',
    soft_tissue_assessment: 'Soft tissue structures appear within normal limits.',
    joint_assessment: 'Visible joint spaces appear normal.',
    foreign_body_detected: false,
    foreign_body_description: null,
    differential_diagnoses: [],
    additional_views_suggested: [],
    recommended_actions: ['No immediate concerns identified', 'Continue routine health monitoring'],
    summary: `${activeDog?.name || 'Your dog'}'s radiograph appears normal. Heart size, lung fields, and bony structures all look healthy.`,
    confidence: 'high',
  }
}

function XrayAnalysis() {
  const { activeDog, dogs, loading: dogsLoading } = useDog()
  const { canPhoto, usePhoto: consumePhoto } = useUsage()
  const { isPremium } = usePremium()
  const navigate = useNavigate()

  const [file, setFile] = useState(null)
  const [bodyRegion, setBodyRegion] = useState(null)
  const [notes, setNotes] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [pastAnalyses, setPastAnalyses] = useState(() =>
    activeDog ? LocalStorageService.getXrayAnalyses(activeDog.id) : []
  )
  const [selectedGalleryAnalysis, setSelectedGalleryAnalysis] = useState(null)

  const refreshPastAnalyses = useCallback(() => {
    if (activeDog) {
      setPastAnalyses(LocalStorageService.getXrayAnalyses(activeDog.id))
    }
  }, [activeDog])

  const selectedRegionLabel = BODY_REGIONS.find(r => r.id === bodyRegion)?.label || bodyRegion

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
            X-Ray Analysis is available to Premium subscribers. Upgrade to unlock AI-powered radiograph interpretation.
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
    if (!file || !bodyRegion) return

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
        result = buildDemoResult(activeDog, bodyRegion)
        // Demo mode: save locally without orchestrator
        LocalStorageService.saveXrayAnalysis(activeDog.id, {
          ...result,
          bodyRegion: selectedRegionLabel,
          notes,
        })
      } else {
        // Orchestrator handles: AI call → save → fact extraction → alerts
        // Pass 'X-Ray / Radiograph' as labType to route to specialized agent
        result = await orchestrateLab(
          activeDog,
          file.base64Data,
          file.mimeType,
          'X-Ray / Radiograph',
          notes
        )

        if (result.error) {
          setError(result.message || 'Failed to analyze X-ray. Please try again.')
          return
        }

        // Save to X-ray specific storage
        LocalStorageService.saveXrayAnalysis(activeDog.id, {
          ...result,
          bodyRegion: selectedRegionLabel,
          notes,
        })
      }

      setAnalysis(result)
      refreshPastAnalyses()
    } catch (err) {
      if (import.meta.env.DEV) console.error('X-ray analysis error:', err)
      setError('Failed to analyze X-ray. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setBodyRegion(null)
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
                  analysis?.overall_impression === 'critical' || analysis?.overall_impression === 'abnormal_urgent' ? 'concerned' :
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
                  X-Ray Analysis
                </h1>
                <p className="text-xs text-[#6B6B6B]">AI radiograph interpretation</p>
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
            <XrayResult analysis={selectedGalleryAnalysis} onReset={() => setSelectedGalleryAnalysis(null)} />
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
            <XrayResult analysis={analysis} onReset={handleReset} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="w-full py-3 text-[#5FB3B3] font-semibold rounded-xl border-2 border-[#7EC8C8]/30 hover:bg-[#7EC8C8]/5 transition-colors"
            >
              Analyze Another X-Ray
            </motion.button>
          </div>
        ) : isAnalyzing ? (
          <ScanAnimation imageUrl={file?.preview} />
        ) : (
          /* Upload flow */
          <div className="space-y-6">
            {/* Info card */}
            <div className="bg-gradient-to-br from-[#E0F2F2] to-[#C8E8E8] rounded-2xl p-4 border border-[#7EC8C8]/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-[#5FB3B3]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D2A26] mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    X-Ray Analysis
                  </h3>
                  <p className="text-xs text-[#3D3D3D] leading-relaxed">
                    Upload your dog's X-ray or radiograph for AI-powered interpretation. Our analysis covers bone structure, soft tissue, and potential abnormalities.
                  </p>
                </div>
              </div>
            </div>

            {/* X-ray uploader */}
            <LabUploader
              onFileSelect={setFile}
              selectedFile={file}
              onClear={() => setFile(null)}
            />

            {/* Body region selection */}
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
                  What body region is shown?
                </h3>
                <div className="flex flex-wrap gap-2">
                  {BODY_REGIONS.map((region) => (
                    <motion.button
                      key={region.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setBodyRegion(region.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        bodyRegion === region.id
                          ? 'bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] text-white shadow-md'
                          : 'bg-[#FDF8F3] text-[#6B6B6B] border border-[#E8E8E8] hover:border-[#7EC8C8]/30'
                      }`}
                    >
                      {region.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Notes */}
            {file && bodyRegion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-md border border-[#7EC8C8]/10"
              >
                <h3
                  className="text-sm font-bold text-[#3D3D3D] mb-3"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Clinical context (optional)
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g., post-injury evaluation, checking for hip dysplasia, pre-surgery assessment..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#FDF8F3] border-2 border-[#E8E8E8] rounded-xl text-[#3D3D3D] placeholder:text-[#9E9E9E] focus:border-[#7EC8C8]/40 focus:outline-none transition-colors resize-none text-sm"
                />
              </motion.div>
            )}

            {/* Analyze button */}
            {file && bodyRegion && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <PawPrint className="w-5 h-5" />
                Analyze X-Ray
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
            <XrayGallery
              analyses={pastAnalyses}
              onSelect={handleGallerySelect}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default XrayAnalysis
