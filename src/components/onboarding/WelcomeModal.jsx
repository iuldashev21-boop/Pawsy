import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Camera, AlertTriangle } from 'lucide-react'
import PawsyMascot from '../mascot/PawsyMascot'
import PremiumIcon from '../common/PremiumIcon'

function WelcomeModal({ isOpen, onClose, dogName }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl overflow-hidden"
        >
          {/* Decorative top gradient */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#FFF5ED] to-transparent -z-10" />

          {/* Mascot */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <PawsyMascot mood="celebrating" size={72} />
            </motion.div>
          </div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-center text-[#3D3D3D] mb-2"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {dogName ? `Hi! I'm ${dogName}'s new buddy!` : "Hi! I'm Pawsy!"}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center text-[#6B6B6B] mb-2"
          >
            Your AI-powered pet health assistant, here to help keep {dogName || 'your pup'} healthy and happy.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-center text-xs text-[#9E9E9E] mb-5"
          >
            Trusted by 10,000+ pet parents
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mb-6"
          >
            <FeatureItem
              icon={MessageCircle}
              color="#7EC8C8"
              text="Ask me anything about dog health"
            />
            <FeatureItem
              icon={Camera}
              color="#F4A261"
              text="Send photos for visual health checks"
            />
            <FeatureItem
              icon={AlertTriangle}
              color="#EF5350"
              text="Get emergency guidance 24/7"
            />
          </motion.div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <PremiumIcon size={20} gradient={false} />
            Meet Your AI Vet Assistant
          </motion.button>

          {/* Subtle tip */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-[#9E9E9E] text-center mt-4"
          >
            Tip: I'm not a vet, but I can help you know when to see one!
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function FeatureItem({ icon: Icon, color, text }) {
  return (
    <div className="flex items-center gap-3 bg-[#FDF8F3] rounded-xl p-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-sm text-[#3D3D3D] font-medium">{text}</p>
    </div>
  )
}

export default WelcomeModal
