import { Link } from 'react-router-dom'
import {
  MessageCircle,
  Camera,
  Dog,
  Search,
  FileText,
  Heart,
  AlertCircle
} from 'lucide-react'
import PawsyMascot from '../mascot/PawsyMascot'

/**
 * EmptyState - Friendly empty state displays
 *
 * Props:
 * - type: 'chat' | 'photo' | 'dogs' | 'search' | 'history' | 'generic'
 * - title: Custom title (optional)
 * - message: Custom message (optional)
 * - actionText: CTA button text (optional)
 * - actionLink: Link destination (optional)
 * - onAction: Click handler for action (optional)
 * - showMascot: Whether to show Pawsy mascot (default: true)
 */

const EMPTY_STATES = {
  chat: {
    icon: MessageCircle,
    iconColor: '#7EC8C8',
    title: 'Ready to chat!',
    message: "I'm all ears! Tell me what's on your mind about your furry friend.",
    actionText: 'Ask me anything',
    mascotMood: 'excited',
  },
  photo: {
    icon: Camera,
    iconColor: '#F4A261',
    title: 'Show me what you see',
    message: "Snap a photo of anything that has you worried. I'll take a closer look!",
    actionText: 'Upload a photo',
    mascotMood: 'listening',
  },
  dogs: {
    icon: Dog,
    iconColor: '#F4A261',
    title: "Let's meet your pup!",
    message: "Tell me about your dog so I can give you the best advice tailored just for them.",
    actionText: 'Add your dog',
    actionLink: '/add-dog',
    mascotMood: 'excited',
  },
  search: {
    icon: Search,
    iconColor: '#9E9E9E',
    title: 'Hmm, nothing here...',
    message: "I couldn't find what you're looking for. Try different keywords?",
    mascotMood: 'confused',
  },
  history: {
    icon: FileText,
    iconColor: '#7EC8C8',
    title: 'Fresh start!',
    message: "As you use Pawsy, your activity will show up here. Let's make some memories!",
    mascotMood: 'happy',
  },
  favorites: {
    icon: Heart,
    iconColor: '#EF5350',
    title: 'No favorites yet',
    message: 'Found something helpful? Save it here for quick access later!',
    mascotMood: 'happy',
  },
  error: {
    icon: AlertCircle,
    iconColor: '#EF5350',
    title: 'Oops! Something went wrong',
    message: "Don't worry, even the best dogs have off days. Let's try that again!",
    actionText: 'Try again',
    mascotMood: 'concerned',
  },
  generic: {
    icon: Dog,
    iconColor: '#F4A261',
    title: 'Nothing here yet',
    message: "This spot is empty for now, but stay tuned!",
    mascotMood: 'happy',
  },
}

function EmptyState({
  type = 'generic',
  title,
  message,
  actionText,
  actionLink,
  onAction,
  showMascot = true,
  className = '',
}) {
  const config = EMPTY_STATES[type] || EMPTY_STATES.generic
  const Icon = config.icon

  const displayTitle = title || config.title
  const displayMessage = message || config.message
  const displayActionText = actionText || config.actionText
  const displayActionLink = actionLink || config.actionLink
  const showAction = displayActionText || onAction

  const actionButton = showAction && (
    <button
      onClick={onAction}
      className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-shadow"
    >
      {displayActionText}
    </button>
  )

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {showMascot ? (
        <div className="mb-4">
          <PawsyMascot mood={config.mascotMood} size={64} />
        </div>
      ) : (
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${config.iconColor}15` }}
        >
          <Icon className="w-8 h-8" style={{ color: config.iconColor }} />
        </div>
      )}

      <h3
        className="text-lg font-bold text-[#3D3D3D] mb-2"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        {displayTitle}
      </h3>

      <p className="text-sm text-[#6B6B6B] max-w-xs mx-auto">
        {displayMessage}
      </p>

      {displayActionLink && !onAction
        ? <Link to={displayActionLink}>{actionButton}</Link>
        : actionButton}
    </div>
  )
}

export default EmptyState
