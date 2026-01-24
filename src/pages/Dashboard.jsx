import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Camera,
  AlertTriangle,
  MapPin,
  BookOpen,
  Settings,
  ChevronRight,
  Dog
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDog } from '../context/DogContext'
import { useOnboarding } from '../context/OnboardingContext'
import BottomNav from '../components/layout/BottomNav'
import PawsyMascot from '../components/mascot/PawsyMascot'
import UsageStatsCard from '../components/dashboard/UsageStatsCard'
import DashboardPremiumCard from '../components/dashboard/DashboardPremiumCard'
import WelcomeModal from '../components/onboarding/WelcomeModal'
import Skeleton from '../components/common/SkeletonLoader'

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
  const { activeDog, loading: dogsLoading } = useDog()
  const { showWelcome, dismissWelcome, completeStep, progress } = useOnboarding()
  const navigate = useNavigate()

  // Mark hasDog step complete when we have an active dog
  if (activeDog && !progress.hasDog) {
    completeStep('hasDog')
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const handleUpgrade = () => {
    alert('Premium upgrade coming soon! For now, enjoy free features.')
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
        {dogsLoading ? (
          <motion.div variants={staggerItem} className="mb-4">
            <Skeleton.DogProfile />
          </motion.div>
        ) : activeDog ? (
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
        ) : null}

        {/* Usage Stats Card */}
        <motion.div variants={staggerItem} className="mb-4">
          {dogsLoading ? (
            <Skeleton.UsageStats />
          ) : (
            <UsageStatsCard onUpgrade={handleUpgrade} />
          )}
        </motion.div>

        {/* Primary Action - Start Health Check */}
        <motion.div variants={staggerItem} className="mb-3">
          <Link to="/chat">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] rounded-2xl p-5 text-white shadow-lg flex items-center gap-4"
            >
              <div className="flex-shrink-0">
                <PawsyMascot mood="happy" size={48} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Start Health Check
                </h4>
                <p className="text-white/80 text-sm mt-0.5">
                  Describe symptoms or ask any health question
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60 flex-shrink-0" />
            </motion.div>
          </Link>
        </motion.div>

        {/* Secondary Actions - Neutral */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3 mb-4">
          {/* Photo */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/photo')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8E8E8] text-left cursor-pointer"
          >
            <div className="w-10 h-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center mb-2">
              <Camera className="w-5 h-5 text-[#6B6B6B]" />
            </div>
            <h4 className="font-bold text-sm text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Scan Photo
            </h4>
            <p className="text-[#9E9E9E] text-xs mt-0.5">
              Visual health check
            </p>
          </motion.button>

          {/* Toxic Checker */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/toxic-checker')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8E8E8] text-left cursor-pointer"
          >
            <div className="w-10 h-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-[#6B6B6B]" />
            </div>
            <h4 className="font-bold text-sm text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Is This Toxic?
            </h4>
            <p className="text-[#9E9E9E] text-xs mt-0.5">
              Food & plant safety
            </p>
          </motion.button>
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

        {/* Premium Upsell Card */}
        <motion.div variants={staggerItem} className="mb-4">
          <DashboardPremiumCard
            dogName={activeDog?.name}
            onUpgrade={handleUpgrade}
          />
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={staggerItem} className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8]/50 overflow-hidden">
          <Link to="/emergency-guides">
            <motion.div
              whileHover={{ backgroundColor: 'rgba(244, 162, 97, 0.04)' }}
              whileTap={{ scale: 0.99 }}
              className="px-3.5 py-3 flex items-center gap-3 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFE8D6] to-[#FFD6B8] flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-[#E8924F]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-[#3D3D3D] text-[13px] leading-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  First Aid Guides
                </h4>
                <p className="text-[#8E8E8E] text-[11px] leading-tight mt-0.5">
                  CPR, choking, poisoning & more
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#C0C0C0] flex-shrink-0" />
            </motion.div>
          </Link>

          <div className="h-px bg-[#F0F0F0] mx-3.5" />

          <Link to="/breed-info">
            <motion.div
              whileHover={{ backgroundColor: 'rgba(102, 187, 106, 0.04)' }}
              whileTap={{ scale: 0.99 }}
              className="px-3.5 py-3 flex items-center gap-3 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] flex items-center justify-center flex-shrink-0">
                <Dog className="w-4 h-4 text-[#4CAF50]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-[#3D3D3D] text-[13px] leading-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Breed Health Info
                </h4>
                <p className="text-[#8E8E8E] text-[11px] leading-tight mt-0.5">
                  Common health issues by breed
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#C0C0C0] flex-shrink-0" />
            </motion.div>
          </Link>
        </motion.div>

        {/* Session Notice */}
        <motion.div
          variants={staggerItem}
          className="mt-6 text-center"
        >
          <p className="text-xs text-[#9E9E9E]">
            Free version • <button onClick={handleUpgrade} className="underline hover:text-[#F4A261]">Upgrade</button> to save chats
          </p>
        </motion.div>
      </motion.main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Welcome Modal for first-time users */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={dismissWelcome}
        dogName={activeDog?.name}
      />
    </div>
  )
}

export default Dashboard
