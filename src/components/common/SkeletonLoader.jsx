import { motion } from 'framer-motion'

/**
 * SkeletonLoader - Animated loading placeholder components
 *
 * Usage:
 * <Skeleton.Text /> - Single line of text
 * <Skeleton.Text lines={3} /> - Multiple lines
 * <Skeleton.Circle size={48} /> - Circular avatar
 * <Skeleton.Card /> - Card placeholder
 * <Skeleton.Button /> - Button placeholder
 * <Skeleton.Image /> - Image placeholder
 */

const shimmer = {
  initial: { x: '-100%' },
  animate: { x: '100%' },
  transition: {
    repeat: Infinity,
    duration: 1.5,
    ease: 'linear',
  },
}

function SkeletonBase({ className, children }) {
  return (
    <div className={`relative overflow-hidden bg-[#E8E8E8]/60 ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        initial={shimmer.initial}
        animate={shimmer.animate}
        transition={shimmer.transition}
      />
      {children}
    </div>
  )
}

function Text({ lines = 1, className = '' }) {
  if (lines === 1) {
    return <SkeletonBase className={`h-4 rounded-md w-full ${className}`} />
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={`h-4 rounded-md ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

function Circle({ size = 40, className = '' }) {
  return (
    <SkeletonBase
      className={`rounded-full flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

function Rectangle({ width = '100%', height = 100, className = '' }) {
  return (
    <SkeletonBase
      className={`rounded-xl ${className}`}
      style={{ width, height }}
    />
  )
}

function Card({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl p-4 border border-[#E8E8E8]/50 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Circle size={48} />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-4 rounded-md w-1/2" />
          <SkeletonBase className="h-3 rounded-md w-1/3" />
        </div>
      </div>
      <Text lines={2} />
    </div>
  )
}

function Button({ width = '100%', className = '' }) {
  return (
    <SkeletonBase
      className={`h-12 rounded-xl ${className}`}
      style={{ width }}
    />
  )
}

function Image({ aspectRatio = '16/9', className = '' }) {
  return (
    <SkeletonBase
      className={`rounded-xl w-full ${className}`}
      style={{ aspectRatio }}
    />
  )
}

function ListItem({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 p-3 ${className}`}>
      <Circle size={40} />
      <div className="flex-1 space-y-2">
        <SkeletonBase className="h-4 rounded-md w-2/3" />
        <SkeletonBase className="h-3 rounded-md w-1/2" />
      </div>
    </div>
  )
}

function DogProfile({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl p-4 border border-[#E8E8E8]/50 ${className}`}>
      <div className="flex items-center gap-4">
        <SkeletonBase className="w-16 h-16 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-5 rounded-md w-1/3" />
          <SkeletonBase className="h-4 rounded-md w-1/2" />
        </div>
      </div>
    </div>
  )
}

function ChatMessage({ isUser = false, className = '' }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <SkeletonBase
          className={`h-20 rounded-2xl ${isUser ? 'rounded-br-md w-64' : 'rounded-bl-md w-72'}`}
        />
      </div>
    </div>
  )
}

function UsageStats({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl p-4 border border-[#E8E8E8]/50 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <SkeletonBase className="h-4 rounded-md w-24" />
        <SkeletonBase className="h-3 rounded-md w-20" />
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <SkeletonBase className="h-3 rounded-md w-16" />
            <SkeletonBase className="h-3 rounded-md w-8" />
          </div>
          <SkeletonBase className="h-2 rounded-full w-full" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <SkeletonBase className="h-3 rounded-md w-20" />
            <SkeletonBase className="h-3 rounded-md w-8" />
          </div>
          <SkeletonBase className="h-2 rounded-full w-full" />
        </div>
      </div>
    </div>
  )
}

// Export as namespace
const Skeleton = {
  Base: SkeletonBase,
  Text,
  Circle,
  Rectangle,
  Card,
  Button,
  Image,
  ListItem,
  DogProfile,
  ChatMessage,
  UsageStats,
}

export default Skeleton
