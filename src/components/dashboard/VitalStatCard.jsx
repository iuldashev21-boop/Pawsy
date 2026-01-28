import { warmCardStyle } from '../../constants/cardStyles'

const STATUS_COLORS = {
  green: {
    bg: 'bg-[#66BB6A]/15',
    text: 'text-[#66BB6A]',
    dot: '#66BB6A',
  },
  yellow: {
    bg: 'bg-[#FFCA28]/15',
    text: 'text-[#D4854A]',
    dot: '#D4854A',
  },
  red: {
    bg: 'bg-[#EF5350]/15',
    text: 'text-[#EF5350]',
    dot: '#EF5350',
  },
}

/**
 * VitalStatCard — displays a single health metric with icon, value, and status badge.
 *
 * @param {object} props
 * @param {import('lucide-react').LucideIcon} props.icon
 * @param {string} props.iconColor
 * @param {string} props.iconBg - CSS gradient string for icon container
 * @param {string} props.label - uppercase label (e.g. 'WEIGHT')
 * @param {string|number} props.value - display value (e.g. '78 lbs')
 * @param {string} [props.unit] - optional suffix (e.g. 'lbs', 'days')
 * @param {{ label: string, color: 'green'|'yellow'|'red' }} props.status
 */
function VitalStatCard({ icon: Icon, iconColor, iconBg, label, value, unit, status }) {
  const colors = STATUS_COLORS[status.color] || STATUS_COLORS.green

  return (
    <div
      className="rounded-2xl p-3 transition-shadow duration-300"
      style={warmCardStyle}
    >
      {/* Icon + Label */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}
        >
          <Icon
            className="w-3.5 h-3.5"
            style={{ color: iconColor }}
            aria-hidden="true"
          />
        </div>
        <span
          className="text-[11px] font-semibold tracking-wider uppercase text-[#8C7B6B]"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          {label}
        </span>
      </div>

      {/* Big number */}
      <div
        className="text-[22px] font-extrabold text-[#2D2A26] leading-tight mb-1.5"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        {value}
        {unit && (
          <span className="text-[13px] font-bold text-[#8C7B6B] ml-1">
            {unit}
          </span>
        )}
      </div>

      {/* Status badge */}
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${colors.bg}`}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: colors.dot }}
          aria-hidden="true"
        />
        <span
          className={`text-[11px] font-semibold ${colors.text}`}
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          {status.label}
        </span>
      </div>
    </div>
  )
}

export default VitalStatCard
