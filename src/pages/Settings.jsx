import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, User, Dog, Plus, Trash2,
  MessageCircle, LogOut, Shield, HelpCircle, Check, X,
  Edit3, PawPrint
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDog } from '../context/DogContext'
import { useChat } from '../context/ChatContext'
import BottomNav from '../components/layout/BottomNav'

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

function Settings() {
  const { user, logout } = useAuth()
  const { dogs, activeDog, setActiveDog, deleteDog } = useDog()
  const { sessions } = useChat()
  const navigate = useNavigate()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false)

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
    navigate('/')
  }

  const handleClearChatHistory = () => {
    localStorage.removeItem('pawsy_chat_sessions')
    window.location.reload()
  }

  const handleClearAllData = () => {
    localStorage.clear()
    navigate('/')
  }

  const totalChats = sessions.length
  const activeDogChats = sessions.filter(s => s.dogId === activeDog?.id).length

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
            <Link to="/add-dog">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 text-sm text-[#F4A261] font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Dog
              </motion.button>
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[#F4A261]/10 overflow-hidden divide-y divide-[#F4A261]/10">
            {dogs.map((dog) => (
              <div
                key={dog.id}
                className={`p-4 flex items-center gap-3 ${
                  dog.id === activeDog?.id ? 'bg-[#F4A261]/5' : ''
                }`}
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveDog(dog.id)}
                  className="flex items-center gap-3 flex-1"
                >
                  <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${
                    dog.id === activeDog?.id ? 'border-[#F4A261]' : 'border-[#E8E8E8]'
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
                      {dog.id === activeDog?.id && (
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
            ))}

            {dogs.length === 0 && (
              <div className="p-8 text-center">
                <Dog className="w-12 h-12 text-[#E8E8E8] mx-auto mb-3" />
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
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="w-12 h-12 rounded-full bg-[#EF5350]/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-[#EF5350]" />
              </div>
              <h3 className="text-lg font-bold text-[#3D3D3D] text-center mb-2">
                Delete {dogs.find(d => d.id === showDeleteConfirm)?.name}?
              </h3>
              <p className="text-sm text-[#6B6B6B] text-center mb-6">
                This will remove the dog profile and all associated chat history. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-xl border-2 border-[#E8E8E8] text-[#6B6B6B] font-semibold hover:bg-[#FDF8F3] transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteDog(showDeleteConfirm)}
                  className="flex-1 py-3 rounded-xl bg-[#EF5350] text-white font-semibold hover:bg-[#E53935] transition-colors"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="w-12 h-12 rounded-full bg-[#F4A261]/10 flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-[#F4A261]" />
              </div>
              <h3 className="text-lg font-bold text-[#3D3D3D] text-center mb-2">
                Log out?
              </h3>
              <p className="text-sm text-[#6B6B6B] text-center mb-6">
                Your data will remain saved on this device. You can log back in anytime.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-[#E8E8E8] text-[#6B6B6B] font-semibold hover:bg-[#FDF8F3] transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-xl bg-[#F4A261] text-white font-semibold hover:bg-[#E8924F] transition-colors"
                >
                  Log Out
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Data Confirmation Modal */}
      <AnimatePresence>
        {showClearDataConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowClearDataConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="w-12 h-12 rounded-full bg-[#EF5350]/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-[#EF5350]" />
              </div>
              <h3 className="text-lg font-bold text-[#3D3D3D] text-center mb-2">
                Clear chat history?
              </h3>
              <p className="text-sm text-[#6B6B6B] text-center mb-6">
                This will delete all {totalChats} conversation{totalChats !== 1 ? 's' : ''} across all dogs. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowClearDataConfirm(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-[#E8E8E8] text-[#6B6B6B] font-semibold hover:bg-[#FDF8F3] transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearChatHistory}
                  className="flex-1 py-3 rounded-xl bg-[#EF5350] text-white font-semibold hover:bg-[#E53935] transition-colors"
                >
                  Clear All
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}

export default Settings
