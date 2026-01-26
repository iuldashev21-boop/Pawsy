import { motion, useReducedMotion } from 'framer-motion'
import { Lightbulb, Sparkles } from 'lucide-react'
import { useMemo } from 'react'

const MS_PER_DAY = 1000 * 60 * 60 * 24

const HEALTH_TIPS = {
  general: [
    { tip: "Regular dental care prevents 80% of dogs from developing dental disease by age 3.", isPremium: false },
    { tip: "Dogs need 30-60 minutes of exercise daily depending on breed and age.", isPremium: false },
    { tip: "Fresh water should be available at all times. Change it at least twice daily.", isPremium: false },
    { tip: "Annual vet checkups can catch health issues early when they're easier to treat.", isPremium: false },
    { tip: "Monitor your dog's weight monthly - even small changes can indicate health issues.", isPremium: true },
    { tip: "Mental stimulation through puzzle toys can reduce anxiety and destructive behavior.", isPremium: false },
    { tip: "Grooming isn't just cosmetic - it helps you spot skin issues, lumps, or parasites early.", isPremium: false },
    { tip: "A consistent feeding schedule helps regulate digestion and makes potty training easier.", isPremium: false },
    { tip: "Socialization continues throughout a dog's life - regular positive interactions are key.", isPremium: true },
    { tip: "Watch for changes in eating, drinking, or bathroom habits - they're early warning signs.", isPremium: false },
  ],
  puppy: [
    { tip: "Puppies need 3-4 smaller meals per day until 6 months, then transition to twice daily.", isPremium: false },
    { tip: "Socialization is critical before 16 weeks - expose your puppy to various sounds and experiences.", isPremium: true },
    { tip: "Puppy-proof your home by removing toxic plants and securing electrical cords.", isPremium: false },
  ],
  senior: [
    { tip: "Senior dogs benefit from orthopedic beds to support aging joints.", isPremium: false },
    { tip: "Consider twice-yearly vet visits for dogs over 7 to catch age-related issues early.", isPremium: true },
    { tip: "Gentle, shorter walks are better for seniors than long strenuous exercise.", isPremium: false },
  ],
  largeBreed: [
    { tip: "Large breeds are prone to bloat - avoid exercise right after meals.", isPremium: false },
    { tip: "Joint supplements with glucosamine can help large breeds maintain mobility.", isPremium: true },
  ],
  smallBreed: [
    { tip: "Small breeds have faster metabolisms and may need more frequent, smaller meals.", isPremium: false },
    { tip: "Dental care is extra important for small breeds who are prone to dental issues.", isPremium: true },
  ],
}

const LARGE_BREEDS = ['german shepherd', 'labrador', 'golden retriever', 'rottweiler', 'husky', 'great dane', 'mastiff', 'bernese']
const SMALL_BREEDS = ['chihuahua', 'pomeranian', 'yorkshire', 'maltese', 'shih tzu', 'poodle', 'dachshund']

function getTipCategory(breed, age) {
  const lowerBreed = breed?.toLowerCase() || ''
  const ageStr = age?.toLowerCase() || ''

  if (ageStr.includes('puppy') || ageStr.includes('month') || ageStr === '< 1 year') {
    return 'puppy'
  }
  if (ageStr.includes('senior') || parseInt(ageStr) >= 7) {
    return 'senior'
  }

  if (LARGE_BREEDS.some(b => lowerBreed.includes(b))) {
    return 'largeBreed'
  }
  if (SMALL_BREEDS.some(b => lowerBreed.includes(b))) {
    return 'smallBreed'
  }

  return 'general'
}

function getDailyTipIndex(tipsLength) {
  const today = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / MS_PER_DAY)
  return dayOfYear % tipsLength
}

function DailyHealthTip({ breed, age }) {
  const prefersReducedMotion = useReducedMotion()

  const { tip, isPremium } = useMemo(() => {
    const category = getTipCategory(breed, age)
    const allTips = [...HEALTH_TIPS[category], ...HEALTH_TIPS.general]
    return allTips[getDailyTipIndex(allTips.length)]
  }, [breed, age])

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
      }

  return (
    <motion.div
      {...animationProps}
      className="bg-gradient-to-br from-[#FFF9E6] to-[#FFF3CD] rounded-xl p-3 border border-[#F4D35E]/30 shadow-sm"
    >
      <div className="flex gap-2.5">
        <div className="w-8 h-8 bg-[#F4D35E]/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-[#D4A012]" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h4 className="font-semibold text-xs text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Daily Health Tip
            </h4>
            {isPremium && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#D4A012] bg-[#F4D35E]/20 px-1.5 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
                Premium Insight
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            {tip}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default DailyHealthTip
