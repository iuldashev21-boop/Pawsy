import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { MessageCircle, Camera } from 'lucide-react'
import PawsyMascot from '../mascot/PawsyMascot'
import { useDog } from '../../context/DogContext'

function ChatLauncherWidget() {
  const navigate = useNavigate()
  const { activeDog } = useDog()
  const prefersReducedMotion = useReducedMotion()

  const dogName = activeDog?.name || 'your dog'

  const handleStartChat = () => {
    navigate('/chat')
  }

  const handlePhotoAnalysis = () => {
    navigate('/photo')
  }

  return (
    <div
      className="overflow-hidden"
    >
      <div className="p-6 md:p-8">
        {/* Mascot */}
        <div className="flex justify-center mb-5">
          <PawsyMascot mood="happy" size={120} />
        </div>

        {/* Greeting */}
        <div className="text-center mb-7">
          <h3
            className="text-[22px] md:text-[24px] font-bold text-[#2D2A26] leading-tight"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Hi! I&apos;m Pawsy
          </h3>
          <p
            className="text-[15px] md:text-[16px] text-[#6B6B6B] mt-2 leading-relaxed"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Your AI vet assistant for {dogName}. Ask me anything about health, symptoms, or care.
          </p>
        </div>

        {/* Primary CTA — Start Chat */}
        <motion.button
          onClick={handleStartChat}
          whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
          className="w-full flex items-center justify-center gap-3 rounded-2xl text-[17px] font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 active:brightness-95"
          style={{
            height: '64px',
            background: 'linear-gradient(135deg, #F4A261 0%, #E8924F 100%)',
            color: 'white',
            fontFamily: 'Nunito, sans-serif',
            boxShadow: '0 2px 10px rgba(244,162,97,0.3), 0 1px 3px rgba(0,0,0,0.06)',
          }}
          aria-label="Start chat with Pawsy"
        >
          <MessageCircle className="w-5.5 h-5.5" aria-hidden="true" />
          Start chat with Pawsy
        </motion.button>

        {/* Secondary CTA — Scan a Photo */}
        <motion.button
          onClick={handlePhotoAnalysis}
          whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
          className="w-full mt-3 flex items-center justify-center gap-2.5 rounded-2xl text-[15px] font-semibold transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 active:brightness-95"
          style={{
            height: '52px',
            background: 'rgba(244,162,97,0.1)',
            color: '#E8924F',
            fontFamily: 'Nunito, sans-serif',
            border: '1.5px solid rgba(244,162,97,0.3)',
          }}
          aria-label="Scan a photo"
        >
          <Camera className="w-5 h-5" aria-hidden="true" />
          Scan a photo
        </motion.button>
      </div>
    </div>
  )
}

export default ChatLauncherWidget
