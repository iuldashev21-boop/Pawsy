import { useCallback, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Camera,
  MapPin,
  BookOpen,
  Settings,
  ChevronRight,
  Dog,
  Sun,
  Sunset,
  Moon,
  Home,
  MessageCircle,
  Heart,
  ArrowRight,
  Leaf,
  Sparkles
} from 'lucide-react'
import PremiumFeatureCard from '../components/dashboard/PremiumFeatureCard'
import PetCardActions from '../components/dashboard/PetCardActions'
import PremiumFeatureModal from '../components/premium/PremiumFeatureModal'
import { useAuth } from '../context/AuthContext'
import { useDog } from '../context/DogContext'
import { useOnboarding } from '../context/OnboardingContext'
import BottomNav from '../components/layout/BottomNav'
import PawsyMascot from '../components/mascot/PawsyMascot'
import UsageStatsCard from '../components/dashboard/UsageStatsCard'
import DashboardPremiumCard from '../components/dashboard/DashboardPremiumCard'
import HealthStreak from '../components/dashboard/HealthStreak'
import WelcomeModal from '../components/onboarding/WelcomeModal'
import Skeleton from '../components/common/SkeletonLoader'
import PremiumIcon from '../components/common/PremiumIcon'
import { usePremium } from '../hooks/usePremium'
import { useToast } from '../context/ToastContext'

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

const desktopNavItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/photo', icon: Camera, label: 'Photo' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

const quickLinks = [
  { path: '/emergency-guides', icon: BookOpen, iconColor: '#D4854A', label: 'First Aid Guides', description: 'CPR, choking, poisoning & more' },
  { path: '/toxic-checker', icon: Leaf, iconColor: '#E8924F', label: 'Toxic Food / Plants', description: "Check what's safe for your dog" },
]

const cardStyle = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,252,247,0.8) 100%)',
  border: '1px solid rgba(232,221,208,0.5)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)',
}

const cardStyleElevated = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,252,247,0.85) 100%)',
  border: '1px solid rgba(232,221,208,0.5)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)',
}

const dividerStyle = { background: 'rgba(232,221,208,0.4)' }

const quickLinkIconStyle = {
  background: 'linear-gradient(135deg, #FFE8D6 0%, #FFD6B8 100%)',
  boxShadow: '0 2px 6px rgba(232,146,79,0.1)',
}

const hoverUp = { y: -3 }
const tapScale = { scale: 0.97 }
const noAnimation = {}

const savedHistoryItems = [
  { Icon: MessageCircle, color: 'text-[#7EC8C8]', text: 'All chat sessions stored & searchable' },
  { Icon: Camera, color: 'text-[#F4A261]', text: 'Photo analyses saved with findings' },
  { Icon: Sparkles, color: 'text-[#5AB3B3]', text: 'Pawsy remembers everything \u2014 advice tailored to your dog' },
]

const premiumFeatureIds = ['medicationManager', 'healthTimeline', 'breedInsights']

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good morning', Icon: Sun, color: '#E8924F' }
  if (hour < 18) return { text: 'Good afternoon', Icon: Sunset, color: '#D4854A' }
  return { text: 'Good evening', Icon: Moon, color: '#5A9E9E' }
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

function QuickLinkList({ links, containerClass, linkClass, iconClass, labelClass, descClass, dividerClass }) {
  return links.map((link, idx) => {
    const LinkIcon = link.icon
    return (
      <div key={link.path}>
        {idx > 0 && <div className={dividerClass} style={dividerStyle} />}
        <Link
          to={link.path}
          className={`group block ${linkClass} hover:bg-[#F4A261]/[0.03] active:scale-[0.99] transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-inset`}
        >
          <div className={`flex items-center ${containerClass}`}>
            <div
              className={`${iconClass} rounded-xl flex items-center justify-center flex-shrink-0`}
              style={quickLinkIconStyle}
            >
              <LinkIcon className={labelClass} style={{ color: link.iconColor }} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className={`font-bold text-[#2D2A26] text-[13px] ${descClass} leading-tight`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {link.label}
              </h4>
              <p className="text-[#8C7B6B] text-[11px] leading-tight mt-0.5" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {link.description}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#C5B8A8] flex-shrink-0 group-hover:translate-x-1 transition-transform duration-250" aria-hidden="true" />
          </div>
        </Link>
      </div>
    )
  })
}

function UsageStatsSection({ dogsLoading, onUpgrade }) {
  return dogsLoading ? (
    <Skeleton.UsageStats />
  ) : (
    <UsageStatsCard onUpgrade={onUpgrade} />
  )
}

function Dashboard() {
  const { user } = useAuth()
  const { activeDog, loading: dogsLoading } = useDog()
  const { isPremium } = usePremium()
  const { showWelcome, dismissWelcome, completeStep, progress } = useOnboarding()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const { showToast } = useToast()
  const [premiumDismissed, setPremiumDismissed] = useState(false)
  const [premiumModalFeature, setPremiumModalFeature] = useState(null)

  const staggerContainerSafe = prefersReducedMotion ? noAnimation : staggerContainer
  const staggerItemSafe = prefersReducedMotion ? noAnimation : staggerItem
  const heroEntranceSafe = prefersReducedMotion ? noAnimation : heroEntrance
  const hoverEffect = prefersReducedMotion ? noAnimation : hoverUp
  const tapEffect = prefersReducedMotion ? noAnimation : tapScale

  if (activeDog && !progress.hasDog) {
    completeStep('hasDog')
  }

  const greeting = getGreeting()

  const handleUpgrade = useCallback(() => {
    showToast('Premium upgrade coming soon! For now, enjoy free features.', 'premium')
  }, [showToast])

  const handleFeatureClick = useCallback((featureId) => {
    if (isPremium) {
      showToast('Coming soon! This feature is under development.')
    } else {
      setPremiumModalFeature(featureId)
    }
  }, [isPremium, showToast])

  const dismissPremium = useCallback(() => setPremiumDismissed(true), [])
  const closePremiumModal = useCallback(() => setPremiumModalFeature(null), [])

  return (
    <div className="min-h-screen bg-[#FAF6F1] pb-24 md:pb-12 relative dashboard-grain">
      {/* Ambient background — organic warm washes */}
      <div className="hidden md:block fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-32 right-[10%] w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(244,162,97,0.06) 0%, rgba(244,162,97,0.02) 40%, transparent 70%)' }}
        />
        <div
          className="absolute top-[60%] -left-48 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(126,200,200,0.05) 0%, rgba(126,200,200,0.015) 40%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-[30%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,146,79,0.03) 0%, transparent 60%)' }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FAF6F1]/85 backdrop-blur-xl border-b border-[#E8DDD0]/40">
        <div className="max-w-lg md:max-w-5xl mx-auto px-4 md:px-8 py-3 md:py-3.5 flex items-center justify-between">
          {/* Mobile: Greeting + user name */}
          <div className="flex items-center gap-3 md:hidden">
            <div>
              <p className="text-[13px] text-[#8C7B6B] flex items-center gap-1.5 tracking-wide" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <greeting.Icon className="w-3.5 h-3.5" style={{ color: greeting.color }} aria-hidden="true" />
                {greeting.text}
              </p>
              <h1
                className="text-lg font-extrabold text-[#2D2A26] leading-tight"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {user?.name || 'Pet Parent'}
              </h1>
            </div>
          </div>

          {/* Desktop: Logo + Dog profile inline */}
          <div className="hidden md:flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #F4A261 0%, #E8924F 60%, #D4854A 100%)',
                boxShadow: '0 2px 8px rgba(244,162,97,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <Heart className="w-5 h-5 text-white" strokeWidth={2.5} aria-hidden="true" />
            </div>

            {activeDog && (
              <DogAvatar
                dog={activeDog}
                size={44}
                iconSize="w-5 h-5"
                className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0"
                style={{
                  border: '2px solid rgba(244,162,97,0.25)',
                  background: 'linear-gradient(135deg, #FFE8D6 0%, #FFD6B0 100%)',
                }}
              />
            )}

            <div className="min-w-0">
              <p className="text-[13px] text-[#8C7B6B] flex items-center gap-1.5 tracking-wide" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <greeting.Icon className="w-3.5 h-3.5" style={{ color: greeting.color }} aria-hidden="true" />
                {greeting.text}
              </p>
              <div className="flex items-center gap-2">
                <h1
                  className="text-[20px] font-extrabold text-[#2D2A26] leading-tight"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {activeDog ? (
                    <>
                      {user?.name || 'You'} & {activeDog.name}
                    </>
                  ) : (
                    user?.name || 'Pet Parent'
                  )}
                </h1>
                {activeDog && (
                  <>
                    <PetCardActions
                      isPremium={isPremium}
                      onFeatureClick={handleFeatureClick}
                    />
                    <HealthStreak />
                  </>
                )}
              </div>
              {activeDog && (
                <DogDetailText dog={activeDog} className="text-[12px] text-[#8C7B6B] mt-0.5" />
              )}
            </div>
          </div>

          {/* Mobile: Settings icon */}
          <Link
            to="/settings"
            className="md:hidden w-10 h-10 rounded-2xl bg-white/80 shadow-sm border border-[#E8DDD0]/60 flex items-center justify-center hover:bg-white active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-[#8C7B6B]" aria-hidden="true" />
          </Link>

          {/* Desktop: Flat nav */}
          <nav className="hidden md:flex items-center gap-2">
            {desktopNavItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-3 py-2 text-[13px] font-bold tracking-tight transition-all duration-250 focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 rounded ${
                    isActive
                      ? 'text-[#E8924F] border-b-2 border-[#E8924F]'
                      : 'text-[#A09585] hover:text-[#6B5E52]'
                  }`
                }
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                <Icon className="w-[15px] h-[15px]" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <motion.main
        className="max-w-lg md:max-w-5xl mx-auto px-4 md:px-8 py-3 md:py-8 relative z-[2]"
        variants={staggerContainerSafe}
        initial={prefersReducedMotion ? false : "initial"}
        animate={prefersReducedMotion ? false : "animate"}
      >
        <div className="md:flex md:gap-10 md:items-start">
          {/* Left Column */}
          <div className="md:flex-1 md:min-w-0">

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

            {/* Hero CTA */}
            <motion.div variants={heroEntranceSafe} className="mb-3 md:mb-6">
              <Link
                to="/chat"
                className="group block relative overflow-hidden rounded-2xl md:rounded-3xl text-white active:scale-[0.98] transition-transform focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                style={{
                  background: 'linear-gradient(135deg, #7EC8C8 0%, #5CB8B8 35%, #4AACAC 65%, #3D9E9E 100%)',
                  boxShadow: '0 4px 20px rgba(126,200,200,0.25), 0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
              >
                {/* Organic background shapes */}
                <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                  <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/[0.05]" />
                  <div className="absolute -right-6 -bottom-20 w-44 h-44 rounded-full bg-white/[0.04]" />
                  <div className="hidden md:block absolute left-[30%] -bottom-10 w-32 h-32 rounded-full bg-white/[0.03]" />
                  {/* Desktop shimmer line */}
                  <div className="hidden md:block hero-shimmer-line absolute inset-0" />
                </div>

                <div className="relative p-4 md:p-8">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="flex-shrink-0 md:group-hover:scale-110 transition-transform duration-500 ease-out">
                      <PawsyMascot mood="happy" size={40} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-bold text-[15px] md:text-2xl leading-tight mb-1"
                        style={{ fontFamily: "'Fraunces', 'Nunito', serif" }}
                      >
                        Start Health Check
                      </h4>
                      <p className="text-white/70 text-xs md:text-sm leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        Describe symptoms, ask health questions, or check concerns
                      </p>
                    </div>
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all duration-300"
                      style={{ background: 'rgba(255,255,255,0.12)' }}
                    >
                      <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-0.5 transition-transform duration-300" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Action Cards */}
            <motion.div variants={staggerItemSafe} className="grid grid-cols-2 gap-2.5 md:gap-4 mb-3 md:mb-6">
              {/* Scan Photo */}
              <motion.button
                whileHover={hoverEffect}
                whileTap={tapEffect}
                onClick={() => navigate('/photo')}
                aria-label="Scan photo for visual health check"
                className="group text-left cursor-pointer rounded-2xl md:rounded-3xl p-3.5 md:p-5 transition-shadow duration-300 focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                style={{
                  background: 'linear-gradient(145deg, #EFF9FA 0%, #E2F4F5 50%, #D6EFF0 100%)',
                  border: '1px solid rgba(126,200,200,0.2)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(126,200,200,0.2) 0%, rgba(90,175,175,0.15) 100%)',
                    boxShadow: '0 2px 6px rgba(126,200,200,0.12)',
                  }}
                >
                  <Camera className="w-5 h-5 md:w-6 md:h-6 text-[#4A9E9E]" aria-hidden="true" />
                </div>
                <h4
                  className="font-bold text-[13px] md:text-[15px] text-[#2D2A26] mb-0.5"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Scan Photo
                </h4>
                <p className="text-[#8C7B6B] text-[11px] md:text-xs" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  AI visual health check
                </p>
              </motion.button>

              {/* Emergency */}
              <motion.div
                whileHover={hoverEffect}
                whileTap={tapEffect}
              >
                <Link
                  to="/emergency-vet"
                  className="group block rounded-2xl md:rounded-3xl p-3.5 md:p-5 text-white h-full transition-shadow duration-300 focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
                  style={{
                    background: 'linear-gradient(145deg, #EF5350 0%, #E53935 50%, #D32F2F 100%)',
                    boxShadow: '0 2px 8px rgba(239,83,80,0.2), 0 4px 16px rgba(239,83,80,0.1), inset 0 1px 0 rgba(255,255,255,0.12)',
                  }}
                >
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    <MapPin className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
                  </div>
                  <h4
                    className="font-bold text-[13px] md:text-[15px] mb-0.5"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    Emergency
                  </h4>
                  <p className="text-white/70 text-[11px] md:text-xs" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Find vet now
                  </p>
                </Link>
              </motion.div>
            </motion.div>

            {/* Quick Links — Mobile only (desktop version in sidebar) */}
            <motion.div
              variants={staggerItemSafe}
              className="rounded-2xl overflow-hidden mb-3 md:hidden transition-shadow duration-300"
              style={cardStyle}
            >
              <QuickLinkList
                links={quickLinks}
                containerClass="gap-3 md:gap-4"
                linkClass="px-4 py-3.5 md:px-6 md:py-5"
                iconClass="w-9 h-9 md:w-11 md:h-11 md:rounded-2xl"
                labelClass="w-4 h-4 md:w-5 md:h-5"
                descClass="md:text-sm"
                dividerClass="h-px mx-4 md:mx-6"
              />
            </motion.div>

            {/* Smart Health Tools */}
            <motion.div variants={staggerItemSafe} className="mb-3 md:mb-6">
              <div className="flex items-center gap-2 mb-2 px-0.5">
                <h3
                  className="font-bold text-sm text-[#2D2A26]"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Smart Health Tools
                </h3>
                {!isPremium && <PremiumIcon size={14} />}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {premiumFeatureIds.map((featureId) => (
                  <div key={featureId} className={featureId === 'breedInsights' ? 'col-span-2' : undefined}>
                    <PremiumFeatureCard
                      featureId={featureId}
                      isPremium={isPremium}
                      onFeatureClick={handleFeatureClick}
                      onUpgrade={handleUpgrade}
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Usage Stats - Mobile only */}
            <motion.div variants={staggerItemSafe} className="mb-2 md:hidden">
              <UsageStatsSection dogsLoading={dogsLoading} onUpgrade={handleUpgrade} />
            </motion.div>

            {/* Premium Card - Mobile only */}
            <motion.div variants={staggerItemSafe} className="mb-2 md:hidden">
              <DashboardPremiumCard
                dogName={activeDog?.name}
                onUpgrade={handleUpgrade}
                dismissed={premiumDismissed}
                onDismiss={dismissPremium}
              />
            </motion.div>

          </div>

          {/* Right Sidebar — Desktop only */}
          <aside className="hidden md:block md:w-[320px] md:flex-shrink-0 md:sticky md:top-24">
            <div className="sidebar-panel space-y-4">
              <UsageStatsSection dogsLoading={dogsLoading} onUpgrade={handleUpgrade} />

              {/* Quick Links */}
              <div
                className="rounded-2xl overflow-hidden transition-shadow duration-300"
                style={cardStyle}
              >
                <QuickLinkList
                  links={quickLinks}
                  containerClass="gap-3"
                  linkClass="px-4 py-3"
                  iconClass="w-9 h-9"
                  labelClass="w-4 h-4"
                  descClass=""
                  dividerClass="h-px mx-4"
                />
              </div>

              {/* Saved History — Premium upsell */}
              <div
                className="rounded-2xl p-4 transition-shadow duration-300"
                style={cardStyleElevated}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(126,200,200,0.15) 0%, rgba(90,175,175,0.1) 100%)' }}
                  >
                    <Sparkles className="w-4 h-4 text-[#5AB3B3]" aria-hidden="true" />
                  </div>
                  <h4
                    className="font-bold text-[13px] text-[#2D2A26] leading-tight"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    Saved History
                  </h4>
                </div>

                <div className="space-y-2 mb-3">
                  {savedHistoryItems.map(({ Icon, color, text }) => (
                    <div key={text} className="flex items-start gap-2.5">
                      <Icon className={`w-3.5 h-3.5 ${color} mt-0.5 flex-shrink-0`} aria-hidden="true" />
                      <p className="text-[11px] text-[#6B5E52] leading-snug" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        {text}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleUpgrade}
                  className="w-full py-2 rounded-xl text-[12px] font-bold transition-all duration-200 hover:shadow-md active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 flex items-center justify-center gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, #F4A261 0%, #E8924F 100%)',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(244,162,97,0.25)',
                  }}
                >
                  <PremiumIcon size={13} gradient={false} />
                  Unlock with Premium
                </button>
              </div>

              <DashboardPremiumCard
                dogName={activeDog?.name}
                onUpgrade={handleUpgrade}
                dismissed={premiumDismissed}
                onDismiss={dismissPremium}
              />
            </div>
          </aside>
        </div>
      </motion.main>

      {/* Session Notice — Footer */}
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

      <BottomNav />

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
