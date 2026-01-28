import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ClipboardList,
  ScanLine,
  Droplets,
  Pill,
  Activity,
  Dna,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { useDog } from '../context/DogContext'

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
      stiffness: 300,
      damping: 24,
    },
  },
}

const noAnimation = {}

// Organized feature data by sections
const healthFeatures = {
  hero: {
    id: 'clinical-profile',
    label: 'Clinical Profile',
    description: 'Complete health summary and medical overview for your pet',
    icon: ClipboardList,
    path: '/clinical-profile',
    iconGradient: 'linear-gradient(135deg, #FFE8D6 0%, #FFD6B0 100%)',
    iconColor: '#E8924F',
  },
  diagnostics: [
    {
      id: 'xray-analysis',
      label: 'X-Ray Analysis',
      description: 'AI-powered X-ray review',
      icon: ScanLine,
      path: '/xray-analysis',
      iconGradient: 'linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)',
      iconColor: '#5FB3B3',
    },
    {
      id: 'blood-work',
      label: 'Blood Work',
      description: 'Lab results analysis',
      icon: Droplets,
      path: '/blood-work',
      iconGradient: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
      iconColor: '#EF5350',
    },
  ],
  care: [
    {
      id: 'medications',
      label: 'Medications',
      description: 'Track & manage meds',
      icon: Pill,
      path: '/medications',
      iconGradient: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
      iconColor: '#F4A261',
    },
    {
      id: 'health-timeline',
      label: 'Health Timeline',
      description: 'Health event history',
      icon: Activity,
      path: '/health-timeline',
      iconGradient: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
      iconColor: '#66BB6A',
    },
    {
      id: 'breed-insights',
      label: 'Breed Insights',
      description: 'Breed-specific health info',
      icon: Dna,
      path: '/breed-info',
      iconGradient: 'linear-gradient(135deg, #EDE7F6 0%, #D1C4E9 100%)',
      iconColor: '#9575CD',
      layout: 'wide',
    },
  ],
  records: [
    {
      id: 'vet-reports',
      label: 'Vet Reports',
      description: 'Veterinary documentation',
      icon: FileText,
      path: '/vet-reports',
      iconGradient: 'linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)',
      iconColor: '#5FB3B3',
      layout: 'wide',
    },
  ],
}

// Section label component
function SectionLabel({ children }) {
  return (
    <p
      className="text-[11px] font-semibold text-[#8C7B6B] uppercase tracking-wide mt-5 mb-2 px-1"
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      {children}
    </p>
  )
}

// Hero card component - large featured card
function HeroCard({ feature, variants }) {
  const IconComponent = feature.icon

  return (
    <motion.div variants={variants}>
      <Link
        to={feature.path}
        className="block rounded-2xl p-5 transition-all hover:shadow-lg active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
        style={{
          background: 'linear-gradient(135deg, #FFF5ED 0%, #FFE8D6 100%)',
          border: '1px solid rgba(244,162,97,0.2)',
          boxShadow: '0 2px 12px rgba(244,162,97,0.1)',
          minHeight: '140px',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: feature.iconGradient }}
          >
            <IconComponent
              className="w-7 h-7"
              style={{ color: feature.iconColor }}
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[16px] font-bold text-[#2D2A26] leading-tight mb-1"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {feature.label}
            </p>
            <p
              className="text-[13px] text-[#6B6B6B] leading-snug"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {feature.description}
            </p>
          </div>
          <ChevronRight
            className="w-5 h-5 text-[#C5B8A8] flex-shrink-0"
            aria-hidden="true"
          />
        </div>
      </Link>
    </motion.div>
  )
}

// Standard grid card component
function StandardCard({ feature, variants }) {
  const IconComponent = feature.icon

  return (
    <motion.div variants={variants}>
      <Link
        to={feature.path}
        className="block rounded-2xl p-4 transition-all hover:shadow-md active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 h-full"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,252,247,0.9) 100%)',
          border: '1px solid rgba(232,221,208,0.5)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)',
          minHeight: '100px',
        }}
      >
        <div className="flex flex-col h-full">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
            style={{ background: feature.iconGradient }}
          >
            <IconComponent
              className="w-5 h-5"
              style={{ color: feature.iconColor }}
              aria-hidden="true"
            />
          </div>
          <div className="flex-1">
            <p
              className="text-[13px] font-bold text-[#2D2A26] leading-tight mb-1"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {feature.label}
            </p>
            <p
              className="text-[11px] text-[#6B6B6B] leading-snug"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {feature.description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Wide horizontal card component
function WideCard({ feature, variants }) {
  const IconComponent = feature.icon

  return (
    <motion.div variants={variants}>
      <Link
        to={feature.path}
        className="block rounded-2xl p-4 transition-all hover:shadow-md active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,252,247,0.9) 100%)',
          border: '1px solid rgba(232,221,208,0.5)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)',
          minHeight: '72px',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: feature.iconGradient }}
          >
            <IconComponent
              className="w-5 h-5"
              style={{ color: feature.iconColor }}
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[13px] font-bold text-[#2D2A26] leading-tight mb-0.5"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {feature.label}
            </p>
            <p
              className="text-[11px] text-[#6B6B6B] leading-snug"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {feature.description}
            </p>
          </div>
          <ChevronRight
            className="w-4 h-4 text-[#C5B8A8] flex-shrink-0"
            aria-hidden="true"
          />
        </div>
      </Link>
    </motion.div>
  )
}

function HealthHub() {
  const { activeDog } = useDog()
  const prefersReducedMotion = useReducedMotion()

  const staggerContainerSafe = prefersReducedMotion ? noAnimation : staggerContainer
  const staggerItemSafe = prefersReducedMotion ? noAnimation : staggerItem

  // Separate grid items and wide items in care section
  const careGridItems = healthFeatures.care.filter(f => f.layout !== 'wide')
  const careWideItems = healthFeatures.care.filter(f => f.layout === 'wide')

  return (
    <div className="min-h-full" style={{ background: '#FAF6F1' }}>
      <motion.main
        className="max-w-lg md:max-w-3xl mx-auto px-4 md:px-8 py-4 md:py-8"
        variants={staggerContainerSafe}
        initial={prefersReducedMotion ? false : 'initial'}
        animate={prefersReducedMotion ? false : 'animate'}
      >
        {/* Page Header */}
        <motion.div variants={staggerItemSafe} className="mb-5">
          <h1
            className="text-xl md:text-2xl font-extrabold text-[#2D2A26] leading-tight"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {activeDog?.name ? `${activeDog.name}'s Health Hub` : 'Health Hub'}
          </h1>
          <p
            className="text-sm text-[#6B6B6B] mt-1"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            All your health tools in one place
          </p>
        </motion.div>

        {/* Hero Card - Clinical Profile */}
        <HeroCard feature={healthFeatures.hero} variants={staggerItemSafe} />

        {/* Diagnostics Section */}
        <motion.div variants={staggerItemSafe}>
          <SectionLabel>Diagnostics</SectionLabel>
        </motion.div>
        <div className="grid grid-cols-2 gap-3">
          {healthFeatures.diagnostics.map((feature) => (
            <StandardCard
              key={feature.id}
              feature={feature}
              variants={staggerItemSafe}
            />
          ))}
        </div>

        {/* Care & Monitoring Section */}
        <motion.div variants={staggerItemSafe}>
          <SectionLabel>Care & Monitoring</SectionLabel>
        </motion.div>
        <div className="grid grid-cols-2 gap-3">
          {careGridItems.map((feature) => (
            <StandardCard
              key={feature.id}
              feature={feature}
              variants={staggerItemSafe}
            />
          ))}
        </div>
        <div className="mt-3 space-y-3">
          {careWideItems.map((feature) => (
            <WideCard
              key={feature.id}
              feature={feature}
              variants={staggerItemSafe}
            />
          ))}
        </div>

        {/* Records Section */}
        <motion.div variants={staggerItemSafe}>
          <SectionLabel>Records</SectionLabel>
        </motion.div>
        <div className="space-y-3">
          {healthFeatures.records.map((feature) => (
            <WideCard
              key={feature.id}
              feature={feature}
              variants={staggerItemSafe}
            />
          ))}
        </div>
      </motion.main>
    </div>
  )
}

export default HealthHub
