import { premiumCTAClasses } from '../../constants/premiumStyles'
import { useDog } from '../../context/DogContext'

function CompactPremiumBanner() {
  const { activeDog } = useDog()

  const handleUpgrade = () => {
    window.dispatchEvent(new CustomEvent('pawsy:openUpgrade'))
  }

  const dogName = activeDog?.name || 'your dog'

  return (
    <div
      className="rounded-2xl overflow-hidden transition-shadow duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,252,247,0.85) 100%)',
        border: '1px solid rgba(232,221,208,0.5)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)',
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Left accent strip */}
        <div
          className="w-1 self-stretch rounded-full flex-shrink-0"
          style={{ background: 'linear-gradient(180deg, #F4A261 0%, #E8924F 100%)' }}
          aria-hidden="true"
        />

        <p
          className="flex-1 text-[13px] text-[#2D2A26] font-medium leading-snug"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          Unlock {dogName}'s full health journey
        </p>

        <button
          onClick={handleUpgrade}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-[13px] transition-all active:scale-[0.97] ${premiumCTAClasses}`}
        >
          Upgrade to Premium
        </button>
      </div>
    </div>
  )
}

export default CompactPremiumBanner
