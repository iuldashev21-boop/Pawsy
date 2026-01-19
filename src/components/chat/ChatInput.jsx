import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Mic, Camera } from 'lucide-react'

function ChatInput({ onSend, onImageUpload, disabled, placeholder = "Ask Pawsy anything..." }) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

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

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && onImageUpload) {
      onImageUpload(file)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-2 bg-gradient-to-br from-[#FFF9F5] to-[#FFF5ED] rounded-2xl border-2 border-[#F4A261]/20 focus-within:border-[#F4A261]/40 focus-within:shadow-[0_0_0_3px_rgba(244,162,97,0.1)] transition-all p-2 shadow-sm">
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
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Image upload button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleImageClick}
            className="p-2 rounded-xl text-[#F4A261] hover:text-[#E8924F] hover:bg-[#F4A261]/10 transition-colors disabled:opacity-50"
            disabled={disabled}
            aria-label="Upload photo for analysis"
          >
            <Camera className="w-5 h-5" />
          </motion.button>

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
                ? 'bg-gradient-to-br from-[#F4A261] to-[#E8924F] text-white shadow-md hover:shadow-lg'
                : 'bg-[#FFE8D6] text-[#D4793A]/40'
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
