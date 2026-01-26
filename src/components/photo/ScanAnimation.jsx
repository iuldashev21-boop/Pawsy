import { motion } from 'framer-motion'
import { PawPrint } from 'lucide-react'

function ScanAnimation({ imageUrl }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-[#7EC8C8]/30 shadow-lg">
      {/* Image */}
      <img
        src={imageUrl}
        alt="Photo being analyzed for health concerns"
        className="w-full h-64 object-cover"
      />

      {/* Scan overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#7EC8C8]/20">
        {/* Scan line */}
        <motion.div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#7EC8C8] to-transparent shadow-[0_0_20px_rgba(126,200,200,0.8)]"
          initial={{ top: 0 }}
          animate={{ top: '100%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Corner brackets */}
        <div className="absolute inset-4">
          {/* Top left */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#7EC8C8] rounded-tl-lg" />
          {/* Top right */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#7EC8C8] rounded-tr-lg" />
          {/* Bottom left */}
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#7EC8C8] rounded-bl-lg" />
          {/* Bottom right */}
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#7EC8C8] rounded-br-lg" />
        </div>
      </div>

      {/* Status indicator */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center gap-2"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <motion.div
          animate={{ rotate: [0, -15, 15, -15, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.3 }}
        >
          <PawPrint className="w-4 h-4 text-[#7EC8C8]" />
        </motion.div>
        <span className="text-sm font-medium text-[#3D3D3D]">Analyzing...</span>
      </motion.div>
    </div>
  )
}

export default ScanAnimation
