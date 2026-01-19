import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  MessageCircle, Camera, ChevronRight, Dog, Plus,
  Calendar, Weight, Sparkles, Clock, PawPrint
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDog } from '../context/DogContext'
import BottomNav from '../components/layout/BottomNav'
import HealthOrb from '../components/dog/HealthOrb'

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
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
    },
  },
}

function Dashboard() {
  const { user } = useAuth()
  const { dogs, activeDog } = useDog()
  const navigate = useNavigate()

  // Redirect to add-dog if no dogs exist
  useEffect(() => {
    if (dogs.length === 0) {
      navigate('/add-dog')
    }
  }, [dogs, navigate])

  // Calculate dog's age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    const birth = new Date(dateOfBirth)
    const now = new Date()
    const years = now.getFullYear() - birth.getFullYear()
    const months = now.getMonth() - birth.getMonth()

    if (years === 0) {
      return `${months + (months < 0 ? 12 : 0)} months`
    }
    if (years === 1 && months < 0) {
      return `${12 + months} months`
    }
    return `${years} ${years === 1 ? 'year' : 'years'} old`
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
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
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#6B6B6B]">{getGreeting()},</p>
            <h1
              className="text-xl font-bold text-[#3D3D3D]"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {user?.name || 'Pet Parent'}
            </h1>
          </div>

          {/* Dog avatar */}
          <Link to="/settings" className="relative">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#F4A261] shadow-md bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC]"
            >
              {activeDog.photoUrl ? (
                <img
                  src={activeDog.photoUrl}
                  alt={activeDog.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Dog className="w-6 h-6 text-[#F4A261]" />
                </div>
              )}
            </motion.div>
            {dogs.length > 1 && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#F4A261] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {dogs.length}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Main content */}
      <motion.main
        className="max-w-lg mx-auto px-4 py-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Dog profile card */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-2xl p-5 shadow-md border border-[#F4A261]/10 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-[#FFE8D6] shadow-md bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC]">
              {activeDog.photoUrl ? (
                <img
                  src={activeDog.photoUrl}
                  alt={activeDog.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Dog className="w-8 h-8 text-[#F4A261]" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2
                className="text-2xl font-bold text-[#3D3D3D]"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {activeDog.name}
              </h2>
              <p className="text-[#6B6B6B]">{activeDog.breed}</p>
            </div>
            <Link to="/settings">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-[#FDF8F3] transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[#9E9E9E]" />
              </motion.button>
            </Link>
          </div>

          {/* Dog stats */}
          <div className="grid grid-cols-3 gap-3">
            {activeDog.dateOfBirth && (
              <div className="bg-[#FDF8F3] rounded-xl p-3 text-center">
                <Calendar className="w-4 h-4 text-[#F4A261] mx-auto mb-1" />
                <p className="text-xs text-[#6B6B6B]">Age</p>
                <p className="text-sm font-semibold text-[#3D3D3D]">
                  {calculateAge(activeDog.dateOfBirth)}
                </p>
              </div>
            )}
            {activeDog.weight && (
              <div className="bg-[#FDF8F3] rounded-xl p-3 text-center">
                <Weight className="w-4 h-4 text-[#7EC8C8] mx-auto mb-1" />
                <p className="text-xs text-[#6B6B6B]">Weight</p>
                <p className="text-sm font-semibold text-[#3D3D3D]">
                  {activeDog.weight} {activeDog.weightUnit}
                </p>
              </div>
            )}
            <div className="bg-[#FDF8F3] rounded-xl p-3 text-center">
              <PawPrint className="w-4 h-4 text-[#81C784] mx-auto mb-1" />
              <p className="text-xs text-[#6B6B6B]">Size</p>
              <p className="text-sm font-semibold text-[#3D3D3D] capitalize">
                {activeDog.size || 'Medium'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Health Orb */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-2xl p-8 shadow-md border border-[#81C784]/10 mb-6"
        >
          <HealthOrb status="unknown" dogName={activeDog.name} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={staggerItem} className="mb-6">
          <h3
            className="text-lg font-bold text-[#3D3D3D] mb-3"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Chat action */}
            <Link to="/chat">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] rounded-2xl p-5 text-white shadow-md"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Ask Pawsy
                </h4>
                <p className="text-white/80 text-sm">
                  Chat about {activeDog.name}'s health
                </p>
              </motion.div>
            </Link>

            {/* Photo action */}
            <Link to="/photo">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-[#F4A261] to-[#E8924F] rounded-2xl p-5 text-white shadow-md"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Camera className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Scan Photo
                </h4>
                <p className="text-white/80 text-sm">
                  Analyze skin, wounds, etc.
                </p>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* AI Tips Section */}
        <motion.div variants={staggerItem}>
          <h3
            className="text-lg font-bold text-[#3D3D3D] mb-3"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Tips for {activeDog.name}
          </h3>
          <div className="bg-white rounded-2xl p-5 shadow-md border border-[#7EC8C8]/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[#3D3D3D] text-sm leading-relaxed">
                  {activeDog.breed === 'Golden Retriever' || activeDog.breed === 'Labrador Retriever'
                    ? `${activeDog.name} is a ${activeDog.breed}! They're prone to hip dysplasia - regular exercise and maintaining a healthy weight helps prevent joint issues.`
                    : activeDog.breed === 'German Shepherd'
                    ? `${activeDog.name} is a ${activeDog.breed}! They need lots of mental stimulation. Consider puzzle toys and training sessions to keep them happy.`
                    : activeDog.breed === 'Bulldog'
                    ? `${activeDog.name} is a ${activeDog.breed}! Watch for breathing issues in hot weather and keep them cool during summer months.`
                    : `Based on ${activeDog.name}'s profile, remember to keep up with regular vet checkups and maintain a consistent feeding schedule.`
                  }
                </p>
                <Link
                  to="/chat"
                  className="inline-flex items-center gap-1 text-[#7EC8C8] text-sm font-medium mt-2 hover:underline"
                >
                  Get more tips
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Allergies reminder if any */}
        {activeDog.allergies && activeDog.allergies.length > 0 && (
          <motion.div variants={staggerItem} className="mt-6">
            <div className="bg-[#FFF9C4]/50 rounded-2xl p-4 border border-[#FFD54F]/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[#F4A261]" />
                <span className="text-sm font-medium text-[#3D3D3D]">Allergy Reminder</span>
              </div>
              <p className="text-sm text-[#6B6B6B]">
                {activeDog.name} is allergic to:{' '}
                <span className="font-medium text-[#3D3D3D]">
                  {activeDog.allergies.join(', ')}
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </motion.main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

export default Dashboard
