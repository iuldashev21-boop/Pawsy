import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, X } from 'lucide-react'
import PremiumIcon from '../components/common/PremiumIcon'

const ToastContext = createContext()

const TOAST_SHADOW = '0 4px 20px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)'

const TOAST_STYLES = {
  premium: {
    background: 'linear-gradient(135deg, #FFF8E7 0%, #FFE4B5 100%)',
    borderColor: 'rgba(232,184,85,0.3)',
    boxShadow: TOAST_SHADOW,
  },
  info: {
    background: 'linear-gradient(135deg, #FFFFFF 0%, #FDF8F3 100%)',
    borderColor: 'rgba(232,221,208,0.5)',
    boxShadow: TOAST_SHADOW,
  },
}

function Toast({ toast, onClose }) {
  const isPremium = toast?.type === 'premium'

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm"
        >
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border"
            style={isPremium ? TOAST_STYLES.premium : TOAST_STYLES.info}
          >
            {isPremium ? (
              <PremiumIcon size={18} />
            ) : (
              <Info className="w-4.5 h-4.5 text-[#7EC8C8] flex-shrink-0" style={{ width: 18, height: 18 }} />
            )}
            <p
              className="flex-1 text-sm text-[#3D3D3D] font-medium leading-snug"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {toast.message}
            </p>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-black/5 transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5 text-[#9E9E9E]" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timeoutRef = useRef(null)

  const showToast = useCallback((message, type = 'info') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setToast({ message, type })
    timeoutRef.current = setTimeout(() => setToast(null), 3500)
  }, [])

  const hideToast = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setToast(null)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast toast={toast} onClose={hideToast} />
    </ToastContext.Provider>
  )
}

function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
export { ToastProvider, useToast }
