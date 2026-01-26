import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, Plus } from 'lucide-react'
import { useDog } from '../context/DogContext'
import HealthTimelineComponent from '../components/health/HealthTimeline'
import BottomNav from '../components/layout/BottomNav'

/**
 * HealthTimeline Page - Full view of health event history
 */
function HealthTimeline() {
  const { activeDog } = useDog()
  const prefersReducedMotion = useReducedMotion()

  // In a real app, this would come from a health events context/API
  // For now, use mock data with relative date descriptions
  const mockEvents = useMemo(() => [
    {
      id: '1',
      type: 'chat',
      title: 'Scratching ears frequently',
      summary: 'Asked about ear scratching behavior. Recommended monitoring for signs of infection.',
      urgency: 'low',
      timestamp: '2026-01-23T14:30:00Z', // 2 days ago
      symptoms: ['Scratching', 'Head shaking'],
    },
    {
      id: '2',
      type: 'photo',
      title: 'Skin rash analysis',
      summary: 'Photo of red patch on belly analyzed. Likely mild irritation, monitor for changes.',
      urgency: 'moderate',
      timestamp: '2026-01-20T10:15:00Z', // 5 days ago
      symptoms: ['Redness', 'Mild swelling'],
    },
    {
      id: '3',
      type: 'symptom',
      title: 'Decreased appetite',
      summary: 'Reported eating less than usual for 2 days. Suggested vet visit if continues.',
      urgency: 'moderate',
      timestamp: '2026-01-18T16:45:00Z', // 7 days ago
      symptoms: ['Reduced eating', 'Less energy'],
    },
  ], [])

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FDF8F3]/80 backdrop-blur-md border-b border-[#E8E8E8]/30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/dashboard"
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#E8E8E8] flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-[#6B6B6B]" aria-hidden="true" />
          </Link>
          <div className="flex-1">
            <h1
              className="text-lg font-bold text-[#3D3D3D]"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Health Timeline
            </h1>
            <p className="text-xs text-[#6B6B6B]">
              {activeDog?.name ? `${activeDog.name}'s health history` : 'Track health events'}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.main
        {...animationProps}
        className="max-w-lg mx-auto px-4 py-4"
      >
        {/* Timeline Component */}
        <HealthTimelineComponent
          events={mockEvents}
          dogName={activeDog?.name || 'your dog'}
        />

        {/* Premium Feature Hint */}
        <motion.div
          {...(prefersReducedMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 } })}
          className="mt-4 bg-gradient-to-br from-[#FFF8E7] to-[#FFE4B5] rounded-xl p-4 border border-[#E8B855]/30"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#F4D35E]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-[#D4A012]" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Full Health History
              </h3>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Upgrade to Premium to save unlimited health events and generate reports for your vet.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          {...(prefersReducedMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 } })}
          className="mt-4"
        >
          <h3 className="text-sm font-semibold text-[#3D3D3D] mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Log a Health Event
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/chat"
              className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm border border-[#E8E8E8] hover:bg-gray-50 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            >
              <div className="w-8 h-8 bg-[#7EC8C8]/10 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-[#7EC8C8]" aria-hidden="true" />
              </div>
              <span className="text-xs font-medium text-[#3D3D3D]">Chat about symptoms</span>
            </Link>
            <Link
              to="/photo"
              className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm border border-[#E8E8E8] hover:bg-gray-50 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            >
              <div className="w-8 h-8 bg-[#F4A261]/10 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-[#F4A261]" aria-hidden="true" />
              </div>
              <span className="text-xs font-medium text-[#3D3D3D]">Analyze a photo</span>
            </Link>
          </div>
        </motion.div>
      </motion.main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

export default HealthTimeline
