import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import PawsyIcon from '../components/common/PawsyIcon'
import { useDog } from '../context/DogContext'
import { useChat } from '../context/ChatContext'
import { GoogleIcon, AppleIcon } from '../components/auth/SocialIcons'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const shouldReduceMotion = useReducedMotion()
  const { login } = useAuth()
  const { reloadForCurrentUser: reloadDogs } = useDog()
  const { reloadForCurrentUser: reloadChats } = useChat()
  const navigate = useNavigate()

  async function handleAuth(authFn, successPath) {
    setIsLoading(true)
    setError('')
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      authFn()
      // These might fail on mobile, don't let them block login
      try { reloadDogs() } catch { /* ignore */ }
      try { reloadChats() } catch { /* ignore */ }
      navigate(successPath)
    } catch (err) {
      console.error('Auth error:', err)
      if (err.message === 'User not found') {
        setError('No account found with this email. Please sign up first.')
      } else {
        setError(`Something went wrong: ${err.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    handleAuth(() => login(email.trim()), '/dashboard')
  }

  function handleSocialLogin(provider) {
    handleAuth(() => login(`demo@${provider}.com`, true), '/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="w-full max-w-md"
        >
          <motion.div variants={fadeInUp} className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <PawsyIcon size={48} className="shadow-md rounded-full" />
              <span className="text-2xl font-bold text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Pawsy
              </span>
            </Link>
          </motion.div>

          <motion.div variants={fadeInUp} className="mb-8">
            <h1 className="text-3xl font-bold text-[#3D3D3D] mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Welcome back
            </h1>
            <p className="text-[#6B6B6B]">Sign in to continue to Pawsy</p>
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-3 mb-6">
            <motion.button
              type="button"
              onClick={() => handleSocialLogin('google')}
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
              onClick={() => handleSocialLogin('apple')}
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 bg-black rounded-xl font-medium text-white flex items-center justify-center gap-3 hover:bg-gray-900 transition-all disabled:opacity-70"
            >
              <AppleIcon />
              Continue with Apple
            </motion.button>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#E8E8E8]" />
            <span className="text-sm text-[#9E9E9E]">or continue with email</span>
            <div className="flex-1 h-px bg-[#E8E8E8]" />
          </motion.div>

          <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-[#3D3D3D] mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-[#E8E8E8] rounded-xl text-[#3D3D3D] placeholder:text-[#9E9E9E] focus:border-[#F4A261] focus:ring-2 focus:ring-[#F4A261]/20 transition-all duration-200 outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="block text-sm font-medium text-[#3D3D3D]">Password</label>
                <a href="#" className="text-sm text-[#F4A261] hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-[#E8E8E8] rounded-xl text-[#3D3D3D] placeholder:text-[#9E9E9E] focus:border-[#F4A261] focus:ring-2 focus:ring-[#F4A261]/20 transition-all duration-200 outline-none"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[#EF5350] text-sm">
                {error}
              </motion.p>
            )}

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
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.p variants={fadeInUp} className="mt-6 text-center text-[#6B6B6B]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#F4A261] font-medium hover:underline">Sign up</Link>
          </motion.p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#7EC8C8] via-[#5FB3B3] to-[#489999] items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-48 h-48 mx-auto mb-8 rounded-full bg-white/90 flex items-center justify-center shadow-2xl"
            >
              <PawsyIcon size={120} />
            </motion.div>

            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, -10, 0], x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 right-8 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <Heart className="w-6 h-6 text-[#F4A261]" fill="#F4A261" />
            </motion.div>

            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, 10, 0], x: [0, -5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute bottom-4 left-8 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <Heart className="w-5 h-5 text-[#EF5350]" fill="#EF5350" />
            </motion.div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Good to see you!
          </h2>
          <p className="text-white/90 text-lg max-w-sm mx-auto">Your furry friend missed you</p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
