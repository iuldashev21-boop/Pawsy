import { useId } from 'react'

/**
 * PremiumIcon - Paw-in-shield icon for Pawsy premium features
 *
 * A distinctive shield with paw print and gold star accent.
 * Supports gradient fills and multiple sizes.
 */

function PremiumIcon({ size = 20, className = '', gradient = true }) {
  const id = useId()
  const fill = gradient ? `url(#${id})` : 'currentColor'
  const accent = gradient ? '#FFF8E7' : 'currentColor'
  const accentOpacity = gradient ? 1 : 0.3

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {gradient && (
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD54F" />
            <stop offset="50%" stopColor="#F4A261" />
            <stop offset="100%" stopColor="#E8924F" />
          </linearGradient>
        </defs>
      )}

      {/* Shield */}
      <path
        d="M12 2.5C8 2.5 4 4.5 4 7.5V13C4 17 8 21.5 12 21.5C16 21.5 20 17 20 13V7.5C20 4.5 16 2.5 12 2.5Z"
        fill={fill}
        stroke={gradient ? '#E8924F' : 'currentColor'}
        strokeWidth="0.75"
        strokeLinejoin="round"
      />

      {/* Paw - main pad */}
      <ellipse
        cx="12"
        cy="14"
        rx="3"
        ry="2.2"
        fill={accent}
        opacity={accentOpacity}
      />

      {/* Paw - toe pads */}
      <circle cx="8" cy="10.2" r="1.4" fill={accent} opacity={accentOpacity} />
      <circle cx="10.1" cy="8.2" r="1.3" fill={accent} opacity={accentOpacity} />
      <circle cx="13.9" cy="8.2" r="1.3" fill={accent} opacity={accentOpacity} />
      <circle cx="16" cy="10.2" r="1.4" fill={accent} opacity={accentOpacity} />

      {/* Star accent at top-right */}
      <path
        d="M19.5 2L20 3.2L21.2 3.5L20 3.8L19.5 5L19 3.8L17.8 3.5L19 3.2Z"
        fill={gradient ? '#FFD54F' : 'currentColor'}
      />
    </svg>
  )
}

/**
 * PremiumBadge - Premium icon with circular background
 */
function PremiumBadge({ size = 40, iconSize, className = '' }) {
  const actualIconSize = iconSize || size * 0.5

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-[#FFF8E7] to-[#FFE4B5] flex items-center justify-center shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <PremiumIcon size={actualIconSize} />
    </div>
  )
}

export { PremiumIcon, PremiumBadge }
export default PremiumIcon
