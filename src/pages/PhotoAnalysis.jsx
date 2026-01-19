import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Dog, PawPrint, Sparkles } from 'lucide-react'
import { useDog } from '../context/DogContext'
import { geminiService } from '../services/api/gemini'
import PhotoUploader from '../components/photo/PhotoUploader'
import ScanAnimation from '../components/photo/ScanAnimation'
import AnalysisResult from '../components/photo/AnalysisResult'
import BottomNav from '../components/layout/BottomNav'

const BODY_AREAS = [
  { id: 'skin', label: 'Skin/Coat' },
  { id: 'ear', label: 'Ear' },
  { id: 'eye', label: 'Eye' },
  { id: 'paw', label: 'Paw/Leg' },
  { id: 'mouth', label: 'Mouth/Teeth' },
  { id: 'nose', label: 'Nose' },
  { id: 'other', label: 'Other' },
]

function PhotoAnalysis() {
  const { activeDog, dogs } = useDog()
  const navigate = useNavigate()

  const [photo, setPhoto] = useState(null)
  const [selectedArea, setSelectedArea] = useState(null)
  const [description, setDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)

  // Redirect if no dogs
  if (dogs.length === 0) {
    navigate('/add-dog')
    return null
  }

  const handleAnalyze = async () => {
    if (!photo || !selectedArea) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const prompt = buildAnalysisPrompt()

      if (!geminiService.isConfigured()) {
        // Demo mode
        await new Promise(resolve => setTimeout(resolve, 3000))
        setAnalysis({
          summary: `Based on the photo of ${activeDog?.name || 'your dog'}'s ${selectedArea}, I can see the area you're concerned about. While I cannot make a definitive diagnosis from a photo alone, here are some observations.`,
          possibleConditions: ['Minor irritation', 'Allergic reaction', 'Dry skin'],
          severity: 'low',
          recommendations: [
            'Keep the area clean and dry',
            'Monitor for any changes over the next 24-48 hours',
            'Avoid letting your dog scratch or lick the area',
            'Consider a vet visit if symptoms persist or worsen',
          ],
          shouldSeeVet: false,
          urgency: 'routine',
        })
        setIsAnalyzing(false)
        return
      }

      const response = await geminiService.analyzePhoto(
        photo.base64Data,
        photo.mimeType,
        prompt
      )

      // Try to parse JSON response
      try {
        // Extract JSON from response (might be wrapped in markdown)
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setAnalysis(parsed)
        } else {
          // Fallback: create analysis from text response
          setAnalysis({
            summary: response,
            possibleConditions: [],
            severity: 'medium',
            recommendations: ['Consult with a veterinarian for proper diagnosis'],
            shouldSeeVet: true,
            urgency: 'soon',
          })
        }
      } catch {
        // If JSON parsing fails, use text response
        setAnalysis({
          summary: response,
          possibleConditions: [],
          severity: 'medium',
          recommendations: ['Consult with a veterinarian for proper diagnosis'],
          shouldSeeVet: true,
          urgency: 'soon',
        })
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Failed to analyze photo. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const buildAnalysisPrompt = () => {
    return `You are Pawsy, an AI veterinary assistant analyzing a photo for health concerns.

Dog Information:
- Name: ${activeDog?.name || 'Unknown'}
- Breed: ${activeDog?.breed || 'Unknown'}
- Known allergies: ${activeDog?.allergies?.join(', ') || 'None known'}

Photo Details:
- Affected area: ${selectedArea}
- Owner's description: "${description || 'No description provided'}"

Analyze this image and provide a JSON response with this exact structure:
{
  "summary": "Brief overview of what you observe (2-3 sentences)",
  "possibleConditions": ["condition1", "condition2", "condition3"],
  "severity": "low|medium|high|urgent",
  "recommendations": ["action1", "action2", "action3"],
  "shouldSeeVet": true or false,
  "urgency": "routine|soon|urgent|emergency"
}

Guidelines:
- Be thorough but err on the side of caution
- Consider the dog's known allergies
- If anything looks concerning, recommend veterinary attention
- Keep explanations simple and reassuring
- Never make definitive diagnoses, only suggest possibilities`
  }

  const handleReset = () => {
    setPhoto(null)
    setSelectedArea(null)
    setDescription('')
    setAnalysis(null)
    setError(null)
  }

  if (!activeDog) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="text-center">
          <Dog className="w-16 h-16 text-[#F4A261] mx-auto mb-4" />
          <p className="text-[#6B6B6B]">Loading...</p>
        </div>
      </div>
    )
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
                className="p-2 rounded-xl hover:bg-[#F4A261]/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#3D3D3D]" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F4A261] to-[#E8924F] flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
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
            <AnalysisResult analysis={analysis} imageUrl={photo?.preview} />
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

export default PhotoAnalysis
