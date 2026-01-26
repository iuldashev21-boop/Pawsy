import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, MessageCircle, Camera, Settings } from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/photo', icon: Camera, label: 'Photo' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E8E8E8]/50 pb-safe md:hidden">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              aria-label={label}
              className="relative flex flex-col items-center py-2 px-4 min-w-[64px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261] focus-visible:ring-offset-2 rounded-xl"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -top-2 w-12 h-1 bg-gradient-to-r from-[#F4A261] to-[#E8924F] rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-xl transition-colors ${
                      isActive ? 'bg-[#F4A261]/10' : ''
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 transition-colors ${
                        isActive ? 'text-[#F4A261]' : 'text-[#9E9E9E]'
                      }`}
                    />
                  </motion.div>
                  <span
                    className={`text-xs font-medium mt-1 transition-colors ${
                      isActive ? 'text-[#F4A261]' : 'text-[#9E9E9E]'
                    }`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default BottomNav
