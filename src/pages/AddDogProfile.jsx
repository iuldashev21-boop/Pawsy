import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Dog, Camera, ArrowRight, ArrowLeft, Check, Sparkles,
  Calendar, Weight, Heart, AlertCircle, X, Plus, ChevronDown, Search, PawPrint
} from 'lucide-react'
import { useDog } from '../context/DogContext'
import { useAuth } from '../context/AuthContext'

const BREEDS = [
  'Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'Bulldog',
  'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer',
  'Dachshund', 'Siberian Husky', 'Great Dane', 'Shih Tzu', 'Chihuahua',
  'Pomeranian', 'Border Collie', 'Australian Shepherd', 'Cocker Spaniel',
  'Mixed Breed', 'Other'
]

const COMMON_ALLERGIES = [
  'Chicken', 'Beef', 'Dairy', 'Wheat', 'Soy', 'Corn', 'Eggs', 'Fish', 'Lamb'
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Custom Searchable Dropdown Component
function BreedDropdown({ value, onChange, breeds }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef(null)

  const filteredBreeds = breeds.filter(breed =>
    breed.toLowerCase().includes(search.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (breed) => {
    onChange(breed)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl text-left flex items-center justify-between transition-all duration-200 ${
          isOpen ? 'border-[#F4A261] ring-2 ring-[#F4A261]/20' : 'border-[#E8E8E8] hover:border-[#F4A261]/50'
        }`}
      >
        <span className={value ? 'text-[#3D3D3D]' : 'text-[#9E9E9E]'}>
          {value || 'Select breed...'}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-[#9E9E9E]" />
        </motion.div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border-2 border-[#E8E8E8] rounded-xl shadow-lg overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-[#E8E8E8]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search breeds..."
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FDF8F3] border border-[#E8E8E8] rounded-lg text-[#3D3D3D] text-sm placeholder:text-[#9E9E9E] focus:border-[#F4A261] focus:ring-1 focus:ring-[#F4A261]/20 outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredBreeds.length > 0 ? (
                filteredBreeds.map((breed) => (
                  <button
                    key={breed}
                    type="button"
                    onClick={() => handleSelect(breed)}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                      value === breed
                        ? 'bg-[#F4A261]/10 text-[#F4A261] font-medium'
                        : 'text-[#3D3D3D] hover:bg-[#FDF8F3]'
                    }`}
                  >
                    {breed}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-[#9E9E9E] text-center">
                  No breeds found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Custom Date Picker Component
function DatePicker({ value, onChange }) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  // Parse existing value or use empty
  const parseDate = (dateStr) => {
    if (!dateStr) return { month: '', day: '', year: '' }
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return { month: '', day: '', year: '' }
    return {
      month: String(date.getMonth()),
      day: String(date.getDate()),
      year: String(date.getFullYear())
    }
  }

  const [dateParts, setDateParts] = useState(() => parseDate(value))

  const handleChange = (part, val) => {
    const newParts = { ...dateParts, [part]: val }
    setDateParts(newParts)

    // Only emit if we have all parts
    if (newParts.month !== '' && newParts.day && newParts.year) {
      const date = new Date(
        parseInt(newParts.year),
        parseInt(newParts.month),
        parseInt(newParts.day)
      )
      onChange(date.toISOString().split('T')[0])
    } else if (!newParts.month && !newParts.day && !newParts.year) {
      onChange('')
    }
  }

  const selectBaseClass = "flex-1 px-3 py-3.5 bg-white border-2 border-[#E8E8E8] rounded-xl text-[#3D3D3D] focus:border-[#F4A261] focus:ring-2 focus:ring-[#F4A261]/20 outline-none transition-all duration-200 appearance-none cursor-pointer"

  return (
    <div className="flex gap-3">
      {/* Month */}
      <div className="flex-1 relative">
        <select
          value={dateParts.month}
          onChange={(e) => handleChange('month', e.target.value)}
          className={selectBaseClass}
        >
          <option value="">Month</option>
          {MONTHS.map((month, idx) => (
            <option key={month} value={idx}>{month}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E] pointer-events-none" />
      </div>

      {/* Day */}
      <div className="w-24 relative">
        <select
          value={dateParts.day}
          onChange={(e) => handleChange('day', e.target.value)}
          className={selectBaseClass}
        >
          <option value="">Day</option>
          {days.map((day) => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E] pointer-events-none" />
      </div>

      {/* Year */}
      <div className="w-28 relative">
        <select
          value={dateParts.year}
          onChange={(e) => handleChange('year', e.target.value)}
          className={selectBaseClass}
        >
          <option value="">Year</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E] pointer-events-none" />
      </div>
    </div>
  )
}

const fadeVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    }
  },
}

function AddDogProfile() {
  const [step, setStep] = useState(1)
  const [isComplete, setIsComplete] = useState(false)
  const [dogData, setDogData] = useState({
    name: '',
    photoUrl: '',
    breed: '',
    customBreed: '',
    dateOfBirth: '',
    gender: 'male',
    weight: '',
    weightUnit: 'lbs',
    allergies: [],
  })
  const [customAllergy, setCustomAllergy] = useState('')
  const fileInputRef = useRef(null)

  const { addDog } = useDog()
  const { user } = useAuth()
  const navigate = useNavigate()

  const totalSteps = 4

  const updateDogData = (field, value) => {
    setDogData(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateDogData('photoUrl', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const addAllergy = (allergy) => {
    if (!dogData.allergies.includes(allergy)) {
      updateDogData('allergies', [...dogData.allergies, allergy])
    }
  }

  const removeAllergy = (allergy) => {
    updateDogData('allergies', dogData.allergies.filter(a => a !== allergy))
  }

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !dogData.allergies.includes(customAllergy.trim())) {
      addAllergy(customAllergy.trim())
      setCustomAllergy('')
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return dogData.name.trim().length > 0
      case 2:
        // If "Other" is selected, require customBreed to be filled
        if (dogData.breed === 'Other') {
          return dogData.customBreed.trim().length > 0
        }
        return dogData.breed.length > 0
      case 3: return dogData.weight > 0
      case 4: return true
      default: return false
    }
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = () => {
    // Use customBreed if "Other" was selected
    const finalBreed = dogData.breed === 'Other' ? dogData.customBreed.trim() : dogData.breed

    const newDog = addDog({
      ...dogData,
      breed: finalBreed,
      userId: user?.id,
      weight: parseFloat(dogData.weight) || 0,
      size: calculateSize(parseFloat(dogData.weight), dogData.weightUnit),
      chronicConditions: [],
      medications: [],
      vaccinations: [],
      dietType: 'dry',
      feedingSchedule: 'twice daily',
    })
    setIsComplete(true)
  }

  const calculateSize = (weight, unit) => {
    const weightInLbs = unit === 'kg' ? weight * 2.205 : weight
    if (weightInLbs < 20) return 'small'
    if (weightInLbs < 50) return 'medium'
    if (weightInLbs < 90) return 'large'
    return 'giant'
  }

  const handleFinish = () => {
    navigate('/dashboard')
  }

  // Completion screen with wow factor
  if (isComplete) {
    // Generate random particles for celebration effect
    const particles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      size: 8 + Math.random() * 16,
      color: ['#F4A261', '#7EC8C8', '#FFD54F', '#81C784', '#FFB380'][Math.floor(Math.random() * 5)]
    }))

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFE8D6] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Celebration particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              left: `${particle.x}%`,
              top: '-20px',
            }}
            initial={{ y: -20, opacity: 0, scale: 0 }}
            animate={{
              y: ['0vh', '100vh'],
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0.5],
              rotate: [0, 360],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: 'easeOut',
              repeat: Infinity,
              repeatDelay: Math.random() * 2,
            }}
          />
        ))}

        {/* Floating paw prints */}
        <motion.div
          className="absolute top-10 left-10"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PawPrint className="w-12 h-12 text-[#F4A261]" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10"
          animate={{ y: [0, 15, 0], rotate: [0, -10, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <PawPrint className="w-10 h-10 text-[#7EC8C8]" />
        </motion.div>
        <motion.div
          className="absolute top-1/4 right-20"
          animate={{ y: [0, -15, 0], rotate: [0, -5, 0], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <PawPrint className="w-8 h-8 text-[#FFD54F]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md relative z-10"
        >
          {/* Dog photo hero */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="relative inline-block mb-8"
          >
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC]">
              {dogData.photoUrl ? (
                <img src={dogData.photoUrl} alt={dogData.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Dog className="w-20 h-20 text-[#F4A261]" />
                </div>
              )}
            </div>

            {/* Sparkle decorations */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute -top-2 -right-2 w-10 h-10 bg-[#FFD54F] rounded-full flex items-center justify-center shadow-lg"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 }}
              className="absolute -bottom-1 -left-3 w-8 h-8 bg-[#81C784] rounded-full flex items-center justify-center shadow-lg"
            >
              <Heart className="w-4 h-4 text-white" />
            </motion.div>
          </motion.div>

          {/* AI message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1
              className="text-3xl md:text-4xl font-bold text-[#3D3D3D] mb-4"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Nice to meet you, {dogData.name}!
            </h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-[#F4A261]/20 mb-8"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <p className="text-[#3D3D3D] text-left">
                  I'll take care of <span className="font-semibold text-[#F4A261]">{dogData.name}</span>!
                  I've learned about {dogData.gender === 'male' ? 'his' : 'her'} breed, weight, and health needs.
                  Now I can give you personalized advice whenever you're worried.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Continue button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={handleFinish}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-xl shadow-lg text-lg flex items-center justify-center gap-2 mx-auto"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] via-[#FDF8F3] to-[#FFE8D6]/30 flex flex-col relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top left paw */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, 0],
            opacity: [0.06, 0.1, 0.06]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-4 -left-8"
        >
          <PawPrint className="w-32 h-32 text-[#F4A261]" />
        </motion.div>

        {/* Top right paw */}
        <motion.div
          animate={{
            y: [0, 10, 0],
            rotate: [0, -8, 0],
            opacity: [0.04, 0.08, 0.04]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-20 -right-10"
        >
          <PawPrint className="w-40 h-40 text-[#7EC8C8]" />
        </motion.div>

        {/* Bottom left paw */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, -5, 0],
            opacity: [0.05, 0.09, 0.05]
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-32 -left-12"
        >
          <PawPrint className="w-36 h-36 text-[#7EC8C8]" />
        </motion.div>

        {/* Bottom right paw */}
        <motion.div
          animate={{
            y: [0, 12, 0],
            rotate: [0, 10, 0],
            opacity: [0.04, 0.07, 0.04]
          }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute bottom-20 -right-8"
        >
          <PawPrint className="w-28 h-28 text-[#F4A261]" />
        </motion.div>

        {/* Subtle gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#F4A261]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#7EC8C8]/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F4A261] to-[#E8924F] flex items-center justify-center shadow-md">
            <Dog className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Pawsy
          </span>
        </div>

        {/* Progress bar and mini avatar */}
        <div className="flex items-center gap-3">
          {/* Mini dog avatar - appears after photo upload */}
          <AnimatePresence>
            {dogData.photoUrl && step > 1 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#F4A261] shadow-sm"
              >
                <img src={dogData.photoUrl} alt={dogData.name} className="w-full h-full object-cover" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated progress bar */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-[#9E9E9E] mr-1">{step}/4</span>
            <div className="w-24 h-2 bg-[#E8E8E8] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#F4A261] to-[#E8924F] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Form content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {/* Step 1: Name and Photo */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8"
              >
                <motion.div variants={staggerItem} className="text-center">
                  <h1
                    className="text-3xl font-bold text-[#3D3D3D] mb-2"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    What's your dog's name?
                  </h1>
                  <p className="text-[#6B6B6B]">Let's get to know your furry friend</p>
                </motion.div>

                {/* Photo upload */}
                <motion.div variants={staggerItem} className="flex justify-center">
                  <motion.button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Upload dog photo"
                    className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC] border-4 border-dashed border-[#F4A261]/50 flex items-center justify-center overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                  >
                    {dogData.photoUrl ? (
                      <img src={dogData.photoUrl} alt="Dog" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-[#F4A261] mx-auto mb-1" />
                        <span className="text-xs text-[#F4A261] font-medium">Add photo</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </motion.button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </motion.div>

                {/* Name input */}
                <motion.div variants={staggerItem}>
                  <input
                    type="text"
                    value={dogData.name}
                    onChange={(e) => updateDogData('name', e.target.value)}
                    className="w-full px-6 py-4 bg-white border-2 border-[#E8E8E8] rounded-xl text-[#3D3D3D] text-center text-xl placeholder:text-[#9E9E9E] focus:border-[#F4A261] focus:ring-2 focus:ring-[#F4A261]/20 transition-all duration-200 outline-none"
                    placeholder="Enter name..."
                    autoFocus
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Step 2: Breed and Gender */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8"
              >
                <motion.div variants={staggerItem} className="text-center">
                  <h1
                    className="text-3xl font-bold text-[#3D3D3D] mb-2"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    Tell us about {dogData.name}
                  </h1>
                  <p className="text-[#6B6B6B]">This helps us give better advice</p>
                </motion.div>

                {/* Breed select - Custom Dropdown */}
                <motion.div variants={staggerItem}>
                  <label className="block text-sm font-medium text-[#3D3D3D] mb-2">Breed</label>
                  <BreedDropdown
                    value={dogData.breed}
                    onChange={(breed) => {
                      updateDogData('breed', breed)
                      // Clear customBreed when switching away from "Other"
                      if (breed !== 'Other') {
                        updateDogData('customBreed', '')
                      }
                    }}
                    breeds={BREEDS}
                  />

                  {/* Custom breed input - shown when "Other" is selected */}
                  <AnimatePresence>
                    {dogData.breed === 'Other' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <input
                          type="text"
                          value={dogData.customBreed}
                          onChange={(e) => updateDogData('customBreed', e.target.value)}
                          className="w-full mt-3 px-4 py-3.5 bg-white border-2 border-[#E8E8E8] rounded-xl text-[#3D3D3D] placeholder:text-[#9E9E9E] focus:border-[#F4A261] focus:ring-2 focus:ring-[#F4A261]/20 transition-all duration-200 outline-none"
                          placeholder="Enter your dog's breed..."
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Gender */}
                <motion.div variants={staggerItem}>
                  <label className="block text-sm font-medium text-[#3D3D3D] mb-2">Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['male', 'female'].map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => updateDogData('gender', gender)}
                        className={`py-3 px-4 rounded-xl border-2 font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 ${
                          dogData.gender === gender
                            ? 'border-[#F4A261] bg-[#F4A261]/10 text-[#F4A261]'
                            : 'border-[#E8E8E8] bg-white text-[#6B6B6B] hover:border-[#F4A261]/50'
                        }`}
                      >
                        {gender === 'male' ? '♂ Male' : '♀ Female'}
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Birthday - Custom Date Picker */}
                <motion.div variants={staggerItem}>
                  <label className="block text-sm font-medium text-[#3D3D3D] mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Birthday (optional)
                  </label>
                  <DatePicker
                    value={dogData.dateOfBirth}
                    onChange={(date) => updateDogData('dateOfBirth', date)}
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Step 3: Weight */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8"
              >
                <motion.div variants={staggerItem} className="text-center">
                  <h1
                    className="text-3xl font-bold text-[#3D3D3D] mb-2"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    How much does {dogData.name} weigh?
                  </h1>
                  <p className="text-[#6B6B6B]">This helps calculate medication dosages</p>
                </motion.div>

                {/* Weight input */}
                <motion.div variants={staggerItem} className="flex gap-3">
                  <div className="flex-1 relative">
                    <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
                    <input
                      type="number"
                      value={dogData.weight}
                      onChange={(e) => updateDogData('weight', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#E8E8E8] rounded-xl text-[#3D3D3D] text-lg placeholder:text-[#9E9E9E] focus:border-[#F4A261] focus:ring-2 focus:ring-[#F4A261]/20 transition-all duration-200 outline-none"
                      placeholder="Enter weight..."
                    />
                  </div>
                  <div className="flex">
                    {['lbs', 'kg'].map((unit, idx) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => updateDogData('weightUnit', unit)}
                        className={`px-5 py-4 font-medium transition-all border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-1 focus-visible:z-10 ${
                          idx === 0 ? 'rounded-l-xl' : 'rounded-r-xl -ml-0.5'
                        } ${
                          dogData.weightUnit === unit
                            ? 'bg-[#F4A261] text-white border-[#F4A261] z-10'
                            : 'bg-white text-[#6B6B6B] border-[#E8E8E8] hover:bg-gray-50 hover:border-[#F4A261]/50'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Size preview */}
                {dogData.weight && (
                  <motion.div
                    variants={staggerItem}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-4 bg-[#7EC8C8]/10 rounded-xl"
                  >
                    <span className="text-[#489999]">
                      {dogData.name} is a <span className="font-semibold">{calculateSize(parseFloat(dogData.weight), dogData.weightUnit)}</span> dog
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 4: Allergies */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8"
              >
                <motion.div variants={staggerItem} className="text-center">
                  <h1
                    className="text-3xl font-bold text-[#3D3D3D] mb-2"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    Any allergies?
                  </h1>
                  <p className="text-[#6B6B6B]">Tap to select, tap again to deselect</p>
                </motion.div>

                {/* Common allergies - all visible with toggle */}
                <motion.div variants={staggerItem}>
                  <label className="block text-sm font-medium text-[#3D3D3D] mb-3">Common Food Allergies</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_ALLERGIES.map((allergy) => {
                      const isSelected = dogData.allergies.includes(allergy)
                      return (
                        <motion.button
                          key={allergy}
                          type="button"
                          onClick={() => isSelected ? removeAllergy(allergy) : addAllergy(allergy)}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-1 flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#F4A261] text-white border-2 border-[#F4A261] shadow-md'
                              : 'bg-white border-2 border-[#E8E8E8] text-[#6B6B6B] hover:border-[#F4A261] hover:text-[#F4A261]'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          {allergy}
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>

                {/* Custom allergies display */}
                {dogData.allergies.filter(a => !COMMON_ALLERGIES.includes(a)).length > 0 && (
                  <motion.div variants={staggerItem}>
                    <label className="block text-sm font-medium text-[#3D3D3D] mb-3">Custom Allergies</label>
                    <div className="flex flex-wrap gap-2">
                      {dogData.allergies.filter(a => !COMMON_ALLERGIES.includes(a)).map((allergy) => (
                        <motion.span
                          key={allergy}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F4A261] text-white rounded-full text-sm font-medium shadow-md"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {allergy}
                          <button
                            onClick={() => removeAllergy(allergy)}
                            className="hover:bg-white/20 rounded-full p-0.5 ml-1"
                            aria-label={`Remove ${allergy}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Custom allergy input */}
                <motion.div variants={staggerItem} className="flex gap-2">
                  <input
                    type="text"
                    value={customAllergy}
                    onChange={(e) => setCustomAllergy(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomAllergy()}
                    className="flex-1 px-4 py-3 bg-white border-2 border-[#E8E8E8] rounded-xl text-[#3D3D3D] placeholder:text-[#9E9E9E] focus:border-[#F4A261] focus:ring-2 focus:ring-[#F4A261]/20 transition-all duration-200 outline-none"
                    placeholder="Add other allergy..."
                  />
                  <button
                    type="button"
                    onClick={addCustomAllergy}
                    className="px-4 py-3 bg-[#F4A261] text-white rounded-xl hover:bg-[#E8924F] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                    aria-label="Add custom allergy"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </motion.div>

                {/* Selection summary */}
                <motion.div variants={staggerItem} className="text-center">
                  {dogData.allergies.length > 0 ? (
                    <p className="text-sm text-[#F4A261] font-medium">
                      <Check className="w-4 h-4 inline mr-1" />
                      {dogData.allergies.length} allerg{dogData.allergies.length === 1 ? 'y' : 'ies'} selected
                    </p>
                  ) : (
                    <p className="text-sm text-[#9E9E9E]">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      No allergies selected - you can always update this later
                    </p>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="relative z-10 p-4 border-t border-[#E8E8E8]/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className={`flex items-center gap-2 px-6 py-3 text-[#6B6B6B] font-medium rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 ${
              step === 1 ? 'invisible' : ''
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <motion.button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            whileHover={{ scale: canProceed() ? 1.02 : 1 }}
            whileTap={{ scale: canProceed() ? 0.98 : 1 }}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
          >
            {step === totalSteps ? (
              <>
                Complete
                <Check className="w-5 h-5" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default AddDogProfile
