import { motion } from 'framer-motion'
import { Dog, User, PawPrint } from 'lucide-react'

function ChatBubble({ message, dogPhoto, isFirstAssistantMessage, onQuickQuestion }) {
  const isUser = message.role === 'user'

  // Quick question suggestions for first assistant message
  const quickQuestions = [
    "My dog threw up",
    "Is this food safe?",
    "Check this photo",
    "Won't eat today",
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
        isUser
          ? 'bg-gradient-to-br from-[#F4A261] to-[#E8924F]'
          : 'bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3]'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : dogPhoto ? (
          <img src={dogPhoto} alt="Pawsy" className="w-full h-full rounded-full object-cover" />
        ) : (
          <PawPrint className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble and quick questions container */}
      <div className="flex flex-col gap-2 max-w-[80%]">
        {/* Bubble */}
        <div
          className={`rounded-3xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-br from-[#F4A261] to-[#E8924F] text-white rounded-tr-lg shadow-md'
              : 'bg-white text-[#3D3D3D] rounded-tl-lg shadow-[0_2px_12px_rgba(61,61,61,0.08)] border border-[#F4A261]/10'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <p className={`text-xs mt-2 ${isUser ? 'text-white/60' : 'text-[#9E9E9E]'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Quick question chips - only show after first assistant message */}
        {isFirstAssistantMessage && !isUser && onQuickQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 mt-1"
          >
            {quickQuestions.map((question, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onQuickQuestion(question)}
                className="px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-[#FFF5ED] to-[#FFE8D6] text-[#D4793A] rounded-full border border-[#F4A261]/20 hover:border-[#F4A261]/40 hover:shadow-sm transition-all"
              >
                {question}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default ChatBubble
