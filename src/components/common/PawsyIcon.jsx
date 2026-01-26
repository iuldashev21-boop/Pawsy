export default function PawsyIcon({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Pawsy"
    >
      <defs>
        <linearGradient id="pawsy-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F4A261" />
          <stop offset="100%" stopColor="#E8924F" />
        </linearGradient>
        <linearGradient id="pawsy-mirror" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A8E6E6" />
          <stop offset="100%" stopColor="#7EC8C8" />
        </linearGradient>
        <filter id="pawsy-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="24" cy="24" r="24" fill="url(#pawsy-bg)" />

      <path d="M 8,22 Q 6,10 14,8 Q 20,7 19,20 Z" fill="#FFE8D6" />
      <path d="M 10,19 Q 9,12 14,10 Q 18,9 17,18 Z" fill="#FFF5ED" />

      <path d="M 40,22 Q 42,10 34,8 Q 28,7 29,20 Z" fill="#FFE8D6" />
      <path d="M 38,19 Q 39,12 34,10 Q 30,9 31,18 Z" fill="#FFF5ED" />

      <ellipse cx="24" cy="27" rx="16" ry="14" fill="#FFE8D6" />
      <ellipse cx="11" cy="29" rx="4" ry="3" fill="#FFF5ED" />
      <ellipse cx="37" cy="29" rx="4" ry="3" fill="#FFF5ED" />
      <ellipse cx="24" cy="31" rx="7" ry="5" fill="#FFF5ED" />

      <ellipse cx="18" cy="26" rx="3" ry="3.5" fill="#3D3D3D" />
      <ellipse cx="30" cy="26" rx="3" ry="3.5" fill="#3D3D3D" />
      <circle cx="19" cy="24.5" r="1.2" fill="white" />
      <circle cx="31" cy="24.5" r="1.2" fill="white" />

      <ellipse cx="24" cy="30" rx="2.5" ry="2" fill="#3D3D3D" />
      <ellipse cx="23.5" cy="29.5" rx="1" ry="0.7" fill="#5a5a5a" />

      <path
        d="M 21,33 Q 24,35.5 27,33"
        stroke="#3D3D3D"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M 11,18 Q 24,14 37,18"
        stroke="#4A4A4A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <g filter="url(#pawsy-glow)">
        <circle cx="24" cy="15" r="5" fill="#E8E8E8" stroke="#AFAFAF" strokeWidth="0.5" />
        <circle cx="24" cy="15" r="3.5" fill="url(#pawsy-mirror)" />
        <ellipse cx="22.5" cy="13.5" rx="1.5" ry="1" fill="white" opacity="0.7" />
      </g>
    </svg>
  )
}
