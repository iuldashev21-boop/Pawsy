import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun,
  Sunset,
  Moon,
  Settings,
} from 'lucide-react'
import PawsyIcon from '../common/PawsyIcon'
import { useAuth } from '../../context/AuthContext'
import { useDog } from '../../context/DogContext'
import { usePremium } from '../../hooks/usePremium'
import UsageCounter from '../usage/UsageCounter'
import PetCardActions from '../dashboard/PetCardActions'
import HealthStreak from '../dashboard/HealthStreak'
import { useToast } from '../../context/ToastContext'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good morning', Icon: Sun, color: '#E8924F' }
  if (hour < 18) return { text: 'Good afternoon', Icon: Sunset, color: '#D4854A' }
  return { text: 'Good evening', Icon: Moon, color: '#5A9E9E' }
}


function DogDetailText({ dog, className }) {
  return (
    <p className={className} style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {dog.breed || 'Mixed breed'}
      {dog.age && ` \u2022 ${dog.age}`}
      {dog.weight && ` \u2022 ${dog.weight} ${dog.weightUnit || 'lbs'}`}
    </p>
  )
}

function AppHeader() {
  const { user } = useAuth()
  const { activeDog } = useDog()
  const { isPremium } = usePremium()
  const { showToast } = useToast()

  const greeting = getGreeting()

  const handleFeatureClick = useCallback((featureId) => {
    if (isPremium) {
      showToast('Coming soon! This feature is under development.')
    } else {
      window.dispatchEvent(new CustomEvent('pawsy:openFeatureModal', { detail: { featureId } }))
    }
  }, [isPremium, showToast])

  const handleUpgrade = useCallback(() => {
    window.dispatchEvent(new CustomEvent('pawsy:openUpgrade'))
  }, [])

  return (
    <header className="sticky top-0 z-50 md:static md:z-auto flex-shrink-0 bg-[#FAF6F1]/85 backdrop-blur-xl border-b border-[#E8DDD0]/40">
      <div className="max-w-lg md:max-w-none mx-auto px-4 md:px-10 py-3 md:py-4 flex items-center justify-between">
        {/* Mobile: Greeting + user name */}
        <div className="flex items-center gap-3 md:hidden">
          <div>
            <p className="text-[13px] text-[#8C7B6B] flex items-center gap-1.5 tracking-wide" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              <greeting.Icon className="w-3.5 h-3.5" style={{ color: greeting.color }} aria-hidden="true" />
              {greeting.text}
            </p>
            <h1
              className="text-lg font-extrabold text-[#2D2A26] leading-tight"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {user?.name || 'Pet Parent'}
            </h1>
          </div>
        </div>

        {/* Desktop: Logo + Dog profile inline */}
        <div className="hidden md:flex items-center gap-5">
          <div className="min-w-0">
            <p className="text-[13px] text-[#8C7B6B] flex items-center gap-1.5 tracking-wide" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              <greeting.Icon className="w-3.5 h-3.5" style={{ color: greeting.color }} aria-hidden="true" />
              {greeting.text}
            </p>
            <div className="flex items-center gap-3">
              <h1
                className="text-[20px] font-extrabold text-[#2D2A26] leading-tight"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {activeDog ? (
                  <>
                    {user?.name || 'You'} & {activeDog.name}
                  </>
                ) : (
                  user?.name || 'Pet Parent'
                )}
              </h1>
              {activeDog && !isPremium && (
                <>
                  <PetCardActions
                    isPremium={isPremium}
                    onFeatureClick={handleFeatureClick}
                  />
                  <HealthStreak />
                </>
              )}
            </div>
            {activeDog && (
              <DogDetailText dog={activeDog} className="text-[12px] text-[#8C7B6B] mt-1" />
            )}
          </div>
        </div>

        {/* Right side: Usage counter + Settings (mobile) */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-6">
          {/* Premium badge — premium users */}
          {isPremium && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #FFF5ED 0%, #FFE8D6 100%)' }}>
              <PawsyIcon size={18} />
              <span className="text-xs font-bold text-[#2D2A26]" style={{ fontFamily: 'Nunito, sans-serif' }}>Premium</span>
              <span className="text-[10px] text-[#6B6B6B] font-medium">&middot; Unlimited</span>
            </div>
          )}
          {/* Usage counter — free users only */}
          {!isPremium && (
            <div className="hidden md:flex items-center gap-3">
              <UsageCounter type="chat" showUpgrade onUpgrade={handleUpgrade} />
              <UsageCounter type="photo" showUpgrade onUpgrade={handleUpgrade} />
            </div>
          )}

          {/* Mobile: Settings icon */}
          <Link
            to="/settings"
            className="md:hidden w-10 h-10 rounded-2xl bg-white/80 shadow-sm border border-[#E8DDD0]/60 flex items-center justify-center hover:bg-white active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-[#8C7B6B]" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
