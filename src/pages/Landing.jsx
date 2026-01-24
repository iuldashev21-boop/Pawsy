import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Dog, MessageCircle, Camera, Heart, Shield, ChevronRight, Star, ChevronDown, Users, Clock, CreditCard, Lock, CheckCircle, ArrowRight } from 'lucide-react'
import PremiumIcon from '../components/common/PremiumIcon'

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

const testimonials = [
  {
    name: "Sarah M.",
    dog: "Max, Golden Retriever",
    text: "Pawsy helped me understand Max's symptoms at 2am when I was panicking. Turns out it wasn't serious, but having that peace of mind was priceless.",
    rating: 5
  },
  {
    name: "James K.",
    dog: "Luna, French Bulldog",
    text: "The photo analysis feature caught a skin issue I would have missed. My vet confirmed Pawsy's recommendation was spot on.",
    rating: 5
  },
  {
    name: "Maria L.",
    dog: "Cooper, Beagle",
    text: "Finally, a pet app that actually helps instead of just scaring you. Love having quick access to the toxic food checker.",
    rating: 5
  }
]

const faqs = [
  {
    q: "Is Pawsy a replacement for my veterinarian?",
    a: "No! Pawsy provides guidance and information, but always consult a vet for diagnosis and treatment. We help you understand when a vet visit is needed."
  },
  {
    q: "What's included in the free version?",
    a: "5 AI chats per day, 3 photo scans per day, unlimited access to symptom checker, toxic food database, emergency guides, and vet finder."
  },
  {
    q: "What does Premium add?",
    a: "Unlimited chats and scans, saved conversation history, detailed health tracking, breed-specific alerts, and priority support."
  },
  {
    q: "Is my data private?",
    a: "Yes. We never sell your data. Your dog's health information is encrypted and only used to provide personalized advice."
  },
  {
    q: "How accurate is the AI?",
    a: "Our AI is trained on veterinary knowledge and achieves high accuracy for common conditions. However, it's guidance, not diagnosis - always verify with a vet."
  }
]

function Landing() {
  const featuresRef = useRef(null)
  const [openFaq, setOpenFaq] = useState(null)

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
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

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 text-[#3D3D3D] font-medium hover:text-[#F4A261] transition-colors"
              >
                Sign In
              </motion.button>
            </Link>
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                Get Started
              </motion.button>
            </Link>
          </motion.div>
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
                <PremiumIcon size={16} />
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
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(244, 162, 97, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-xl shadow-lg text-lg flex items-center justify-center gap-2"
                  >
                    Start Free
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </Link>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToFeatures}
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
                  <PremiumIcon size={24} gradient={false} />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-white/50 border-y border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-5 h-5 text-[#F4A261]" />
                <span className="text-2xl font-bold text-[#3D3D3D]">10,000+</span>
              </div>
              <p className="text-sm text-[#6B6B6B]">Dogs helped</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star className="w-5 h-5 text-[#FFD54F] fill-[#FFD54F]" />
                <span className="text-2xl font-bold text-[#3D3D3D]">4.8</span>
              </div>
              <p className="text-sm text-[#6B6B6B]">App rating</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-[#7EC8C8]" />
                <span className="text-2xl font-bold text-[#3D3D3D]">24/7</span>
              </div>
              <p className="text-sm text-[#6B6B6B]">Available</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
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
              Get started in 3 simple steps
            </h2>
            <p className="text-[#6B6B6B] text-lg max-w-2xl mx-auto">
              From sign up to personalized advice in under 2 minutes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#F4A261] via-[#7EC8C8] to-[#81C784]" />

            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center relative"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#F4A261] to-[#E8924F] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                <Dog className="w-8 h-8 text-white" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#F4A261] font-bold text-sm border-2 border-[#F4A261] shadow-sm">
                1
              </div>
              <h3
                className="text-xl font-bold text-[#3D3D3D] mb-2 mt-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Add Your Dog
              </h3>
              <p className="text-[#6B6B6B]">
                Create a profile with breed, age, weight, and any health conditions
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center relative"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#7EC8C8] font-bold text-sm border-2 border-[#7EC8C8] shadow-sm">
                2
              </div>
              <h3
                className="text-xl font-bold text-[#3D3D3D] mb-2 mt-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Ask Pawsy
              </h3>
              <p className="text-[#6B6B6B]">
                Describe symptoms, share photos, or ask any health question
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center relative"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#81C784] to-[#66BB6A] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#81C784] font-bold text-sm border-2 border-[#81C784] shadow-sm">
                3
              </div>
              <h3
                className="text-xl font-bold text-[#3D3D3D] mb-2 mt-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Get Personalized Advice
              </h3>
              <p className="text-[#6B6B6B]">
                Receive guidance tailored to your dog's unique health profile
              </p>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-xl shadow-lg text-lg"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-12 px-4 bg-[#FDF8F3]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="w-12 h-12 bg-[#81C784]/20 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-[#81C784]" />
              </div>
              <p className="font-semibold text-[#3D3D3D] text-sm">Vet-Informed AI</p>
              <p className="text-xs text-[#6B6B6B] mt-1">Trained on veterinary knowledge</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="w-12 h-12 bg-[#7EC8C8]/20 rounded-full flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-[#7EC8C8]" />
              </div>
              <p className="font-semibold text-[#3D3D3D] text-sm">Privacy First</p>
              <p className="text-xs text-[#6B6B6B] mt-1">Your data stays on your device</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="w-12 h-12 bg-[#F4A261]/20 rounded-full flex items-center justify-center mb-3">
                <CreditCard className="w-6 h-6 text-[#F4A261]" />
              </div>
              <p className="font-semibold text-[#3D3D3D] text-sm">No Card Required</p>
              <p className="text-xs text-[#6B6B6B] mt-1">Start free, upgrade anytime</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="w-12 h-12 bg-[#EF5350]/20 rounded-full flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 text-[#EF5350]" />
              </div>
              <p className="font-semibold text-[#3D3D3D] text-sm">Made for Pet Parents</p>
              <p className="text-xs text-[#6B6B6B] mt-1">By dog lovers, for dog lovers</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 bg-white scroll-mt-20">
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

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-[#FDF8F3]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-4xl font-bold text-[#3D3D3D] mb-4"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Loved by pet parents
            </h2>
            <p className="text-[#6B6B6B] text-lg">
              See what dog owners are saying about Pawsy
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E8E8]"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#FFD54F] fill-[#FFD54F]" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[#4A4A4A] mb-4 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC] flex items-center justify-center">
                    <Dog className="w-5 h-5 text-[#F4A261]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#3D3D3D] text-sm">{testimonial.name}</p>
                    <p className="text-xs text-[#9E9E9E]">{testimonial.dog}</p>
                  </div>
                </div>
              </motion.div>
            ))}
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

            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-4 bg-white text-[#E8924F] font-bold rounded-xl shadow-lg text-lg"
              >
                Get Started — It's Free
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-4xl font-bold text-[#3D3D3D] mb-4"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Common questions
            </h2>
            <p className="text-[#6B6B6B] text-lg">
              Everything you need to know about Pawsy
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="border border-[#E8E8E8] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#FDF8F3] transition-colors"
                >
                  <span className="font-medium text-[#3D3D3D]">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === idx ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-[#9E9E9E]" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-[#6B6B6B]">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
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

          <p className="text-[#9E9E9E] text-sm flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-[#F4A261] fill-[#F4A261]" /> for pet parents everywhere
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
