import { useState, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, X, Image } from 'lucide-react'

function PhotoUploader({ onPhotoSelect, selectedPhoto, onClear }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      processFile(file)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target.result
      onPhotoSelect({
        file,
        preview: base64,
        base64Data: base64.split(',')[1],
        mimeType: file.type,
      })
    }
    reader.readAsDataURL(file)
  }

  if (selectedPhoto) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl overflow-hidden border-2 border-[#F4A261]/30 shadow-lg"
      >
        <img
          src={selectedPhoto.preview}
          alt="Selected photo"
          className="w-full h-64 object-cover"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClear}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
          aria-label="Remove photo"
        >
          <X className="w-5 h-5 text-[#3D3D3D]" />
        </motion.button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed transition-all ${
        isDragging
          ? 'border-[#F4A261] bg-[#F4A261]/10'
          : 'border-[#E8E8E8] bg-white/50'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="p-8 text-center">
        <motion.div
          animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC] flex items-center justify-center"
        >
          <Camera className="w-10 h-10 text-[#F4A261]" />
        </motion.div>

        <h3
          className="text-lg font-bold text-[#3D3D3D] mb-2"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Upload a Photo
        </h3>
        <p className="text-sm text-[#6B6B6B] mb-6">
          Take or upload a photo of your dog's concern area
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <Upload className="w-5 h-5" />
            Choose Photo
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#F4A261] font-semibold rounded-xl border-2 border-[#F4A261]/30 hover:border-[#F4A261]/50 transition-colors"
          >
            <Image className="w-5 h-5" />
            Take Photo
          </motion.button>
        </div>

        <p className="text-xs text-[#9E9E9E] mt-4">
          Supports JPG, PNG • Max 10MB
        </p>
      </div>

      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#F4A261]/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
          >
            <p className="text-lg font-semibold text-[#F4A261]">Drop photo here</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default memo(PhotoUploader)
