import { useCallback, useEffect, useState, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Dog,
  MapPin,
  Lock,
  Heart,
  MessageCircle,
  Camera,
} from 'lucide-react'
import { useChat } from '../context/ChatContext'
import LocalStorageService from '../services/storage/LocalStorageService'
import PetCardActions from '../components/dashboard/PetCardActions'
import PremiumFeatureModal from '../components/premium/PremiumFeatureModal'
import { useAuth } from '../context/AuthContext'
import { useDog } from '../context/DogContext'
import { useOnboarding } from '../context/OnboardingContext'
import HealthStreak from '../components/dashboard/HealthStreak'
import WelcomeModal from '../components/onboarding/WelcomeModal'
import Skeleton from '../components/common/SkeletonLoader'
import { usePremium } from '../hooks/usePremium'
import { useToast } from '../context/ToastContext'
import ChatLauncherWidget from '../components/dashboard/ChatLauncherWidget'

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
}

const staggerItem = {
  initial: { opacity: 0, y: 16 },
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

const heroEntrance = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 0.25,
    },
  },
}

const cardStyle = {
  background: 'linear-gradient(135deg, rgba(255,252,247,0.95) 0%, rgba(255,248,240,0.9) 100%)',
  border: '1px solid rgba(232,221,208,0.5)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)',
}

const noAnimation = {}

function formatRelativeTime(isoString) {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function DogAvatar({ dog, size, iconSize, className, style }) {
  return (
    <div className={className} style={style}>
      {dog.photoUrl ? (
        <img src={dog.photoUrl} alt={dog.name} width={size} height={size} loading="lazy" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Dog className={`${iconSize} text-[#E8924F]`} aria-hidden="true" />
        </div>
      )}
    </div>
  )
}

function DogDetailText({ dog, className }) {
  return (
    <p className={className} style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {dog.breed || 'Mixed breed'}
      {dog.age && ` \u2022 ${dog.age}`}
      {dog.weight && ` \u2022 ${dog.weight} ${dog.weightUnit || 'lbs'}`}
    </p>
  )
}

function Dashboard() {
  useAuth()
  const { activeDog, loading: dogsLoading } = useDog()
  const { isPremium } = usePremium()
  const { showWelcome, dismissWelcome, completeStep, progress } = useOnboarding()
  const prefersReducedMotion = useReducedMotion()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [premiumModalFeature, setPremiumModalFeature] = useState(null)
  const { getSessionsForDog } = useChat()

  // Get most recent chat session for Continue Where You Left Off
  const recentChatSession = useMemo(() => {
    if (!activeDog || !isPremium) return null
    const sessions = getSessionsForDog(activeDog.id)
    if (sessions.length === 0) return null
    // Sort by updatedAt descending, take first
    return [...sessions].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0]
  }, [activeDog, isPremium, getSessionsForDog])

  // Get most recent photo analysis for Continue Where You Left Off
  const recentPhotoAnalysis = useMemo(() => {
    if (!activeDog || !isPremium) return null
    const analyses = LocalStorageService.getPhotoAnalyses(activeDog.id)
    return analyses.length > 0 ? analyses[0] : null // Already sorted by createdAt desc
  }, [activeDog, isPremium])

  const staggerContainerSafe = prefersReducedMotion ? noAnimation : staggerContainer
  const staggerItemSafe = prefersReducedMotion ? noAnimation : staggerItem
  const heroEntranceSafe = prefersReducedMotion ? noAnimation : heroEntrance
  if (activeDog && !progress.hasDog) {
    completeStep('hasDog')
  }

  const handleUpgrade = useCallback(() => {
    window.dispatchEvent(new CustomEvent('pawsy:openUpgrade'))
  }, [])

  const handleFeatureClick = useCallback((featureId) => {
    if (isPremium) {
      // Navigate to actual feature routes for premium users
      const featureRoutes = {
        clinicalProfile: '/clinical-profile',
        vetReport: '/vet-report',
        breedInsights: '/breed-info',
        healthTimeline: '/health-timeline',
        medicationManager: '/settings',
        alerts: '/alerts',
        unlimitedChat: '/chat',
        unlimitedPhoto: '/photo',
        labAnalysis: '/lab-analysis',
      }
      const route = featureRoutes[featureId]
      if (route) {
        navigate(route)
      } else {
        showToast('Coming soon! This feature is under development.')
      }
    } else {
      setPremiumModalFeature(featureId)
    }
  }, [isPremium, navigate, showToast])

  const closePremiumModal = useCallback(() => setPremiumModalFeature(null), [])

  // Listen for feature modal requests from AppHeader
  useEffect(() => {
    const handler = (e) => setPremiumModalFeature(e.detail.featureId)
    window.addEventListener('pawsy:openFeatureModal', handler)
    return () => window.removeEventListener('pawsy:openFeatureModal', handler)
  }, [])

  return (
    <div className="relative min-h-full">
      {/* Main content */}
      <motion.main
        className="max-w-lg md:max-w-3xl mx-auto px-4 md:px-8 py-3 md:py-8 relative z-[2]"
        variants={staggerContainerSafe}
        initial={prefersReducedMotion ? false : "initial"}
        animate={prefersReducedMotion ? false : "animate"}
      >
        <div>
          <div>

            {/* Dog Profile Card — Mobile only (desktop profile is in header) */}
            {dogsLoading ? (
              <motion.div variants={staggerItemSafe} className="mb-2 md:hidden">
                <Skeleton.DogProfile />
              </motion.div>
            ) : activeDog ? (
              <motion.div
                variants={staggerItemSafe}
                className="rounded-2xl p-3 mb-2 md:hidden transition-shadow duration-300"
                style={cardStyle}
              >
                <div className="flex items-center gap-3">
                  <DogAvatar
                    dog={activeDog}
                    size={56}
                    iconSize="w-7 h-7"
                    className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0"
                    style={{
                      border: '2.5px solid rgba(244,162,97,0.25)',
                      background: 'linear-gradient(135deg, #FFE8D6 0%, #FFD6B0 100%)',
                      boxShadow: '0 2px 8px rgba(244,162,97,0.12)',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3
                        className="text-base font-extrabold text-[#2D2A26] leading-tight"
                        style={{ fontFamily: 'Nunito, sans-serif' }}
                      >
                        {activeDog.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <PetCardActions
                          isPremium={isPremium}
                          onFeatureClick={handleFeatureClick}
                        />
                        <HealthStreak />
                      </div>
                    </div>
                    <DogDetailText dog={activeDog} className="text-xs text-[#8C7B6B]" />
                    {activeDog.allergies?.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-[11px] text-[#C75B3A] font-semibold tracking-wide uppercase" style={{ fontFamily: 'DM Sans, sans-serif' }}>Allergies</span>
                        <div className="flex flex-wrap gap-1">
                          {activeDog.allergies.map((allergy, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 bg-[#FEF0EC] text-[#C75B3A] rounded-full font-medium"
                              style={{ border: '1px solid rgba(199,91,58,0.15)' }}
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

            {/* ═══ Hero CTA ═══ */}
            <motion.div variants={heroEntranceSafe} className="mb-4 md:mb-7">
              <ChatLauncherWidget />
            </motion.div>

            {/* ═══ Premium Quick Actions Grid ═══ */}
            {isPremium && (
              <motion.div variants={staggerItemSafe} className="mb-4 md:mb-5">
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/health-hub"
                    className="flex items-center gap-3.5 p-4 active:scale-[0.97] transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #F4A261 0%, #E8924F 100%)',
                        boxShadow: '0 2px 8px rgba(244,162,97,0.25)',
                      }}
                    >
                      <Heart className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-[14px] font-bold text-[#2D2A26] leading-tight"
                        style={{ fontFamily: 'Nunito, sans-serif' }}
                      >
                        Health Hub
                      </p>
                      <p
                        className="text-[12px] text-[#6B6B6B] leading-tight mt-0.5"
                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                      >
                        All health tools
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/emergency-vet"
                    className="flex items-center gap-3.5 p-4 active:scale-[0.97] transition-all focus-visible:ring-2 focus-visible:ring-[#EF5350] focus-visible:ring-offset-2"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)',
                        boxShadow: '0 2px 8px rgba(239,83,80,0.25)',
                      }}
                    >
                      <MapPin className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-[14px] font-bold text-[#2D2A26] leading-tight"
                        style={{ fontFamily: 'Nunito, sans-serif' }}
                      >
                        Emergency
                      </p>
                      <p
                        className="text-[12px] text-[#6B6B6B] leading-tight mt-0.5"
                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                      >
                        Find nearby vet
                      </p>
                    </div>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ═══ Continue Where You Left Off — Premium Only ═══ */}
            {isPremium && (recentChatSession || recentPhotoAnalysis) && (
              <motion.div variants={staggerItemSafe} className="mb-4 md:mb-5">
                <h3
                  className="text-[12px] font-semibold text-[#8C7B6B] uppercase tracking-wide mb-2 px-0.5"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  Continue Where You Left Off
                </h3>
                <div className="flex flex-col gap-2">
                  {recentChatSession && (
                    <button
                      onClick={() => navigate('/chat', { state: { sessionId: recentChatSession.id } })}
                      className="flex items-center gap-3 rounded-2xl p-3 text-left transition-all hover:shadow-sm active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,252,247,0.95) 0%, rgba(255,248,240,0.9) 100%)',
                        border: '1px solid rgba(232,221,208,0.5)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #FFE8D6 0%, #FFD6B0 100%)',
                        }}
                      >
                        <MessageCircle className="w-4 h-4 text-[#E8924F]" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[13px] font-bold text-[#2D2A26] leading-tight truncate"
                          style={{ fontFamily: 'Nunito, sans-serif' }}
                        >
                          Continue your conversation about {recentChatSession.title}
                        </p>
                        <p
                          className="text-[11px] text-[#8C7B6B] mt-0.5"
                          style={{ fontFamily: 'DM Sans, sans-serif' }}
                        >
                          {formatRelativeTime(recentChatSession.updatedAt)}
                        </p>
                      </div>
                    </button>
                  )}

                  {recentPhotoAnalysis && (
                    <button
                      onClick={() => navigate('/photo', { state: { analysisId: recentPhotoAnalysis.id } })}
                      className="flex items-center gap-3 rounded-2xl p-3 text-left transition-all hover:shadow-sm active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,252,247,0.95) 0%, rgba(255,248,240,0.9) 100%)',
                        border: '1px solid rgba(232,221,208,0.5)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #FFE8D6 0%, #FFD6B0 100%)',
                        }}
                      >
                        <Camera className="w-4 h-4 text-[#E8924F]" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[13px] font-bold text-[#2D2A26] leading-tight truncate"
                          style={{ fontFamily: 'Nunito, sans-serif' }}
                        >
                          Review your {recentPhotoAnalysis.bodyArea || 'photo'} scan
                        </p>
                        <p
                          className="text-[11px] text-[#8C7B6B] mt-0.5"
                          style={{ fontFamily: 'DM Sans, sans-serif' }}
                        >
                          {formatRelativeTime(recentPhotoAnalysis.createdAt)}
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══ Quick Actions — free users only ═══ */}
            {!isPremium && (
              <motion.div variants={staggerItemSafe} className="mb-3 md:mb-6">
                <div className="grid grid-cols-2 gap-4 pl-24">
                  <Link
                    to="/emergency-vet"
                    className="group flex items-center gap-3.5 p-5 active:scale-[0.97] transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)',
                        boxShadow: '0 2px 8px rgba(239,83,80,0.25)',
                      }}
                    >
                      <MapPin className="w-5.5 h-5.5 text-white" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold text-[#2D2A26] leading-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
                        Emergency
                      </p>
                      <p className="text-[12px] text-[#6B6B6B] leading-tight mt-1">Find nearby vet</p>
                    </div>
                  </Link>

                  <button
                    onClick={handleUpgrade}
                    className="group flex items-center gap-3.5 p-5 text-left active:scale-[0.97] transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #F4A261 0%, #E8924F 100%)',
                        boxShadow: '0 2px 8px rgba(244,162,97,0.25)',
                      }}
                    >
                      <Lock className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold text-[#2D2A26] leading-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
                        Unlock
                      </p>
                      <p className="text-[12px] text-[#6B6B6B] leading-tight mt-1">Premium features</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </motion.main>

      {/* Session Notice — Footer (free users only) */}
      {!isPremium && (
        <div className="text-center py-4 md:py-6">
          <p className="text-[11px] md:text-xs tracking-wide text-[#B5A898]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Free version
            <span className="mx-2 text-[#DDD4C8]">/</span>
            <button
              onClick={handleUpgrade}
              className="text-[#E8924F] hover:text-[#D4854A] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 rounded"
            >
              Upgrade to save chats
            </button>
          </p>
        </div>
      )}

      <WelcomeModal
        isOpen={showWelcome}
        onClose={dismissWelcome}
        dogName={activeDog?.name}
      />

      <PremiumFeatureModal
        featureId={premiumModalFeature}
        isOpen={premiumModalFeature !== null}
        onClose={closePremiumModal}
        onUpgrade={handleUpgrade}
        dogName={activeDog?.name}
        breed={activeDog?.breed}
      />
    </div>
  )
}

export default Dashboard
