import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  MapPin,
  Phone,
  Clock,
  Navigation,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Search,
  Star,
  Copy,
  Check
} from 'lucide-react'
import BottomNav from '../components/layout/BottomNav'
import PawsyMascot from '../components/mascot/PawsyMascot'

const VET_CLINICS = [
  { name: 'PetCare Emergency Hospital', type: '24-Hour Emergency' },
  { name: 'Animal Medical Center', type: '24-Hour Emergency' },
  { name: 'VCA Emergency Services', type: '24-Hour Emergency' },
  { name: 'BluePearl Pet Hospital', type: '24-Hour Emergency' },
  { name: 'Emergency Veterinary Clinic', type: '24-Hour Emergency' },
  { name: 'Pet Emergency Room', type: 'After Hours Emergency' },
  { name: 'City Animal Hospital', type: 'Extended Hours' },
  { name: 'Urgent Pet Care', type: 'After Hours Emergency' },
]

function generateSimulatedVets(coords) {
  return VET_CLINICS.map((clinic, index) => ({
    id: index + 1,
    ...clinic,
    address: `${100 + index * 50} Main Street`,
    distance: (0.5 + Math.random() * 8).toFixed(1),
    phone: `(555) ${100 + index}-${1000 + index * 111}`,
    rating: (3.5 + Math.random() * 1.5).toFixed(1),
    isOpen: index < 5,
    hours: index < 5 ? 'Open 24 hours' : 'Opens 6:00 PM',
    lat: coords.lat + (Math.random() - 0.5) * 0.1,
    lng: coords.lng + (Math.random() - 0.5) * 0.1,
  })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
}

function openInMaps(vet) {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${vet.lat},${vet.lng}`, '_blank')
}

function callVet(phone) {
  window.location.href = `tel:${phone.replace(/[^\d]/g, '')}`
}

function VetSection({ vets, label, dotClass, labelClass }) {
  if (vets.length === 0) return null
  return (
    <div className={label === 'Open Now' ? 'mb-6' : ''}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${dotClass}`} />
        <h3 className={`text-sm font-semibold ${labelClass}`}>{label} ({vets.length})</h3>
      </div>
      <div className="space-y-3">
        {vets.map((vet, index) => (
          <VetCard key={vet.id} vet={vet} index={index} onNavigate={() => openInMaps(vet)} onCall={() => callVet(vet.phone)} />
        ))}
      </div>
    </div>
  )
}

function EmergencyVet() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [vets, setVets] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setVets(generateSimulatedVets(coords))
        setLoading(false)
      },
      (locationErr) => {
        if (import.meta.env.DEV) console.error('Location error:', locationErr)
        setError('Unable to get your location. Please enable location services.')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [])

  useEffect(() => {
    fetchLocation() // eslint-disable-line react-hooks/set-state-in-effect -- Geolocation fetch on mount
  }, [fetchLocation])

  const handleRetry = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchLocation()
  }, [fetchLocation])

  const filteredVets = vets.filter(vet =>
    vet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vet.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openVets = filteredVets.filter(v => v.isOpen)
  const closedVets = filteredVets.filter(v => !v.isOpen)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#EF5350] to-[#E53935]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/dashboard">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </motion.button>
          </Link>
          <div className="flex items-center gap-2">
            <PawsyMascot mood="alert" size={36} />
            <div>
              <h1
                className="text-lg font-bold text-white"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Emergency Vets
              </h1>
              <p className="text-xs text-white/80">Find 24-hour care nearby</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Emergency tip */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-700">Emergency Tip</p>
              <p className="text-xs text-amber-600 mt-1">
                Call ahead so the clinic can prepare for your arrival. Describe symptoms briefly.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              <Loader2 className="w-10 h-10 text-[#F4A261]" />
            </motion.div>
            <p className="text-[#6B6B6B] mt-4">Finding emergency vets near you...</p>
            <p className="text-xs text-[#9E9E9E] mt-1">This may take a moment</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-[#3D3D3D] font-semibold">{error}</p>
            <p className="text-sm text-[#6B6B6B] mt-2">
              Please allow location access to find nearby vets
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRetry}
              className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-[#F4A261] text-white rounded-xl font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clinics..."
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#E8E8E8] rounded-xl text-[#3D3D3D] placeholder:text-[#9E9E9E] focus:border-[#EF5350]/40 focus:outline-none transition-colors"
              />
            </div>

            {/* Location indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                <MapPin className="w-4 h-4 text-[#EF5350]" />
                <span>Showing results near your location</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleRetry}
                className="p-2 rounded-lg hover:bg-[#E8E8E8]/50"
              >
                <RefreshCw className="w-4 h-4 text-[#6B6B6B]" />
              </motion.button>
            </div>

            <VetSection vets={openVets} label="Open Now" dotClass="bg-green-500 animate-pulse" labelClass="text-[#3D3D3D]" />
            <VetSection vets={closedVets} label="Currently Closed" dotClass="bg-gray-400" labelClass="text-[#6B6B6B]" />

            {filteredVets.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[#6B6B6B]">No clinics found matching your search</p>
              </div>
            )}
          </>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-[#9E9E9E] text-center mt-8">
          Clinic information shown is for demonstration. In a real emergency, search "emergency vet near me" or call your regular vet's emergency line.
        </p>
      </main>

      <BottomNav />
    </div>
  )
}

function VetCard({ vet, index, onNavigate, onCall }) {
  const [copied, setCopied] = useState(false)

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(vet.phone)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = vet.phone
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-xl p-4 border ${vet.isOpen ? 'border-green-200' : 'border-[#E8E8E8]'} shadow-sm`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-[#3D3D3D]">{vet.name}</h4>
          <p className="text-xs text-[#6B6B6B] mt-0.5">{vet.type}</p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-[#6B6B6B]">{vet.rating}</span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-[#6B6B6B] mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#9E9E9E]" />
          <span>{vet.address}</span>
          <span className="text-[#F4A261] font-medium">{vet.distance} mi</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#9E9E9E]" />
          <span className={vet.isOpen ? 'text-green-600 font-medium' : 'text-[#6B6B6B]'}>
            {vet.hours}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-[#9E9E9E]" />
          <span>{vet.phone}</span>
          <button
            onClick={copyPhone}
            className="ml-auto p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label={copied ? 'Copied!' : 'Copy phone number'}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-[#9E9E9E] hover:text-[#6B6B6B]" />
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onCall}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#EF5350] to-[#E53935] text-white font-semibold rounded-lg"
        >
          <Phone className="w-4 h-4" />
          Call
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onNavigate}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-[#E8E8E8] text-[#3D3D3D] font-semibold rounded-lg hover:bg-[#F4A261]/5"
        >
          <Navigation className="w-4 h-4" />
          Directions
        </motion.button>
      </div>
    </motion.div>
  )
}

export default EmergencyVet
