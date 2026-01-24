/**
 * PremiumIcon - Custom premium/crown icon for Pawsy
 *
 * A distinctive crown design with paw accent that replaces the generic Sparkles icon.
 * Supports gradient fills and multiple sizes.
 */

function PremiumIcon({ size = 20, className = '', gradient = true }) {
  const id = `premium-gradient-${Math.random().toString(36).substr(2, 9)}`

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

      {/* Crown base */}
      <path
        d="M4 17L3 8L7.5 11L12 5L16.5 11L21 8L20 17H4Z"
        fill={gradient ? `url(#${id})` : 'currentColor'}
        stroke={gradient ? '#E8924F' : 'currentColor'}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />

      {/* Crown base bar */}
      <rect
        x="4"
        y="17"
        width="16"
        height="3"
        rx="1"
        fill={gradient ? `url(#${id})` : 'currentColor'}
        stroke={gradient ? '#E8924F' : 'currentColor'}
        strokeWidth="0.5"
      />

      {/* Center jewel (paw pad shape) */}
      <ellipse
        cx="12"
        cy="13"
        rx="2"
        ry="1.5"
        fill={gradient ? '#FFF8E7' : 'currentColor'}
        opacity={gradient ? 1 : 0.3}
      />

      {/* Small sparkle accent */}
      <path
        d="M19 3L19.5 4.5L21 5L19.5 5.5L19 7L18.5 5.5L17 5L18.5 4.5L19 3Z"
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
