import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronLeft, Dog, Lock, Pill } from 'lucide-react'
import { useDog } from '../context/DogContext'
import { usePremium } from '../hooks/usePremium'
import MedicationManager from '../components/premium/MedicationManager'
import PawsyMascot from '../components/mascot/PawsyMascot'

function Medications() {
  const { activeDog, dogs, loading: dogsLoading, updateDog } = useDog()
  const { isPremium } = usePremium()

  const handleAddMedication = (med) => {
    if (!activeDog) return
    const meds = [...(activeDog.medications || []), med]
    updateDog(activeDog.id, { medications: meds })
  }

  const handleRemoveMedication = (medId) => {
    if (!activeDog) return
    const meds = (activeDog.medications || []).filter((m) => m.id !== medId)
    updateDog(activeDog.id, { medications: meds })
  }

  // Gate: Premium only
  if (!isPremium) {
    return (
      <div className="bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC] flex items-center justify-center">
            <Lock className="w-8 h-8 text-[#F4A261]" />
          </div>
          <h2
            className="text-xl font-bold text-[#2D2A26] mb-2"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Premium Feature
          </h2>
          <p className="text-sm text-[#6B6B6B] mb-4">
            Medication tracking is available to Premium subscribers. Track dosages, schedules, and never miss a dose.
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
          <p className="text-[#6B6B6B] mb-4">Add a dog profile first to track medications.</p>
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
    <div className="bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] min-h-screen">
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
              <PawsyMascot mood="happy" size={36} />
              <div>
                <h1
                  className="text-lg font-bold text-[#3D3D3D]"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Medications
                </h1>
                <p className="text-xs text-[#6B6B6B]">Track medications & schedules</p>
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
                <img src={activeDog.photoUrl} alt={activeDog.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Dog className="w-3 h-3 text-[#F4A261]" />
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-[#3D3D3D]">{activeDog.name}</span>
            <span className="text-xs text-[#9E9E9E]">&bull;</span>
            <span className="text-xs text-[#6B6B6B]">{activeDog.breed}</span>
          </div>
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 mb-6 border border-[#F4A261]/10"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)' }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC] flex items-center justify-center flex-shrink-0">
              <Pill className="w-5 h-5 text-[#F4A261]" aria-hidden="true" />
            </div>
            <div>
              <h3
                className="font-bold text-[#3D3D3D] mb-1"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Medication Tracking
              </h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                Keep track of {activeDog.name}&apos;s medications, dosages, and schedules. This information helps Pawsy provide more personalized health advice.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Medication manager */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MedicationManager
            medications={activeDog.medications || []}
            onAdd={handleAddMedication}
            onRemove={handleRemoveMedication}
          />
        </motion.div>
      </main>
    </div>
  )
}

export default Medications
