import { NavLink } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { usePremium } from '../../hooks/usePremium'
import { SIDEBAR_SECTIONS } from '../../constants/sidebarNav'

function SidebarNavItem({ item, isHealthSection }) {
  const { isPremium } = usePremium()
  const Icon = item.icon
  const isLocked = item.premium && !isPremium
  const healthPremium = isHealthSection && isPremium

  if (isLocked) {
    return (
      <button
        onClick={() => {
          if (item.featureId) {
            window.dispatchEvent(new CustomEvent('pawsy:openFeatureModal', { detail: { featureId: item.featureId } }))
          } else {
            window.dispatchEvent(new CustomEvent('pawsy:openUpgrade'))
          }
        }}
        className="w-full flex items-center gap-3 px-3 py-[6px] rounded-xl text-left text-[#B5A898] opacity-60 hover:opacity-80 hover:bg-[#F4A261]/5 transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2"
        aria-label={`${item.label} — Premium feature, click to upgrade`}
      >
        <Icon className="w-[17px] h-[17px] flex-shrink-0" aria-hidden="true" />
        <span className="text-[12.5px] font-medium flex-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {item.label}
        </span>
        <Lock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      </button>
    )
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-[6px] rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 ${
          isActive
            ? 'bg-[#F4A261]/10 text-[#E8924F] font-bold border-l-[3px] border-[#E8924F]'
            : healthPremium
              ? 'text-[#6B5E52] border-l-[3px] border-[#E8924F]/40 hover:bg-[#FFF5ED] hover:text-[#3D3D3D]'
              : 'text-[#6B5E52] hover:bg-[#F4A261]/5 hover:text-[#3D3D3D]'
        }`
      }
      aria-label={item.label}
    >
      <Icon className={`w-[17px] h-[17px] flex-shrink-0 ${healthPremium ? 'text-[#D4854A]' : ''}`} aria-hidden="true" />
      <span className="text-[12.5px] font-medium" style={{ fontFamily: 'Nunito, sans-serif' }}>
        {item.label}
      </span>
    </NavLink>
  )
}

function AppSidebar() {
  const { isPremium } = usePremium()

  return (
    <aside
      className="hidden md:flex md:flex-col w-[220px] flex-shrink-0 overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,252,247,0.15) 100%)',
        boxShadow: '1px 0 0 0 rgba(232,221,208,0.25)',
      }}
    >
      <nav className="flex-1 py-3 px-2" aria-label="Sidebar navigation">
        {SIDEBAR_SECTIONS.map((section) => {
          const visibleItems = isPremium
            ? section.items.filter((item) => !item.hiddenForPremium)
            : section.items
          return (
            <div key={section.title} className="mb-2">
              <p
                className="text-[10px] uppercase tracking-widest text-[#B5A898] px-3 mb-1 mt-4 first:mt-0"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
                aria-hidden="true"
              >
                {section.title}
              </p>
              <div className="space-y-[3px]">
                {visibleItems.map((item) => (
                  <SidebarNavItem key={item.id} item={item} isHealthSection={section.title === 'Health'} />
                ))}
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

export default AppSidebar
