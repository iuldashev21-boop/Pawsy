import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft, User, Dog, Plus, Trash2,
  MessageCircle, LogOut, Shield, HelpCircle, Check,
  PawPrint, Lock, Heart, Clock, Bell
} from 'lucide-react'
import PremiumIcon from '../components/common/PremiumIcon'
import PawsyIcon from '../components/common/PawsyIcon'
import { useAuth } from '../context/AuthContext'
import { usePremium } from '../hooks/usePremium'
import { useDog } from '../context/DogContext'
import { useChat } from '../context/ChatContext'
import BottomNav from '../components/layout/BottomNav'
import { useToast } from '../context/ToastContext'

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
}

const backdropAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const panelAnimation = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
}

const PREMIUM_FEATURES = [
  {
    Icon: Heart,
    iconColor: 'text-[#F4A261]',
    title: 'Extended Health Profile',
    premiumDesc: 'Coming soon — Track conditions, medications, and vet info',
    freeDesc: (dog) => `Track conditions, medications, vet info for ${dog?.name || 'your dog'}`,
    hasBorder: true,
  },
  {
    Icon: Clock,
    iconColor: 'text-[#7EC8C8]',
    title: 'Health Timeline',
    premiumDesc: 'Coming soon — Visual history of symptoms, vet visits, and health changes',
    freeDesc: () => 'Track symptoms, vet visits, and health changes over time',
    hasBorder: true,
  },
  {
    Icon: Bell,
    iconColor: 'text-[#81C784]',
    title: 'Breed & Age Alerts',
    premiumDesc: (dog) => `Coming soon — Proactive alerts for ${dog?.breed || 'your dog\'s breed'}`,
    freeDesc: (dog) => `Get alerts for health issues common in ${dog?.breed || 'your dog\'s breed'}`,
    hasBorder: true,
  },
  {
    Icon: MessageCircle,
    iconColor: 'text-[#7EC8C8]',
    title: 'Unlimited Chats & Photos',
    premiumDesc: 'Unlimited AI chats and photo analysis — active',
    freeDesc: () => 'No daily limits on AI chats and photo analysis',
    hasBorder: false,
  },
]

const PREMIUM_BENEFITS = [
  'Unlimited dog profiles',
  'Unlimited AI chats & photos',
  'Health timeline & tracking',
]

const stopPropagation = (e) => e.stopPropagation()

function LockBadge() {
  return (
    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F4A261] flex items-center justify-center">
      <Lock className="w-2.5 h-2.5 text-white" />
    </div>
  )
}

function PremiumFeatureRow({ Icon, iconColor, title, premiumDesc, freeDesc, hasBorder, isPremium, activeDog }) {
  const description = isPremium
    ? (typeof premiumDesc === 'function' ? premiumDesc(activeDog) : premiumDesc)
    : freeDesc(activeDog)

  return (
    <div className={`p-4 flex items-center gap-3${hasBorder ? ' border-b border-[#F4A261]/10' : ''}`}>
      <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center relative">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        {!isPremium && <LockBadge />}
      </div>
      <div className="flex-1">
        <p className="font-medium text-[#3D3D3D]">{title}</p>
        <p className="text-xs text-[#6B6B6B]">{description}</p>
      </div>
    </div>
  )
}

function ConfirmModal({ isOpen, onClose, icon, title, description, cancelLabel = 'Cancel', confirmLabel, confirmContent, confirmClassName, onConfirm, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          {...backdropAnimation}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            {...panelAnimation}
            onClick={stopPropagation}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
          >
            {icon && (
              <div className="mx-auto mb-4">
                {icon}
              </div>
            )}
            <h3 className="text-lg font-bold text-[#3D3D3D] text-center mb-2">
              {title}
            </h3>
            <p className={`text-sm text-[#6B6B6B] text-center ${children ? 'mb-4' : 'mb-6'}`}>
              {description}
            </p>
            {children}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border-2 border-[#E8E8E8] text-[#6B6B6B] font-semibold hover:bg-[#FDF8F3] transition-colors"
              >
                {cancelLabel}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className={`flex-1 py-3 rounded-xl text-white font-semibold transition-colors ${confirmClassName}`}
              >
                {confirmContent || confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Settings() {
  const { user, logout } = useAuth()
  const { dogs, activeDog, setActiveDog, deleteDog, reloadForCurrentUser: reloadDogs } = useDog()
  const { sessions, clearAllSessions, reloadForCurrentUser: reloadChats } = useChat()
  const { isPremium } = usePremium()
  const navigate = useNavigate()

  const { showToast } = useToast()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  // Premium users can add unlimited dogs, free users limited to 1
  const canAddDog = isPremium || dogs.length === 0

  const handleAddDogClick = () => {
    if (canAddDog) {
      navigate('/add-dog')
    } else {
      setShowPremiumModal(true)
    }
  }

  const handleDeleteDog = (dogId) => {
    deleteDog(dogId)
    setShowDeleteConfirm(null)
    // If no dogs left, redirect to add dog
    if (dogs.length <= 1) {
      navigate('/add-dog')
    }
  }

  const handleLogout = () => {
    logout()
    // Reload contexts to clear current user's data from memory
    reloadDogs()
    reloadChats()
    navigate('/')
  }

  const handleClearChatHistory = () => {
    // Use the context function which handles user-prefixed storage
    clearAllSessions()
    setShowClearDataConfirm(false)
  }

  const totalChats = sessions.length
  const deleteDogName = dogs.find(d => d.id === showDeleteConfirm)?.name

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FDF8F3]/80 backdrop-blur-md border-b border-[#E8E8E8]/30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/dashboard">
            <motion.button
              whileTap={{ scale: 0.95 }}
              aria-label="Back to dashboard"
              className="p-2 rounded-xl hover:bg-[#F4A261]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]"
            >
              <ChevronLeft className="w-5 h-5 text-[#3D3D3D]" />
            </motion.button>
          </Link>
          <h1
            className="text-xl font-bold text-[#3D3D3D]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Settings
          </h1>
        </div>
      </header>

      <motion.main
        className="max-w-lg mx-auto px-4 py-6 space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* User Profile Section */}
        <motion.section variants={staggerItem}>
          <h2 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wide mb-3 px-1">
            Account
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-[#F4A261]/10 overflow-hidden">
            <div className="p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F4A261] to-[#E8924F] flex items-center justify-center shadow-md">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#3D3D3D]">{user?.name || 'Pet Parent'}</p>
                <p className="text-sm text-[#6B6B6B]">{user?.email || 'No email'}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Dog Profiles Section */}
        <motion.section variants={staggerItem}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wide">
              Dog Profiles
            </h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddDogClick}
              className="flex items-center gap-1 text-sm text-[#F4A261] font-medium"
            >
              {canAddDog ? <Plus className="w-4 h-4" /> : <PremiumIcon size={14} />}
              Add Dog
            </motion.button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[#F4A261]/10 overflow-hidden divide-y divide-[#F4A261]/10">
            {dogs.map((dog) => {
              const isActive = dog.id === activeDog?.id
              return (
                <div
                  key={dog.id}
                  className={`p-4 flex items-center gap-3 ${isActive ? 'bg-[#F4A261]/5' : ''}`}
                >
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveDog(dog.id)}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${
                      isActive ? 'border-[#F4A261]' : 'border-[#E8E8E8]'
                    } bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC]`}>
                      {dog.photoUrl ? (
                        <img src={dog.photoUrl} alt={dog.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Dog className="w-6 h-6 text-[#F4A261]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#3D3D3D]">{dog.name}</p>
                        {isActive && (
                          <span className="text-xs bg-[#F4A261]/20 text-[#E8924F] px-2 py-0.5 rounded-full font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#6B6B6B]">{dog.breed}</p>
                    </div>
                  </motion.button>

                  {/* Delete button */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteConfirm(dog.id)}
                    className="p-2 rounded-lg text-[#9E9E9E] hover:text-[#EF5350] hover:bg-[#EF5350]/10 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              )
            })}

            {dogs.length === 0 && (
              <div className="p-8 text-center">
                <Dog className="w-12 h-12 text-[#9E9E9E] mx-auto mb-3" />
                <p className="text-[#9E9E9E]">No dogs added yet</p>
                <Link
                  to="/add-dog"
                  className="inline-flex items-center gap-1 text-[#F4A261] font-medium mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Add your first dog
                </Link>
              </div>
            )}
          </div>
        </motion.section>

        {/* Premium Features Section */}
        <motion.section variants={staggerItem}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wide flex items-center gap-1.5">
              <PremiumIcon size={14} />
              Personalized Health Intelligence
            </h2>
            {!isPremium && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => showToast('Premium upgrade coming soon! For now, enjoy free features.', 'premium')}
                className="text-sm text-[#F4A261] font-medium"
              >
                Unlock all →
              </motion.button>
            )}
          </div>
          <div className={`rounded-2xl border overflow-hidden ${
            isPremium
              ? 'bg-white border-[#81C784]/20'
              : 'bg-gradient-to-br from-[#FFF8E7] via-[#FFE4B5] to-[#FFD699] border-[#E8B855]/30'
          }`}>
            {PREMIUM_FEATURES.map((feature) => (
              <PremiumFeatureRow
                key={feature.title}
                {...feature}
                isPremium={isPremium}
                activeDog={activeDog}
              />
            ))}

            {/* Upgrade CTA — only for free users */}
            {!isPremium && (
              <div className="p-4 bg-white/40 border-t border-[#F4A261]/10">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => showToast('Premium upgrade coming soon! For now, enjoy free features.', 'premium')}
                  className="w-full py-3 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <PremiumIcon size={16} gradient={false} />
                  Unlock Personalized Care for {activeDog?.name || 'Your Dog'}
                </motion.button>
                <p className="text-xs text-[#6B6B6B] text-center mt-2">
                  $4.99/month or $39.99/year
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Data & Storage Section */}
        <motion.section variants={staggerItem}>
          <h2 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wide mb-3 px-1">
            Data & Storage
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-[#F4A261]/10 overflow-hidden divide-y divide-[#F4A261]/10">
            {/* Chat history info */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7EC8C8]/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#7EC8C8]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#3D3D3D]">Chat History</p>
                <p className="text-sm text-[#6B6B6B]">
                  {totalChats} conversation{totalChats !== 1 ? 's' : ''} stored
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowClearDataConfirm(true)}
                className="text-sm text-[#EF5350] font-medium px-3 py-1.5 rounded-lg hover:bg-[#EF5350]/10 transition-colors"
              >
                Clear
              </motion.button>
            </div>

            {/* Storage info */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F4A261]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#F4A261]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#3D3D3D]">Local Storage</p>
                <p className="text-sm text-[#6B6B6B]">
                  All data stored on your device
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* About Section */}
        <motion.section variants={staggerItem}>
          <h2 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wide mb-3 px-1">
            About
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-[#F4A261]/10 overflow-hidden divide-y divide-[#F4A261]/10">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F4A261] to-[#E8924F] flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#3D3D3D]">Pawsy</p>
                <p className="text-sm text-[#6B6B6B]">Version 1.0.0</p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7EC8C8]/10 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-[#7EC8C8]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#3D3D3D]">AI-Powered Vet Assistant</p>
                <p className="text-sm text-[#6B6B6B]">
                  Powered by Google Gemini
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Logout Section */}
        <motion.section variants={staggerItem}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full bg-white rounded-2xl shadow-sm border border-[#F4A261]/10 p-4 flex items-center gap-3 hover:bg-[#FDF8F3] transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EF5350]/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-[#EF5350]" />
            </div>
            <p className="font-medium text-[#EF5350]">Log Out</p>
          </motion.button>
        </motion.section>

        {/* Disclaimer */}
        <motion.p
          variants={staggerItem}
          className="text-xs text-[#9E9E9E] text-center px-4 pt-4"
        >
          Pawsy provides general information and is not a substitute for professional veterinary advice. Always consult a veterinarian for health concerns.
        </motion.p>
      </motion.main>

      {/* Delete Dog Confirmation Modal */}
      <ConfirmModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        icon={
          <div className="w-12 h-12 rounded-full bg-[#EF5350]/10 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6 text-[#EF5350]" />
          </div>
        }
        title={`Delete ${deleteDogName}?`}
        description="This will remove the dog profile and all associated chat history. This action cannot be undone."
        confirmLabel="Delete"
        confirmClassName="bg-[#EF5350] hover:bg-[#E53935]"
        onConfirm={() => handleDeleteDog(showDeleteConfirm)}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        icon={
          <div className="w-12 h-12 rounded-full bg-[#F4A261]/10 flex items-center justify-center mx-auto">
            <LogOut className="w-6 h-6 text-[#F4A261]" />
          </div>
        }
        title="Log out?"
        description="Your data will remain saved on this device. You can log back in anytime."
        confirmLabel="Log Out"
        confirmClassName="bg-[#F4A261] hover:bg-[#E8924F]"
        onConfirm={handleLogout}
      />

      {/* Clear Data Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearDataConfirm}
        onClose={() => setShowClearDataConfirm(false)}
        icon={
          <div className="w-12 h-12 rounded-full bg-[#EF5350]/10 flex items-center justify-center mx-auto">
            <MessageCircle className="w-6 h-6 text-[#EF5350]" />
          </div>
        }
        title="Clear chat history?"
        description={`This will delete all ${totalChats} conversation${totalChats !== 1 ? 's' : ''} across all dogs. This cannot be undone.`}
        confirmLabel="Clear All"
        confirmClassName="bg-[#EF5350] hover:bg-[#E53935]"
        onConfirm={handleClearChatHistory}
      />

      {/* Premium Upgrade Modal for Adding Dogs */}
      <ConfirmModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        icon={<PawsyIcon size={56} className="rounded-full" />}
        title="Add More Dogs with Premium"
        description="Free accounts are limited to 1 dog profile. Upgrade to Premium to add unlimited dogs and unlock all features!"
        cancelLabel="Maybe Later"
        confirmContent={<><PremiumIcon size={16} gradient={false} /> Upgrade</>}
        confirmClassName="bg-gradient-to-r from-[#F4A261] to-[#E8924F] flex items-center justify-center gap-1.5"
        onConfirm={() => {
          setShowPremiumModal(false)
          showToast('Premium upgrade coming soon!', 'premium')
        }}
      >
        <div className="bg-[#FDF8F3] rounded-xl p-3 mb-5">
          {PREMIUM_BENEFITS.map((benefit, i) => (
            <div key={benefit} className={`flex items-center gap-2 text-sm text-[#6B6B6B]${i > 0 ? ' mt-1' : ''}`}>
              <Check className="w-4 h-4 text-[#81C784]" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </ConfirmModal>

      <BottomNav />
    </div>
  )
}

export default Settings
