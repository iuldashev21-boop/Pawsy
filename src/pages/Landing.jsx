import { motion } from 'framer-motion'
import { Dog, MessageCircle, Camera, Heart, Shield, Sparkles, ChevronRight } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
}

const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

function Landing() {
  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FDF8F3]/80 backdrop-blur-md border-b border-[#F4A261]/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F4A261] to-[#E8924F] flex items-center justify-center shadow-md">
              <Dog className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Pawsy
            </span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            Get Started
          </motion.button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="text-center lg:text-left"
            >
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#7EC8C8]/20 rounded-full text-[#489999] text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4" />
                AI-Powered Pet Health Assistant
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#3D3D3D] leading-tight mb-6"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Peace of mind for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4A261] to-[#E8924F]">
                  worried pet parents
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="text-lg text-[#6B6B6B] mb-8 max-w-lg mx-auto lg:mx-0"
              >
                Your AI vet assistant that knows your dog's health history.
                Get personalized advice instantly — because every symptom matters when you love them this much.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(244, 162, 97, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-xl shadow-lg text-lg flex items-center justify-center gap-2"
                >
                  Start Free
                  <ChevronRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white text-[#3D3D3D] font-semibold rounded-xl border-2 border-[#E8E8E8] hover:border-[#F4A261] transition-colors text-lg"
                >
                  See How It Works
                </motion.button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="mt-10 flex items-center gap-6 justify-center lg:justify-start text-sm text-[#6B6B6B]"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#81C784]" />
                  <span>Vet-informed AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#F4A261]" />
                  <span>Built with love</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Hero illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#F4A261]/20 via-[#FFE8D6]/30 to-[#7EC8C8]/20 rounded-3xl blur-3xl" />

              {/* Main card */}
              <motion.div
                variants={floatAnimation}
                animate="animate"
                className="relative bg-white rounded-3xl p-8 shadow-xl border border-[#F4A261]/10"
              >
                {/* Dog avatar */}
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC] flex items-center justify-center border-4 border-white shadow-lg">
                  <Dog className="w-16 h-16 text-[#F4A261]" />
                </div>

                {/* Chat preview */}
                <div className="space-y-4">
                  <div className="bg-[#FDF8F3] rounded-2xl rounded-tl-sm p-4 max-w-[80%]">
                    <p className="text-[#3D3D3D] text-sm">My dog threw up this morning and seems tired...</p>
                  </div>

                  <div className="bg-gradient-to-r from-[#7EC8C8] to-[#5FB3B3] rounded-2xl rounded-tr-sm p-4 max-w-[80%] ml-auto">
                    <p className="text-white text-sm">
                      I understand your concern! Since Luna is a Golden Retriever with no food allergies, let's check a few things...
                    </p>
                  </div>
                </div>

                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-[#81C784] rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Heart className="w-6 h-6 text-white" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 5, 0], rotate: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-[#FFD54F] rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="text-3xl md:text-4xl font-bold text-[#3D3D3D] mb-4"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Everything your pup needs
            </h2>
            <p className="text-[#6B6B6B] text-lg max-w-2xl mx-auto">
              Three powerful features designed for anxious pet parents who want the best for their furry friends.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Dog Profile */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-[#FDF8F3] rounded-2xl p-8 border border-[#F4A261]/10"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#F4A261] to-[#E8924F] rounded-xl flex items-center justify-center mb-6 shadow-md">
                <Dog className="w-7 h-7 text-white" />
              </div>
              <h3
                className="text-xl font-bold text-[#3D3D3D] mb-3"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Dog Profile
              </h3>
              <p className="text-[#6B6B6B]">
                Store your dog's complete health history — breed, age, weight, allergies, and medications — all in one place.
              </p>
            </motion.div>

            {/* Feature 2: AI Chat */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="bg-[#FDF8F3] rounded-2xl p-8 border border-[#7EC8C8]/20"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] rounded-xl flex items-center justify-center mb-6 shadow-md">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h3
                className="text-xl font-bold text-[#3D3D3D] mb-3"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                AI Vet Chat
              </h3>
              <p className="text-[#6B6B6B]">
                Describe symptoms and get personalized advice that considers your dog's unique health profile and history.
              </p>
            </motion.div>

            {/* Feature 3: Photo Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="bg-[#FDF8F3] rounded-2xl p-8 border border-[#81C784]/20"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#81C784] to-[#66BB6A] rounded-xl flex items-center justify-center mb-6 shadow-md">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <h3
                className="text-xl font-bold text-[#3D3D3D] mb-3"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Photo Analysis
              </h3>
              <p className="text-[#6B6B6B]">
                Snap a photo of a rash, wound, or anything unusual. Our AI analyzes it with your dog's health context.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-[#F4A261] to-[#E8924F] rounded-3xl p-12 text-center relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <Dog className="w-16 h-16 text-white/90 mx-auto mb-6" />
            </motion.div>

            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Ready to worry less?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of pet parents who sleep better knowing Pawsy has their back.
            </p>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 bg-white text-[#E8924F] font-bold rounded-xl shadow-lg text-lg"
            >
              Get Started — It's Free
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F4A261] to-[#E8924F] flex items-center justify-center">
              <Dog className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Pawsy
            </span>
          </div>

          <p className="text-[#9E9E9E] text-sm">
            Made with 🧡 for pet parents everywhere
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
