import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw, WifiOff, ServerCrash, XCircle } from 'lucide-react'

/**
 * ErrorMessage - Standardized error display component
 *
 * Props:
 * - type: 'generic' | 'network' | 'server' | 'validation' | 'notFound'
 * - title: Custom error title (optional)
 * - message: Custom error message (optional)
 * - onRetry: Retry handler (optional - shows retry button if provided)
 * - onDismiss: Dismiss handler (optional - shows X button if provided)
 * - variant: 'inline' | 'card' | 'fullpage' (default: 'inline')
 */

const ERROR_TYPES = {
  generic: {
    icon: AlertCircle,
    iconColor: '#EF5350',
    title: 'Oops! Something went wrong',
    message: "Don't worry, even the best pups trip sometimes. Try refreshing the page or come back in a moment.",
    solution: 'Refresh the page',
  },
  network: {
    icon: WifiOff,
    iconColor: '#FF9800',
    title: 'Lost connection',
    message: "We can't reach the internet right now. Check your Wi-Fi or mobile data, then try again.",
    solution: 'Check your connection',
  },
  server: {
    icon: ServerCrash,
    iconColor: '#EF5350',
    title: 'Taking a quick nap',
    message: "Our servers are temporarily unavailable. This usually resolves within a few minutes.",
    solution: 'Wait a moment and retry',
  },
  validation: {
    icon: XCircle,
    iconColor: '#F4A261',
    title: "That doesn't look right",
    message: 'Please check your input for any typos or missing information.',
    solution: 'Review your input',
  },
  notFound: {
    icon: AlertCircle,
    iconColor: '#9E9E9E',
    title: "Can't find that",
    message: "The page or item you're looking for doesn't exist. It may have been moved or deleted.",
    solution: 'Go back or try a different search',
  },
}

function ErrorMessage({
  type = 'generic',
  title,
  message,
  onRetry,
  onDismiss,
  variant = 'inline',
  className = '',
}) {
  const config = ERROR_TYPES[type] || ERROR_TYPES.generic
  const Icon = config.icon

  const displayTitle = title || config.title
  const displayMessage = message || config.message

  // Inline variant - compact error display
  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl ${className}`}
      >
        <Icon className="w-5 h-5 text-[#EF5350] flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#EF5350]">{displayTitle}</p>
          <p className="text-xs text-red-600/80 mt-0.5">{displayMessage}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs font-medium text-[#EF5350] hover:text-red-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Try again
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-full hover:bg-red-100 text-red-400"
            aria-label="Dismiss"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    )
  }

  // Card variant - larger error card
  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white rounded-2xl p-6 border border-red-100 shadow-sm text-center ${className}`}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${config.iconColor}15` }}
        >
          <Icon className="w-7 h-7" style={{ color: config.iconColor }} />
        </div>
        <h3 className="text-lg font-bold text-[#3D3D3D] mb-2">{displayTitle}</h3>
        <p className="text-sm text-[#6B6B6B] mb-4">{displayMessage}</p>
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EF5350] text-white font-semibold rounded-xl"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </motion.button>
        )}
      </motion.div>
    )
  }

  // Fullpage variant - centered full-page error
  if (variant === 'fullpage') {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center p-4 ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${config.iconColor}15` }}
          >
            <Icon className="w-10 h-10" style={{ color: config.iconColor }} />
          </div>
          <h2 className="text-xl font-bold text-[#3D3D3D] mb-3">{displayTitle}</h2>
          <p className="text-[#6B6B6B] mb-6">{displayMessage}</p>
          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-bold rounded-xl shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </motion.button>
          )}
        </motion.div>
      </div>
    )
  }

  return null
}

export default ErrorMessage
