import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Dog, Mail, User, Lock, ArrowRight, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Brand icons as SVG components
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
)

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
}

function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Demo-friendly: just need name and email
    if (!name.trim() || !email.trim()) {
      setError('Please fill in name and email')
      return
    }

    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      signup(email.trim(), name.trim())
      navigate('/add-dog')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignup = async (provider) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      // Demo: create a mock user for social login
      signup(`demo@${provider}.com`, `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`)
      navigate('/add-dog')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div variants={fadeInUp} className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F4A261] to-[#E8924F] flex items-center justify-center shadow-md">
                <Dog className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Pawsy
              </span>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div variants={fadeInUp} className="mb-8">
            <h1
              className="text-3xl font-bold text-[#3D3D3D] mb-2"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Create your account
            </h1>
            <p className="text-[#6B6B6B]">
              Join thousands of pet parents who worry less
            </p>
          </motion.div>

          {/* Social Login Buttons */}
          <motion.div variants={fadeInUp} className="space-y-3 mb-6">
            <motion.button
              type="button"
              onClick={() => handleSocialSignup('google')}
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 bg-white border-2 border-[#E8E8E8] rounded-xl font-medium text-[#3D3D3D] flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-[#D0D0D0] transition-all disabled:opacity-70"
            >
              <GoogleIcon />
              Continue with Google
            </motion.button>

            <motion.button
              type="button"
              onClick={() => handleSocialSignup('apple')}
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 bg-black rounded-xl font-medium text-white flex items-center justify-center gap-3 hover:bg-gray-900 transition-all disabled:opacity-70"
            >
              <AppleIcon />
              Continue with Apple
            </motion.button>
          </motion.div>

          {/* Divider */}
          <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#E8E8E8]" />
            <span className="text-sm text-[#9E9E9E]">or continue with email</span>
            <div className="flex-1 h-px bg-[#E8E8E8]" />
          </motion.div>

          {/* Form */}
          <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-4">
            {/* Name field */}
            <div>
              <label className="block text-sm font-medium text-[#3D3D3D] mb-2">
                Your name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-[#E8E8E8] rounded-xl text-[#3D3D3D] placeholder:text-[#9E9E9E] focus:border-[#F4A261] focus:ring-2 focus:ring-[#F4A261]/20 transition-all duration-200 outline-none"
                  placeholder="What should we call you?"
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-[#3D3D3D] mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-[#E8E8E8] rounded-xl text-[#3D3D3D] placeholder:text-[#9E9E9E] focus:border-[#F4A261] focus:ring-2 focus:ring-[#F4A261]/20 transition-all duration-200 outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-[#3D3D3D] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-[#E8E8E8] rounded-xl text-[#3D3D3D] placeholder:text-[#9E9E9E] focus:border-[#F4A261] focus:ring-2 focus:ring-[#F4A261]/20 transition-all duration-200 outline-none"
                  placeholder="Create a password"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#EF5350] text-sm"
              >
                {error}
              </motion.p>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.99 }}
              className="w-full py-4 bg-gradient-to-r from-[#F4A261] to-[#E8924F] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Sign in link */}
          <motion.p variants={fadeInUp} className="mt-6 text-center text-[#6B6B6B]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#F4A261] font-medium hover:underline">
              Sign in
            </Link>
          </motion.p>

          {/* Terms */}
          <motion.p variants={fadeInUp} className="mt-6 text-center text-xs text-[#9E9E9E]">
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-[#6B6B6B]">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-[#6B6B6B]">Privacy Policy</a>
          </motion.p>
        </motion.div>
      </div>

      {/* Right side - Illustration (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#FFE8D6] via-[#FFD0AC] to-[#F4A261] items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center"
        >
          {/* Floating elements */}
          <div className="relative">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-48 h-48 mx-auto mb-8 rounded-full bg-white/90 flex items-center justify-center shadow-2xl"
            >
              <Dog className="w-24 h-24 text-[#F4A261]" />
            </motion.div>

            {/* Floating hearts */}
            <motion.div
              animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 right-8 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <Heart className="w-6 h-6 text-[#EF5350]" fill="#EF5350" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute bottom-4 left-8 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <Heart className="w-5 h-5 text-[#F4A261]" fill="#F4A261" />
            </motion.div>
          </div>

          <h2
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Welcome to the pack!
          </h2>
          <p className="text-white/90 text-lg max-w-sm mx-auto">
            Your journey to worry-free pet parenting starts here
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default SignUp
