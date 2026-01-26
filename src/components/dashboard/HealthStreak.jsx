import { motion, useReducedMotion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { useMemo } from 'react'

const STORAGE_KEY = 'pawsy_streak'
const MS_PER_DAY = 1000 * 60 * 60 * 24

function getStreakData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parsing errors
  }

  // Default: start with day 1
  const today = new Date().toDateString()
  const defaultStreak = {
    currentStreak: 1,
    lastVisit: today,
    weekDays: [true, false, false, false, false, false, false], // Today active
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStreak))
  } catch {
    // Ignore storage errors
  }

  return defaultStreak
}

// Update streak on component mount
function updateStreak() {
  const today = new Date().toDateString()
  const data = getStreakData()

  if (data.lastVisit === today) {
    // Already visited today, return current data
    return data
  }

  const lastDate = new Date(data.lastVisit)
  const todayDate = new Date(today)
  const diffDays = Math.floor((todayDate - lastDate) / MS_PER_DAY)

  let newStreak = data.currentStreak
  let newWeekDays = [...data.weekDays]

  if (diffDays === 1) {
    // Consecutive day - increment streak
    newStreak = data.currentStreak + 1
    // Shift week days left and add today
    newWeekDays = [...newWeekDays.slice(1), true]
  } else if (diffDays > 1) {
    // Streak broken - reset
    newStreak = 1
    // Fill gap days with false, add today as true
    const gapDays = Math.min(diffDays - 1, 6)
    newWeekDays = [...newWeekDays.slice(gapDays + 1), ...Array(gapDays).fill(false), true]
  }

  const updatedData = {
    currentStreak: newStreak,
    lastVisit: today,
    weekDays: newWeekDays,
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
  } catch {
    // Ignore storage errors
  }

  return updatedData
}

function HealthStreak() {
  const prefersReducedMotion = useReducedMotion()

  const { currentStreak, weekDays } = useMemo(() => updateStreak(), [])

  // Show flame animation for streaks >= 3
  const showFlame = currentStreak >= 3

  return (
    <div className="flex items-center gap-1.5">
      {/* 7-day visualization - small dots */}
      <div className="flex gap-0.5" role="img" aria-label={`${currentStreak} day streak. ${weekDays.filter(Boolean).length} of 7 days active this week.`}>
        {weekDays.map((active, idx) => (
          <motion.div
            key={idx}
            initial={prefersReducedMotion ? false : { scale: 0 }}
            animate={prefersReducedMotion ? false : { scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-full ${
              active
                ? 'w-2 h-2 bg-[#7EC8C8]'
                : 'w-1.5 h-1.5 bg-[#E8E8E8]'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Streak counter */}
      <div className="flex items-center gap-0.5">
        {showFlame ? (
          <motion.div
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.1, 1],
            }}
            transition={{
              repeat: Infinity,
              repeatDelay: 2,
              duration: 0.3,
            }}
          >
            <Flame className="w-3 h-3 text-[#F4A261]" aria-hidden="true" />
          </motion.div>
        ) : (
          <Flame className="w-3 h-3 text-[#C0C0C0]" aria-hidden="true" />
        )}
        <span className={`text-[10px] font-bold ${showFlame ? 'text-[#F4A261]' : 'text-[#9E9E9E]'}`}>
          {currentStreak}
        </span>
      </div>
    </div>
  )
}

export default HealthStreak
