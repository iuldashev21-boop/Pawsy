import { memo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, MapPin, X, ChevronDown, ChevronUp } from 'lucide-react'

const FIND_VET_URL = 'https://www.google.com/maps/search/24+hour+emergency+vet+near+me'

const HOTLINES = [
  {
    name: 'Pet Poison Helpline',
    number: '888-426-4435',
    hoverBg: 'hover:bg-purple-50',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
  },
  {
    name: 'ASPCA Poison Control',
    number: '888-426-4435',
    hoverBg: 'hover:bg-teal-50',
    iconBg: 'bg-teal-100',
    iconText: 'text-teal-600',
  },
]

function EmergencyOverlay({
  isActive,
  onDismiss,
}) {
  const [showContacts, setShowContacts] = useState(false)

  useEffect(() => {
    if (!isActive) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, onDismiss])

  const ExpandIcon = showContacts ? ChevronUp : ChevronDown

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
          <div role="alert" className="bg-white rounded-2xl shadow-md border border-red-100 overflow-hidden">
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
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open(FIND_VET_URL, '_blank')}
                  className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Find Vet</span>
                </motion.button>

                <button
                  onClick={onDismiss}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowContacts(!showContacts)}
              className="w-full px-4 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-100"
            >
              <span className="text-xs text-gray-600">Emergency hotlines</span>
              <ExpandIcon className="w-4 h-4 text-gray-400" />
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
                    {HOTLINES.map(({ name, number, hoverBg, iconBg, iconText }) => (
                      <button
                        key={name}
                        onClick={() => { window.location.href = `tel:${number}` }}
                        className={`w-full flex items-center justify-between p-2.5 bg-white rounded-lg ${hoverBg} transition-colors border border-gray-100`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center`}>
                            <Phone className={`w-4 h-4 ${iconText}`} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-800">{name}</p>
                            <p className="text-xs text-gray-500">{number}</p>
                          </div>
                        </div>
                        <span className={`text-xs ${iconText} font-medium`}>Call</span>
                      </button>
                    ))}
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

export default memo(EmergencyOverlay)
