import { motion, useReducedMotion } from 'framer-motion'
import { MessageCircle, Calendar, Bell, Lock, Sparkles } from 'lucide-react'
import PremiumIcon from '../common/PremiumIcon'
import { premiumCTAClasses, premiumLabel } from '../../constants/premiumStyles'

const features = [
  {
    icon: MessageCircle,
    label: 'Chat History',
    description: 'Saved & searchable sessions',
    color: '#7EC8C8',
    bgGradient: 'linear-gradient(135deg, rgba(126,200,200,0.15) 0%, rgba(90,175,175,0.1) 100%)',
  },
  {
    icon: Calendar,
    label: 'Care Schedule',
    description: 'Medication & vaccine tracking',
    color: '#F4A261',
    bgGradient: 'linear-gradient(135deg, rgba(244,162,97,0.15) 0%, rgba(232,146,79,0.1) 100%)',
  },
  {
    icon: Bell,
    label: 'Health Alerts',
    description: 'AI-powered health monitoring',
    color: '#EF5350',
    bgGradient: 'linear-gradient(135deg, rgba(239,83,80,0.12) 0%, rgba(211,47,47,0.08) 100%)',
  },
]

const mobileCardStyle = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,252,247,0.85) 100%)',
  border: '1px solid rgba(232,221,208,0.5)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)',
}

const desktopCardStyle = {
  background: 'linear-gradient(160deg, #FFFDF9 0%, #FFF8F0 40%, #FFF3E6 100%)',
  border: '1px solid rgba(244,162,97,0.18)',
  boxShadow: '0 2px 8px rgba(244,162,97,0.06), 0 8px 32px rgba(0,0,0,0.03)',
}

const featureRowMobileStyle = {
  background: 'rgba(253,248,243,0.6)',
  border: '1px solid rgba(232,221,208,0.35)',
}

const featureRowDesktopStyle = {
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(232,221,208,0.3)',
  boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
}

function PremiumShowcase() {
  const prefersReducedMotion = useReducedMotion()

  const handleUpgrade = () => {
    window.dispatchEvent(new CustomEvent('pawsy:openUpgrade'))
  }

  const animationProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }

  const featureStagger = prefersReducedMotion
    ? {}
    : (i) => ({
        initial: { opacity: 0, x: -8 },
        animate: { opacity: 1, x: 0, transition: { delay: 0.1 + i * 0.08, duration: 0.35, ease: 'easeOut' } },
      })

  return (
    <>
      {/* ── Mobile version ── */}
      <motion.div
        {...animationProps}
        className="md:hidden rounded-2xl p-4"
        style={mobileCardStyle}
      >
        <div className="flex items-center gap-2 mb-3">
          <PremiumIcon size={18} />
          <h3
            className="font-bold text-sm text-[#2D2A26]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Unlock Premium Features
          </h3>
        </div>

        <p
          className="text-xs text-[#6B6B6B] mb-4 leading-relaxed"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          Unlock saved chats, care reminders, and health alerts
        </p>

        <div className="space-y-2 mb-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.label}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={featureRowMobileStyle}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 relative"
                  style={{ background: feature.bgGradient }}
                >
                  <Icon className="w-4 h-4" style={{ color: feature.color }} aria-hidden="true" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F4A261] flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5 text-white" aria-hidden="true" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[13px] text-[#2D2A26] leading-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {feature.label}
                  </h4>
                  <p className="text-[11px] text-[#8C7B6B] leading-tight" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={handleUpgrade}
          className={`w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all ${premiumCTAClasses}`}
        >
          <PremiumIcon size={16} gradient={false} />
          {premiumLabel}
        </button>
      </motion.div>

      {/* ── Desktop version — spacious sidebar card ── */}
      <motion.div
        {...animationProps}
        className="hidden md:block rounded-3xl p-6 relative overflow-hidden"
        style={desktopCardStyle}
      >
        {/* Decorative warm radial accents */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none" aria-hidden="true"
          style={{ background: 'radial-gradient(circle, rgba(244,162,97,0.08) 0%, transparent 70%)' }}
        />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full pointer-events-none" aria-hidden="true"
          style={{ background: 'radial-gradient(circle, rgba(126,200,200,0.06) 0%, transparent 70%)' }}
        />

        {/* Header */}
        <div className="relative flex items-start gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE4C4 100%)',
              boxShadow: '0 2px 8px rgba(244,162,97,0.12)',
            }}
          >
            <PremiumIcon size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-extrabold text-[17px] text-[#2D2A26] leading-tight"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Unlock Premium
            </h3>
            <p
              className="text-[13px] text-[#8C7B6B] leading-snug mt-0.5"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              Unlock saved chats, care reminders, and health alerts
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mb-5" style={{ background: 'linear-gradient(90deg, rgba(244,162,97,0.15), rgba(232,221,208,0.3), rgba(126,200,200,0.1))' }} aria-hidden="true" />

        {/* Feature cards — spacious */}
        <div className="space-y-3 mb-6 relative">
          {features.map((feature, i) => {
            const Icon = feature.icon
            const stagger = prefersReducedMotion ? {} : featureStagger(i)
            return (
              <motion.div
                key={feature.label}
                {...stagger}
                className="flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-200 hover:shadow-sm"
                style={featureRowDesktopStyle}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                  style={{ background: feature.bgGradient }}
                >
                  <Icon className="w-5 h-5" style={{ color: feature.color }} aria-hidden="true" />
                  <div
                    className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-[#F4A261] flex items-center justify-center"
                    style={{ boxShadow: '0 1px 3px rgba(244,162,97,0.3)' }}
                  >
                    <Lock className="w-2.5 h-2.5 text-white" strokeWidth={2.5} aria-hidden="true" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-bold text-[15px] text-[#2D2A26] leading-tight"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {feature.label}
                  </h4>
                  <p
                    className="text-[13px] text-[#8C7B6B] leading-snug mt-0.5"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          className={`relative w-full py-3.5 rounded-2xl text-[15px] flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-[0.98] ${premiumCTAClasses}`}
          style={{
            boxShadow: '0 4px 14px rgba(244,162,97,0.25), 0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <Sparkles className="w-[18px] h-[18px]" aria-hidden="true" />
          {premiumLabel}
        </button>
      </motion.div>
    </>
  )
}

export default PremiumShowcase
