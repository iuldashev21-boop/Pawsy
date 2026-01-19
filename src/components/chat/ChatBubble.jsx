import { motion } from 'framer-motion'
import { Dog, User } from 'lucide-react'

function ChatBubble({ message, dogPhoto }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser
          ? 'bg-gradient-to-br from-[#F4A261] to-[#E8924F]'
          : 'bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3]'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : dogPhoto ? (
          <img src={dogPhoto} alt="Pawsy" className="w-full h-full rounded-full object-cover" />
        ) : (
          <Dog className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-br from-[#F4A261] to-[#E8924F] text-white rounded-tr-sm'
            : 'bg-white border border-[#E8E8E8] text-[#3D3D3D] rounded-tl-sm shadow-sm'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-white/70' : 'text-[#9E9E9E]'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  )
}

export default ChatBubble
