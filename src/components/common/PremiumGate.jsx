import { motion, useReducedMotion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { usePremium } from '../../hooks/usePremium'
import PremiumIcon, { PremiumBadge } from './PremiumIcon'
import { premiumCTAClasses, premiumLabel } from '../../constants/premiumStyles'

/**
 * PremiumGate - Reusable "Visible but Locked" gate component
 *
 * Variants:
 * - overlay (default): Blur content + CTA overlay
 * - card: Locked placeholder card (no children rendered)
 * - inline: Compact row with lock + message
 *
 * Props:
 * - children: Content to gate (rendered normally for premium users)
 * - variant: 'overlay' | 'card' | 'inline'
 * - title: Gate title text
 * - description: Gate description text
 * - ctaText: CTA button label
 * - onUpgrade: Called when CTA clicked
 * - icon: Optional lucide icon component for card variant
 * - className: Additional classes
 */
function PremiumGate({
  children,
  variant = 'overlay',
  title,
  description,
  ctaText = premiumLabel,
  onUpgrade,
  icon: IconComponent,
  className = '',
}) {
  const { isPremium } = usePremium()
  const prefersReducedMotion = useReducedMotion()
  const handleUpgrade = () => {
    onUpgrade
      ? onUpgrade()
      : window.dispatchEvent(new CustomEvent('pawsy:openUpgrade'))
  }

  // Premium users see content normally
  if (isPremium) {
    return children || null
  }

  // Animation props respecting reduced motion
  const fadeIn = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } }

  // ── Overlay variant ──
  if (variant === 'overlay') {
    return (
      <div className={`relative ${className}`}>
        {/* Blurred content */}
        <div
          className="select-none"
          style={{ filter: 'blur(6px)', pointerEvents: 'none' }}
          aria-hidden="true"
        >
          {children}
        </div>

        {/* CTA overlay */}
        <motion.div
          {...fadeIn}
          className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(255,252,247,0.7) 0%, rgba(255,248,240,0.6) 100%)' }}
        >
          <div className="text-center px-4 py-5 max-w-[260px]">
            <PremiumBadge size={44} className="mx-auto mb-3" />
            {title && (
              <h3
                className="font-bold text-[15px] text-[#3D3D3D] mb-1"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-[#6B6B6B] mb-3 leading-relaxed">
                {description}
              </p>
            )}
            <button
              onClick={handleUpgrade}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg shadow-md transition-shadow ${premiumCTAClasses}`}
            >
              <PremiumIcon size={14} gradient={false} />
              {ctaText}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Card variant ──
  if (variant === 'card') {
    return (
      <motion.div
        {...fadeIn}
        className={`bg-gradient-to-br from-[#FFF8E7] via-[#FFE4B5] to-[#FFD699] rounded-2xl p-4 border border-[#E8B855]/30 ${className}`}
        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)' }}
      >
        <div className="flex items-start gap-3">
          {/* Icon with lock badge */}
          <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center relative flex-shrink-0">
            {IconComponent ? (
              <IconComponent className="w-5 h-5 text-[#F4A261]" aria-hidden="true" />
            ) : (
              <PremiumIcon size={20} />
            )}
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F4A261] flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-white" aria-hidden="true" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {title && (
              <h3
                className="font-semibold text-sm text-[#3D3D3D] mb-0.5"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-[#6B6B6B] leading-relaxed mb-2">
                {description}
              </p>
            )}
            <button
              onClick={handleUpgrade}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#F4A261] hover:text-[#E8924F] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 rounded"
            >
              <PremiumIcon size={12} gradient={false} />
              {ctaText} →
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // ── Inline variant ──
  if (variant === 'inline') {
    return (
      <motion.div
        {...fadeIn}
        className={`flex items-center gap-2 text-sm ${className}`}
      >
        <PremiumIcon size={14} />
        {description && <span className="text-[#6B6B6B]">{description}</span>}
        <button
          onClick={handleUpgrade}
          className="text-[#F4A261] font-medium hover:text-[#E8924F] transition-colors focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 rounded"
        >
          Upgrade →
        </button>
      </motion.div>
    )
  }

  return children || null
}

export default PremiumGate
