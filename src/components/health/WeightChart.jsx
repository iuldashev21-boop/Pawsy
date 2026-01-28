import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Scale, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const CHART_HEIGHT = 200
const CHART_PADDING = { top: 24, right: 16, bottom: 36, left: 44 }

function parseWeight(fact) {
  if (!fact) return null
  const text = fact.fact || fact.description || ''
  const match = text.match(/([\d.]+)/)
  if (match) return parseFloat(match[1])
  if (typeof fact.value === 'number') return fact.value
  return null
}

function parseDate(fact) {
  return new Date(fact.occurredAt || fact.createdAt)
}

function formatShortDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function determineTrend(points) {
  if (points.length < 2) return 'stable'
  const first = points[0].weight
  const last = points[points.length - 1].weight
  const change = ((last - first) / first) * 100
  if (change > 3) return 'gaining'
  if (change < -5) return 'losing'
  return 'stable'
}

const TREND_CONFIG = {
  stable: { color: '#66BB6A', label: 'Stable', icon: Minus },
  gaining: { color: '#FFCA28', label: 'Gaining', icon: TrendingUp },
  losing: { color: '#EF5350', label: 'Losing', icon: TrendingDown },
}

/**
 * WeightChart - SVG line chart of weight over time.
 *
 * Props:
 * - weightFacts: Array of PetFact objects with category 'weight'
 * - weightUnit: string (default 'lbs')
 */
function WeightChart({ weightFacts = [], weightUnit = 'lbs' }) {
  const prefersReducedMotion = useReducedMotion()

  const dataPoints = useMemo(() => {
    if (!Array.isArray(weightFacts) || weightFacts.length === 0) return []

    return weightFacts
      .map((fact) => ({
        weight: parseWeight(fact),
        date: parseDate(fact),
        id: fact.id,
      }))
      .filter((p) => p.weight !== null && !isNaN(p.weight))
      .sort((a, b) => a.date - b.date)
  }, [weightFacts])

  const trend = useMemo(() => determineTrend(dataPoints), [dataPoints])
  const trendConfig = TREND_CONFIG[trend]
  const TrendIcon = trendConfig.icon

  const fadeIn = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

  // Empty state
  if (dataPoints.length === 0) {
    return (
      <motion.div
        {...fadeIn}
        className="bg-white rounded-2xl border border-[#E8E8E8] p-4"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-4 h-4 text-[#F4A261]" aria-hidden="true" />
          <h3
            className="text-sm font-semibold text-[#3D3D3D]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Weight Trend
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-[#F4A261]/10 flex items-center justify-center mb-2">
            <Scale className="w-5 h-5 text-[#F4A261]" aria-hidden="true" />
          </div>
          <p className="text-sm text-[#6B6B6B]">No weight data yet</p>
          <p className="text-xs text-[#9E9E9E] mt-0.5">
            Log weight events to see trends here
          </p>
        </div>
      </motion.div>
    )
  }

  // Chart calculations
  const weights = dataPoints.map((p) => p.weight)
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)
  const weightRange = maxWeight - minWeight || 1
  const paddedMin = minWeight - weightRange * 0.1
  const paddedMax = maxWeight + weightRange * 0.1
  const paddedRange = paddedMax - paddedMin

  const drawWidth = 320
  const innerWidth = drawWidth - CHART_PADDING.left - CHART_PADDING.right
  const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom

  function xPos(index) {
    if (dataPoints.length === 1) return CHART_PADDING.left + innerWidth / 2
    return CHART_PADDING.left + (index / (dataPoints.length - 1)) * innerWidth
  }

  function yPos(weight) {
    return CHART_PADDING.top + innerHeight - ((weight - paddedMin) / paddedRange) * innerHeight
  }

  // Build SVG path
  const pathPoints = dataPoints.map((p, i) => `${xPos(i)},${yPos(p.weight)}`)
  const linePath = `M ${pathPoints.join(' L ')}`

  // Gradient area path
  const areaPath = `${linePath} L ${xPos(dataPoints.length - 1)},${CHART_PADDING.top + innerHeight} L ${xPos(0)},${CHART_PADDING.top + innerHeight} Z`

  // Y-axis ticks (3-5 values)
  const yTickCount = Math.min(5, Math.max(3, dataPoints.length))
  const yTicks = Array.from({ length: yTickCount }, (_, i) => {
    const val = paddedMin + (paddedRange / (yTickCount - 1)) * i
    return Math.round(val * 10) / 10
  })

  // Determine which X labels to show (max 5 to avoid overlap)
  const maxXLabels = 5
  const xLabelStep = Math.max(1, Math.ceil(dataPoints.length / maxXLabels))

  return (
    <motion.div
      {...fadeIn}
      className="bg-white rounded-2xl border border-[#E8E8E8] p-4"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#F4A261]" aria-hidden="true" />
          <h3
            className="text-sm font-semibold text-[#3D3D3D]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Weight Trend
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendIcon className="w-3.5 h-3.5" style={{ color: trendConfig.color }} aria-hidden="true" />
          <span className="text-xs font-medium" style={{ color: trendConfig.color }}>
            {trendConfig.label}
          </span>
        </div>
      </div>

      {/* Current weight */}
      <div className="mb-3">
        <span className="text-2xl font-bold text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {dataPoints[dataPoints.length - 1].weight}
        </span>
        <span className="text-sm text-[#6B6B6B] ml-1">{weightUnit}</span>
        {dataPoints.length >= 2 && (
          <span className="text-xs ml-2" style={{ color: trendConfig.color }}>
            {(() => {
              const diff = dataPoints[dataPoints.length - 1].weight - dataPoints[dataPoints.length - 2].weight
              const sign = diff > 0 ? '+' : ''
              return `${sign}${Math.round(diff * 10) / 10} ${weightUnit}`
            })()}
          </span>
        )}
      </div>

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${drawWidth} ${CHART_HEIGHT}`}
        className="w-full"
        style={{ height: `${CHART_HEIGHT}px` }}
        role="img"
        aria-label={`Weight chart showing ${dataPoints.length} data points. Current weight: ${dataPoints[dataPoints.length - 1].weight} ${weightUnit}. Trend: ${trendConfig.label}.`}
      >
        <defs>
          <linearGradient id="weightAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={trendConfig.color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={trendConfig.color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={CHART_PADDING.left}
              y1={yPos(tick)}
              x2={drawWidth - CHART_PADDING.right}
              y2={yPos(tick)}
              stroke="#E8E8E8"
              strokeWidth="0.5"
              strokeDasharray="4 3"
            />
            <text
              x={CHART_PADDING.left - 6}
              y={yPos(tick) + 3}
              textAnchor="end"
              className="text-[10px]"
              fill="#9E9E9E"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#weightAreaGradient)" />

        {/* Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke={trendConfig.color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...(prefersReducedMotion
            ? {}
            : {
                initial: { pathLength: 0 },
                animate: { pathLength: 1 },
                transition: { duration: 1, ease: 'easeOut' },
              })}
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <g key={p.id || i}>
            <circle
              cx={xPos(i)}
              cy={yPos(p.weight)}
              r="4"
              fill="white"
              stroke={trendConfig.color}
              strokeWidth="2"
            />
            {/* X-axis labels */}
            {i % xLabelStep === 0 && (
              <text
                x={xPos(i)}
                y={CHART_HEIGHT - 8}
                textAnchor="middle"
                className="text-[10px]"
                fill="#9E9E9E"
              >
                {formatShortDate(p.date)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </motion.div>
  )
}

export default WeightChart
