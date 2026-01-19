import { motion } from 'framer-motion'
import { Dog } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="inline-block"
        >
          <Dog className="w-24 h-24 text-amber-600 mx-auto" />
        </motion.div>
        <h1 className="mt-6 text-5xl font-bold text-amber-900">Pawsy</h1>
        <p className="mt-2 text-lg text-amber-700">Your dog's health companion</p>
      </motion.div>
    </div>
  )
}

export default App
