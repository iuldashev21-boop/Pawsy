import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  MessageCircle,
  Camera,
  Stethoscope,
  AlertTriangle,
  MapPin,
  BookOpen,
  Settings,
  ChevronRight,
  Dog
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDog } from '../context/DogContext'
import BottomNav from '../components/layout/BottomNav'
import PawsyMascot from '../components/mascot/PawsyMascot'

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
}

function Dashboard() {
  const { user } = useAuth()
  const { activeDog } = useDog()

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FDF8F3]/80 backdrop-blur-md border-b border-[#E8E8E8]/30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#6B6B6B]">{getGreeting()},</p>
            <h1
              className="text-xl font-bold text-[#3D3D3D]"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {user?.name || 'Pet Parent'}
            </h1>
          </div>

          <Link to="/settings">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#E8E8E8] flex items-center justify-center"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-[#6B6B6B]" />
            </motion.button>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <motion.main
        className="max-w-lg mx-auto px-4 py-5"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Dog Profile Card */}
        {activeDog && (
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8E8E8]/50 mb-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#F4A261]/30 bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC] flex-shrink-0">
                {activeDog.photoUrl ? (
                  <img src={activeDog.photoUrl} alt={activeDog.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Dog className="w-8 h-8 text-[#F4A261]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {activeDog.name}
                </h3>
                <p className="text-sm text-[#6B6B6B]">
                  {activeDog.breed || 'Mixed breed'}
                  {activeDog.age && ` • ${activeDog.age}`}
                  {activeDog.weight && ` • ${activeDog.weight} ${activeDog.weightUnit || 'lbs'}`}
                </p>
                {activeDog.allergies && activeDog.allergies.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs text-red-500 font-medium">Allergies:</span>
                    <div className="flex flex-wrap gap-1">
                      {activeDog.allergies.map((allergy, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Mascot Hero */}
        <motion.div
          variants={staggerItem}
          className="flex flex-col items-center mb-6"
        >
          <PawsyMascot mood="happy" size={56} />
          <h2
            className="text-base font-bold text-[#3D3D3D] mt-2"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            How can I help {activeDog?.name || 'your pet'} today?
          </h2>
        </motion.div>

        {/* Primary Actions - 2x2 Grid */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3 mb-4">
          {/* Chat */}
          <Link to="/chat">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] rounded-2xl p-4 text-white shadow-md h-full"
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Ask Pawsy
              </h4>
              <p className="text-white/80 text-xs mt-0.5">
                Describe symptoms
              </p>
            </motion.div>
          </Link>

          {/* Photo */}
          <Link to="/photo">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-[#F4A261] to-[#E8924F] rounded-2xl p-4 text-white shadow-md h-full"
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2">
                <Camera className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Scan Photo
              </h4>
              <p className="text-white/80 text-xs mt-0.5">
                Show me the issue
              </p>
            </motion.div>
          </Link>

          {/* Symptom Checker */}
          <Link to="/symptom-checker">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-[#81C784] to-[#66BB6A] rounded-2xl p-4 text-white shadow-md h-full"
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Symptom Check
              </h4>
              <p className="text-white/80 text-xs mt-0.5">
                Quick assessment
              </p>
            </motion.div>
          </Link>

          {/* Toxic Checker */}
          <Link to="/toxic-checker">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-[#FFB74D] to-[#FFA726] rounded-2xl p-4 text-white shadow-md h-full"
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Is This Toxic?
              </h4>
              <p className="text-white/80 text-xs mt-0.5">
                Food & plant safety
              </p>
            </motion.div>
          </Link>
        </motion.div>

        {/* Emergency Button */}
        <motion.div variants={staggerItem} className="mb-4">
          <Link to="/emergency-vet">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="bg-gradient-to-r from-[#EF5350] to-[#E53935] rounded-xl p-4 text-white shadow-md flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-base" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Emergency? Find Vet Now
                </h4>
                <p className="text-white/80 text-xs">
                  Locate 24-hour clinics nearby
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60" />
            </motion.div>
          </Link>
        </motion.div>

        {/* First Aid Guides */}
        <motion.div variants={staggerItem}>
          <Link to="/emergency-guides">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-[#E8E8E8] flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#FDF8F3] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#F4A261]" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#3D3D3D] text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  First Aid Guides
                </h4>
                <p className="text-[#6B6B6B] text-xs">
                  CPR, choking, poisoning & more
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#9E9E9E]" />
            </motion.div>
          </Link>
        </motion.div>

        {/* Breed Info Link */}
        <motion.div variants={staggerItem} className="mt-3">
          <Link to="/breed-info">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-[#E8E8E8] flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                <span className="text-lg">🐕</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#3D3D3D] text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Breed Health Info
                </h4>
                <p className="text-[#6B6B6B] text-xs">
                  Common health issues by breed
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#9E9E9E]" />
            </motion.div>
          </Link>
        </motion.div>

        {/* Session Notice */}
        <motion.div
          variants={staggerItem}
          className="mt-6 text-center"
        >
          <p className="text-xs text-[#9E9E9E]">
            Free version • Chats are not saved
          </p>
        </motion.div>
      </motion.main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

export default Dashboard
