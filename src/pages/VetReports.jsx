import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronLeft, Dog, Lock, FileText, Calendar } from 'lucide-react'
import { useDog } from '../context/DogContext'
import { usePremium } from '../hooks/usePremium'
import { geminiService } from '../services/api/gemini'
import LocalStorageService from '../services/storage/LocalStorageService'
import { calculateAge } from '../services/prompts/chatPrompts'
import VetReportPreview from '../components/vetreport/VetReportPreview'
import PawsyMascot from '../components/mascot/PawsyMascot'
import ErrorMessage from '../components/common/ErrorMessage'
import { useToast } from '../context/ToastContext'

function buildHealthData(dog, dateRange) {
  if (!dog?.id) return {}

  const dogId = dog.id
  const now = new Date()
  const startDate = dateRange?.start ? new Date(dateRange.start) : new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const endDate = dateRange?.end ? new Date(dateRange.end) : now

  // Gather all health data sources
  const petFacts = LocalStorageService.getPetFacts(dogId) || []
  const xrays = LocalStorageService.getXrayAnalyses(dogId) || []
  const bloodWork = LocalStorageService.getBloodWorkAnalyses(dogId) || []
  const alerts = (LocalStorageService.getAlerts(dogId) || []).filter(
    (a) => a.status === 'active'
  )

  // Filter by date range
  const filterByDate = (items) => items.filter((item) => {
    const itemDate = new Date(item.createdAt)
    return itemDate >= startDate && itemDate <= endDate
  })

  // Format recent X-rays
  const recentXrays = filterByDate(xrays).slice(0, 5).map((x) => ({
    date: new Date(x.createdAt).toLocaleDateString(),
    bodyRegion: x.body_region || 'unknown',
    impression: x.overall_impression || 'unknown',
    keyFindings: (x.findings || [])
      .filter((f) => f.significance !== 'normal')
      .slice(0, 2)
      .map((f) => f.observation)
      .join('; '),
  }))

  // Format recent blood work
  const recentBloodWork = filterByDate(bloodWork).slice(0, 5).map((b) => ({
    date: new Date(b.createdAt).toLocaleDateString(),
    panelType: b.detected_panel_type || 'blood work',
    assessment: b.overall_assessment || 'unknown',
    abnormalValues: (b.values || [])
      .filter((v) => v.status !== 'normal')
      .slice(0, 3)
      .map((v) => v.name)
      .join(', '),
  }))

  // Format observations from pet facts
  const observations = filterByDate(petFacts).slice(0, 15).map((f) => ({
    date: new Date(f.createdAt).toLocaleDateString(),
    description: f.fact,
    category: f.category,
  }))

  return {
    age: calculateAge(dog.dateOfBirth),
    conditions: dog.conditions || dog.chronicConditions || [],
    medications: dog.medications || [],
    allergies: dog.allergies || [],
    recentXrays,
    recentBloodWork,
    observations,
    activeAlerts: alerts.slice(0, 5).map((a) => ({
      priority: a.priority,
      title: a.title,
      message: a.message,
    })),
  }
}

function VetReports() {
  const { activeDog, dogs, loading: dogsLoading } = useDog()
  const { isPremium } = usePremium()
  const { showToast } = useToast()

  const [report, setReport] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date()
    const start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000)
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    }
  })

  // Load cached report on mount
  useEffect(() => {
    if (activeDog?.id) {
      const cached = LocalStorageService.getVetReport?.(activeDog.id)
      if (cached) {
        setReport(cached)
      }
    }
  }, [activeDog?.id])

  const generateReport = useCallback(async () => {
    if (!activeDog) return

    setIsGenerating(true)
    setError(null)

    try {
      const healthData = buildHealthData(activeDog, dateRange)
      const result = await geminiService.generateVetReport(activeDog, healthData, {
        start: new Date(dateRange.start).toLocaleDateString(),
        end: new Date(dateRange.end).toLocaleDateString(),
      })

      if (result.error) {
        setError(result.message || 'Failed to generate vet report.')
        return
      }

      setReport(result)
      // Save to local storage if method exists
      LocalStorageService.saveVetReport?.(activeDog.id, result)
    } catch (err) {
      if (import.meta.env.DEV) console.error('Vet report error:', err)
      setError('Failed to generate vet report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [activeDog, dateRange])

  const handleCopy = () => {
    showToast?.({ type: 'success', message: 'Report copied to clipboard!' })
  }

  const handleShare = () => {
    showToast?.({ type: 'success', message: 'Report shared successfully!' })
  }

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
            Vet Reports is available to Premium subscribers. Generate professional health summaries to share with your veterinarian.
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
    return (
      <div className="bg-[#FDF8F3] flex items-center justify-center py-20">
        <div className="text-center max-w-sm">
          <Dog className="w-16 h-16 text-[#9E9E9E] mx-auto mb-4" />
          <p className="text-[#6B6B6B] mb-4">Add a dog profile first to generate vet reports.</p>
          <Link
            to="/add-dog"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-bold rounded-xl"
          >
            Add Dog Profile
          </Link>
        </div>
      </div>
    )
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
                  isGenerating ? 'thinking' :
                  report ? 'happy' :
                  'listening'
                }
                size={36}
              />
              <div>
                <h1
                  className="text-lg font-bold text-[#3D3D3D]"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Vet Reports
                </h1>
                <p className="text-xs text-[#6B6B6B]">Professional health summaries</p>
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

        {/* No report yet - show generate prompt */}
        {!report && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 text-center shadow-md border border-[#7EC8C8]/10"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#E0F2F2] to-[#C8E8E8] flex items-center justify-center">
              <FileText className="w-8 h-8 text-[#5FB3B3]" />
            </div>
            <h2
              className="text-lg font-bold text-[#2D2A26] mb-2"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Generate Vet Report
            </h2>
            <p className="text-sm text-[#6B6B6B] mb-6 leading-relaxed">
              Create a professional SOAP-style health report for {activeDog.name} that you can share with your veterinarian.
            </p>

            {/* Date Range Selector */}
            <div className="bg-[#FDF8F3] rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#F4A261]" />
                <span className="text-sm font-medium text-[#3D3D3D]">Report Period</span>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-[#6B6B6B] mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8E8E8] rounded-lg focus:outline-none focus:border-[#7EC8C8]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-[#6B6B6B] mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8E8E8] rounded-lg focus:outline-none focus:border-[#7EC8C8]"
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateReport}
              className="w-full py-3.5 bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              Generate Report
            </motion.button>
          </motion.div>
        )}

        {/* Generating state */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="w-full h-full border-4 border-[#7EC8C8]/30 border-t-[#7EC8C8] rounded-full animate-spin" />
            </div>
            <p className="text-[#6B6B6B] font-medium mb-2">Generating vet report...</p>
            <p className="text-xs text-[#9E9E9E]">This may take a moment</p>
          </motion.div>
        )}

        {/* Show report */}
        {report && !isGenerating && (
          <VetReportPreview
            report={report}
            onRegenerate={generateReport}
            isRegenerating={isGenerating}
            onCopy={handleCopy}
            onShare={handleShare}
          />
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4">
            <ErrorMessage
              type="generic"
              message={error}
              onRetry={generateReport}
              onDismiss={() => setError(null)}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default VetReports
