/**
 * Single source of truth for premium CTA styling.
 * Every upgrade-related button should use these constants.
 */

export const premiumCTA = {
  gradient: 'bg-gradient-to-r from-[#F4A261] to-[#E8924F]',
  text: 'text-white font-bold',
  hover: 'hover:shadow-lg hover:shadow-[#F4A261]/20',
  ring: 'focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2',
}

export const premiumCTAClasses = `${premiumCTA.gradient} ${premiumCTA.text} ${premiumCTA.hover} ${premiumCTA.ring}`

export const premiumAccent = '#F4A261'

export const premiumLabel = 'Upgrade to Premium'
