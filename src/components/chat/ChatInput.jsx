import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Mic } from 'lucide-react'

function ChatInput({ onSend, disabled, placeholder = "Ask Pawsy anything..." }) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [message])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-2 bg-white rounded-2xl border-2 border-[#E8E8E8] focus-within:border-[#7EC8C8] transition-colors p-2 shadow-sm">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-[#3D3D3D] placeholder:text-[#9E9E9E] resize-none outline-none py-2 px-2 text-sm leading-relaxed max-h-[120px]"
        />

        <div className="flex items-center gap-1">
          {/* Voice input - placeholder for future feature */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl text-[#9E9E9E] hover:text-[#7EC8C8] hover:bg-[#7EC8C8]/10 transition-colors disabled:opacity-50"
            disabled={disabled}
            aria-label="Voice input (coming soon)"
          >
            <Mic className="w-5 h-5" />
          </motion.button>

          {/* Send button */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            disabled={!message.trim() || disabled}
            className={`p-2 rounded-xl transition-all ${
              message.trim() && !disabled
                ? 'bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] text-white shadow-md'
                : 'bg-[#E8E8E8] text-[#9E9E9E]'
            }`}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </form>
  )
}

export default ChatInput
