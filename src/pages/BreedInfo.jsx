import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  Search,
  Heart,
  Scale,
  Clock,
  AlertTriangle,
  ChevronRight,
  X,
  Activity,
  Bone,
  Dog
} from 'lucide-react'
import BottomNav from '../components/layout/BottomNav'
import PawsyMascot from '../components/mascot/PawsyMascot'
import InlinePremiumHint from '../components/common/InlinePremiumHint'
import { BREED_DATA } from '../constants/breeds'

const SEVERITY_CONFIG = {
  common: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Common' },
  moderate: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Moderate Risk' },
  serious: { color: 'text-red-600', bg: 'bg-red-100', label: 'Serious' },
}

const SIZE_FILTERS = [
  { id: 'all', label: 'All Sizes' },
  { id: 'Toy', label: 'Toy' },
  { id: 'Small', label: 'Small' },
  { id: 'Medium', label: 'Medium' },
  { id: 'Large', label: 'Large' },
]

const NUNITO_FONT = { fontFamily: 'Nunito, sans-serif' }

const FADE_UP = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const QUICK_STATS = [
  { key: 'weight', icon: Scale, label: 'Weight' },
  { key: 'lifespan', icon: Clock, label: 'Lifespan' },
  { key: 'energy', icon: Activity, label: 'Energy' },
  { key: 'size', icon: Bone, label: 'Size' },
]

function BreedInfo() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sizeFilter, setSizeFilter] = useState('all')
  const [selectedBreed, setSelectedBreed] = useState(null)
  const [hasViewedBreed, setHasViewedBreed] = useState(false)

  const handleBreedSelect = (breed) => {
    setSelectedBreed(breed)
    setHasViewedBreed(true)
  }

  const filteredBreeds = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return BREED_DATA.filter(breed =>
      breed.name.toLowerCase().includes(query) &&
      (sizeFilter === 'all' || breed.size.includes(sizeFilter))
    )
  }, [searchQuery, sizeFilter])

  if (selectedBreed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] pb-24">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#FDF8F3]/80 backdrop-blur-md border-b border-[#E8E8E8]/30">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedBreed(null)}
              className="p-2 rounded-xl hover:bg-[#F4A261]/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#3D3D3D]" />
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${selectedBreed.iconColor}20` }}>
                <Dog className="w-7 h-7" style={{ color: selectedBreed.iconColor }} />
              </div>
              <div>
                <h1
                  className="text-lg font-bold text-[#3D3D3D]"
                  style={NUNITO_FONT}
                >
                  {selectedBreed.name}
                </h1>
                <p className="text-xs text-[#6B6B6B]">{selectedBreed.group} Group</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-6">
          {/* Quick stats */}
          <motion.div {...FADE_UP} className="grid grid-cols-4 gap-2 mb-6">
            {QUICK_STATS.map(({ key, icon: Icon, label }) => (
              <div key={key} className="bg-white rounded-xl p-3 text-center border border-[#E8E8E8]/50">
                <Icon className="w-4 h-4 text-[#F4A261] mx-auto mb-1" />
                <p className="text-xs text-[#6B6B6B]">{label}</p>
                <p className="text-xs font-semibold text-[#3D3D3D]">{selectedBreed[key]}</p>
              </div>
            ))}
          </motion.div>

          {/* Description */}
          <motion.div
            {...FADE_UP}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 border border-[#E8E8E8]/50 mb-4"
          >
            <p className="text-sm text-[#6B6B6B]">{selectedBreed.description}</p>
          </motion.div>

          {/* Health Risks */}
          <motion.div
            {...FADE_UP}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 border border-[#E8E8E8]/50 mb-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-[#F4A261]" />
              <h3
                className="font-bold text-[#3D3D3D]"
                style={NUNITO_FONT}
              >
                Common Health Concerns
              </h3>
            </div>
            <div className="space-y-3">
              {selectedBreed.healthRisks.map((risk, idx) => {
                const config = SEVERITY_CONFIG[risk.severity]
                return (
                  <div key={idx} className="border-b border-[#E8E8E8]/50 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-[#3D3D3D]">{risk.condition}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B]">{risk.description}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Care Notes */}
          <motion.div
            {...FADE_UP}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#7EC8C8]/10 to-[#5FB3B3]/10 rounded-xl p-4 border border-[#7EC8C8]/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-[#7EC8C8]" />
              <h3
                className="font-bold text-[#3D3D3D]"
                style={NUNITO_FONT}
              >
                Care Notes
              </h3>
            </div>
            <p className="text-sm text-[#6B6B6B]">{selectedBreed.careNotes}</p>
          </motion.div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <Link to="/chat">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] text-white font-bold rounded-xl shadow-lg"
              >
                Ask Pawsy About {selectedBreed.name}s
              </motion.button>
            </Link>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedBreed(null)}
              className="w-full py-3 text-[#6B6B6B] font-semibold rounded-xl border-2 border-[#E8E8E8]"
            >
              Back to Breed List
            </motion.button>
          </div>
        </main>

        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FDF8F3]/80 backdrop-blur-md border-b border-[#E8E8E8]/30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/dashboard">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl hover:bg-[#F4A261]/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#3D3D3D]" />
            </motion.button>
          </Link>
          <div className="flex items-center gap-2">
            <PawsyMascot mood="happy" size={36} />
            <div>
              <h1
                className="text-lg font-bold text-[#3D3D3D]"
                style={NUNITO_FONT}
              >
                Breed Health Info
              </h1>
              <p className="text-xs text-[#6B6B6B]">Learn about breed-specific health</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search breeds..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-[#E8E8E8] rounded-xl text-[#3D3D3D] placeholder:text-[#9E9E9E] focus:border-[#F4A261]/40 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#E8E8E8]"
            >
              <X className="w-4 h-4 text-[#9E9E9E]" />
            </button>
          )}
        </div>

        {/* Size filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {SIZE_FILTERS.map(filter => (
            <motion.button
              key={filter.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSizeFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                sizeFilter === filter.id
                  ? 'bg-gradient-to-br from-[#F4A261] to-[#E8924F] text-white shadow-md'
                  : 'bg-white text-[#6B6B6B] border border-[#E8E8E8]'
              }`}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>

        {/* Breed list */}
        {filteredBreeds.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#E8E8E8]/50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[#9E9E9E]" />
            </div>
            <p className="text-[#6B6B6B]">No breeds found</p>
            <p className="text-sm text-[#9E9E9E] mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBreeds.map((breed, index) => (
              <motion.button
                key={breed.id}
                {...FADE_UP}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleBreedSelect(breed)}
                className="w-full bg-white rounded-xl p-4 border border-[#E8E8E8]/50 shadow-sm flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${breed.iconColor}20` }}>
                  <Dog className="w-5 h-5" style={{ color: breed.iconColor }} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-[#3D3D3D]">{breed.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#6B6B6B]">{breed.size}</span>
                    <span className="text-[#E8E8E8]">•</span>
                    <span className="text-xs text-[#6B6B6B]">{breed.lifespan}</span>
                    <span className="text-[#E8E8E8]">•</span>
                    <span className="text-xs text-[#9E9E9E]">{breed.healthRisks.length} health concerns</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9E9E9E]" />
              </motion.button>
            ))}
          </div>
        )}

        {/* Premium hint after browsing breeds */}
        {hasViewedBreed && (
          <div className="mt-6">
            <InlinePremiumHint
              variant="card"
              message="Build your dog's health profile and get AI responses tailored to their unique history."
              actionText="Start tracking"
              delay={0.2}
            />
          </div>
        )}

        {/* Note */}
        <p className="text-xs text-[#9E9E9E] text-center mt-8">
          Health information is for reference. Individual dogs may vary. Consult your vet for personalized advice.
        </p>
      </main>

      <BottomNav />
    </div>
  )
}

export default BreedInfo
