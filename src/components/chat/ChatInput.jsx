import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Camera, X } from 'lucide-react'

function ChatInput({ onSend, onImageUpload, disabled, placeholder = "Ask Pawsy anything..." }) {
  const [message, setMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
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
    if ((message.trim() || selectedImage) && !disabled) {
      if (selectedImage && onImageUpload) {
        onImageUpload(selectedImage, message.trim())
      } else if (message.trim()) {
        onSend(message.trim())
      }
      setMessage('')
      setSelectedImage(null)
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
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]
        setSelectedImage({
          file,
          preview: reader.result,
          base64Data: base64,
          mimeType: file.type,
          name: file.name,
        })
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className={`bg-gradient-to-br from-[#FFF9F5] to-[#FFF5ED] rounded-2xl border-2 border-[#F4A261]/20 focus-within:border-[#F4A261]/40 focus-within:shadow-[0_0_0_3px_rgba(244,162,97,0.1)] transition-all shadow-sm ${selectedImage ? 'p-3' : 'p-2'}`}>

        {/* Integrated image preview - inside the input container */}
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
                    alt="Selected"
                    className="h-16 w-16 object-cover rounded-lg border border-[#E8E8E8]"
                  />
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRemoveImage}
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
            className="flex-1 bg-transparent text-[#3D3D3D] placeholder:text-[#9E9E9E] resize-none outline-none py-2 px-2 text-sm leading-relaxed max-h-[120px]"
          />

          <div className="flex items-center gap-1">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Image upload button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handleImageClick}
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

            {/* Send button */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              disabled={(!message.trim() && !selectedImage) || disabled}
              className={`p-2 rounded-xl transition-all ${
                (message.trim() || selectedImage) && !disabled
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
