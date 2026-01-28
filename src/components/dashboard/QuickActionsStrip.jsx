import { Link } from 'react-router-dom'
import { Camera, MapPin, BookOpen, Leaf } from 'lucide-react'
import { warmCardStyle } from '../../constants/cardStyles'

const actions = [
  {
    id: 'scan-photo',
    label: 'Scan Photo',
    icon: Camera,
    to: '/photo',
    color: '#4A9E9E',
    bg: 'linear-gradient(135deg, rgba(126,200,200,0.2) 0%, rgba(90,175,175,0.15) 100%)',
  },
  {
    id: 'emergency',
    label: 'Emergency',
    icon: MapPin,
    to: '/emergency-vet',
    color: '#EF5350',
    bg: 'linear-gradient(135deg, rgba(239,83,80,0.15) 0%, rgba(211,47,47,0.1) 100%)',
  },
  {
    id: 'first-aid',
    label: 'First Aid',
    icon: BookOpen,
    to: '/emergency-guides',
    color: '#D4854A',
    bg: 'linear-gradient(135deg, #FFE8D6 0%, #FFD6B8 100%)',
  },
  {
    id: 'toxic-check',
    label: 'Toxic Check',
    icon: Leaf,
    to: '/toxic-checker',
    color: '#E8924F',
    bg: 'linear-gradient(135deg, #FFE8D6 0%, #FFD6B8 100%)',
  },
]

function QuickActionsStrip() {
  return (
    <div
      className="rounded-2xl p-3 transition-shadow duration-300"
      style={warmCardStyle}
    >
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.id}
              to={action.to}
              className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl hover:bg-[#F4A261]/[0.04] active:scale-[0.96] transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
              aria-label={action.label}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: action.bg }}
              >
                <Icon className="w-5 h-5" style={{ color: action.color }} aria-hidden="true" />
              </div>
              <span
                className="text-[11px] font-bold text-[#2D2A26] text-center leading-tight"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {action.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default QuickActionsStrip
