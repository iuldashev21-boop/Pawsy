import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Camera, X } from 'lucide-react'

function ChatInput({ onSend, onImageUpload, disabled, placeholder = "Ask Pawsy anything..." }) {
  const [message, setMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const trimmed = message.trim()
  const hasContent = !!(trimmed || selectedImage)
  const canSend = hasContent && !disabled

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [message])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSend) return
    if (selectedImage && onImageUpload) {
      onImageUpload(selectedImage, trimmed)
    } else if (trimmed) {
      onSend(trimmed)
    }
    setMessage('')
    setSelectedImage(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage({
          file,
          preview: reader.result,
          base64Data: reader.result.split(',')[1],
          mimeType: file.type,
          name: file.name,
        })
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className={`bg-gradient-to-br from-[#FFF9F5] to-[#FFF5ED] rounded-2xl border-2 border-[#F4A261]/20 focus-within:border-[#F4A261]/40 focus-within:shadow-[0_0_0_3px_rgba(244,162,97,0.1)] transition-all shadow-sm ${selectedImage ? 'p-3' : 'p-2'}`}>

        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 pb-3 border-b border-[#F4A261]/20"
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <img
                    src={selectedImage.preview}
                    alt="Photo attached to message"
                    className="h-16 w-16 object-cover rounded-lg border border-[#E8E8E8]"
                  />
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#6B6B6B] text-white rounded-full flex items-center justify-center shadow-sm hover:bg-[#3D3D3D] transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#3D3D3D]">Photo attached</p>
                  <p className="text-xs text-[#9E9E9E] mt-0.5">Ready for analysis</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedImage ? "Describe what you'd like me to look at (optional)..." : placeholder}
            disabled={disabled}
            rows={1}
            autoComplete="off"
            aria-label="Message to Pawsy"
            className="flex-1 bg-transparent text-[#3D3D3D] placeholder:text-[#9E9E9E] resize-none outline-none py-2 px-2 text-sm leading-relaxed max-h-[120px]"
          />

          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${
                selectedImage
                  ? 'text-[#7EC8C8] bg-[#7EC8C8]/10'
                  : 'text-[#F4A261] hover:text-[#E8924F] hover:bg-[#F4A261]/10'
              }`}
              disabled={disabled}
              aria-label="Upload photo for analysis"
            >
              <Camera className="w-5 h-5" />
            </motion.button>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              disabled={!canSend}
              className={`p-2 rounded-xl transition-all ${
                canSend
                  ? 'bg-gradient-to-br from-[#F4A261] to-[#E8924F] text-white shadow-md hover:shadow-lg'
                  : 'bg-[#FFE8D6] text-[#D4793A]/40'
              }`}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default ChatInput
