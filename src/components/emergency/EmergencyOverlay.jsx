import { motion, AnimatePresence } from 'framer-motion'
import { Phone, MapPin, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

/**
 * EmergencyOverlay - Gentle, supportive emergency assistance
 *
 * NOT intrusive - just a helpful banner with quick access to help
 * User can dismiss anytime and continue chatting
 */
export default function EmergencyOverlay({
  isActive,
  emergencySteps = [],
  dogName = 'your dog',
  onDismiss,
}) {
  const [showContacts, setShowContacts] = useState(false)

  const handleCall = (number) => {
    window.location.href = `tel:${number}`
  }

  const handleFindVet = () => {
    window.open('https://www.google.com/maps/search/24+hour+emergency+vet+near+me', '_blank')
  }

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="mx-4 mb-3"
        >
          <div className="bg-white rounded-2xl shadow-md border border-red-100 overflow-hidden">
            {/* Main banner - always visible */}
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  Need immediate help?
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Quick access to emergency resources
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Find Vet Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFindVet}
                  className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Find Vet</span>
                </motion.button>

                {/* Dismiss */}
                <button
                  onClick={onDismiss}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expandable contacts section */}
            <button
              onClick={() => setShowContacts(!showContacts)}
              className="w-full px-4 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-100"
            >
              <span className="text-xs text-gray-600">Emergency hotlines</span>
              {showContacts ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {showContacts && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 bg-gray-50 space-y-2">
                    {/* Pet Poison Helpline */}
                    <button
                      onClick={() => handleCall('888-426-4435')}
                      className="w-full flex items-center justify-between p-2.5 bg-white rounded-lg hover:bg-purple-50 transition-colors border border-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-800">Pet Poison Helpline</p>
                          <p className="text-xs text-gray-500">888-426-4435</p>
                        </div>
                      </div>
                      <span className="text-xs text-purple-600 font-medium">Call</span>
                    </button>

                    {/* ASPCA */}
                    <button
                      onClick={() => handleCall('888-426-4435')}
                      className="w-full flex items-center justify-between p-2.5 bg-white rounded-lg hover:bg-teal-50 transition-colors border border-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-teal-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-800">ASPCA Poison Control</p>
                          <p className="text-xs text-gray-500">888-426-4435</p>
                        </div>
                      </div>
                      <span className="text-xs text-teal-600 font-medium">Call</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
