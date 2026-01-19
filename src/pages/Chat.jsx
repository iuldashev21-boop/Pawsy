import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, Plus, History, Dog, Sparkles,
  AlertCircle, MessageCircle
} from 'lucide-react'
import { useDog } from '../context/DogContext'
import { useChat } from '../context/ChatContext'
import { geminiService } from '../services/api/gemini'
import { buildSystemPrompt, getWelcomeMessage } from '../services/prompts/chatPrompts'
import ChatBubble from '../components/chat/ChatBubble'
import ChatInput from '../components/chat/ChatInput'
import PawTypingIndicator from '../components/chat/PawTypingIndicator'
import BottomNav from '../components/layout/BottomNav'

function Chat() {
  const { activeDog, dogs } = useDog()
  const {
    activeSession,
    createSession,
    addMessage,
    setActiveSession,
    getSessionsForDog,
    loading,
    setLoading,
  } = useChat()
  const navigate = useNavigate()

  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Redirect if no dogs
  useEffect(() => {
    if (dogs.length === 0) {
      navigate('/add-dog')
    }
  }, [dogs, navigate])

  // Create a new session if none exists for current dog
  useEffect(() => {
    if (activeDog && !activeSession) {
      const existingSessions = getSessionsForDog(activeDog.id)
      if (existingSessions.length > 0) {
        // Use the most recent session
        setActiveSession(existingSessions[existingSessions.length - 1].id)
      } else {
        // Create a new session with welcome message
        const session = createSession(activeDog.id, {
          name: activeDog.name,
          breed: activeDog.breed,
          age: activeDog.dateOfBirth,
          weight: activeDog.weight,
          allergies: activeDog.allergies || [],
        })
        // Add welcome message
        addMessage(session.id, {
          role: 'assistant',
          content: getWelcomeMessage(activeDog.name),
        })
      }
    }
  }, [activeDog, activeSession])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession?.messages, isTyping])

  const handleSendMessage = async (content) => {
    if (!activeSession || !activeDog) return

    setError(null)

    // Add user message
    addMessage(activeSession.id, {
      role: 'user',
      content,
    })

    // Check if API is configured
    if (!geminiService.isConfigured()) {
      // Add a mock response for demo purposes
      setIsTyping(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsTyping(false)

      addMessage(activeSession.id, {
        role: 'assistant',
        content: `I'd love to help you with that question about ${activeDog.name}! However, the Gemini API isn't configured yet.\n\nTo enable AI responses, add your API key to a .env file:\n\nVITE_GEMINI_API_KEY=your_api_key_here\n\nYou can get a free API key from Google AI Studio.`,
      })
      return
    }

    // Get AI response
    setIsTyping(true)
    try {
      const systemPrompt = buildSystemPrompt(activeDog, [])
      const history = activeSession.messages.slice(-10) // Last 10 messages for context

      const response = await geminiService.chat(systemPrompt, content, history)

      addMessage(activeSession.id, {
        role: 'assistant',
        content: response,
      })
    } catch (err) {
      console.error('Chat error:', err)
      setError('Something went wrong. Please try again.')
      addMessage(activeSession.id, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your message. Please try again, and if the issue persists, check your internet connection.",
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleNewChat = () => {
    if (!activeDog) return
    const session = createSession(activeDog.id, {
      name: activeDog.name,
      breed: activeDog.breed,
      age: activeDog.dateOfBirth,
      weight: activeDog.weight,
      allergies: activeDog.allergies || [],
    })
    addMessage(session.id, {
      role: 'assistant',
      content: getWelcomeMessage(activeDog.name),
    })
    setShowHistory(false)
  }

  const dogSessions = activeDog ? getSessionsForDog(activeDog.id) : []

  if (!activeDog) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="text-center">
          <Dog className="w-16 h-16 text-[#F4A261] mx-auto mb-4" />
          <p className="text-[#6B6B6B]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FDF8F3]/80 backdrop-blur-md border-b border-[#E8E8E8]/30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl hover:bg-[#F4A261]/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#3D3D3D]" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7EC8C8] to-[#5FB3B3] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1
                  className="text-lg font-bold text-[#3D3D3D]"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Pawsy
                </h1>
                <p className="text-xs text-[#6B6B6B]">AI Vet Assistant</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* History toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-xl transition-colors ${
                showHistory ? 'bg-[#7EC8C8]/20 text-[#7EC8C8]' : 'hover:bg-[#E8E8E8]/50 text-[#6B6B6B]'
              }`}
            >
              <History className="w-5 h-5" />
            </motion.button>

            {/* New chat */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNewChat}
              className="p-2 rounded-xl bg-[#7EC8C8]/10 text-[#7EC8C8] hover:bg-[#7EC8C8]/20 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Chat History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-[#E8E8E8]/50 overflow-hidden"
          >
            <div className="max-w-lg mx-auto px-4 py-3">
              <p className="text-xs font-medium text-[#6B6B6B] mb-2">Recent Conversations</p>
              {dogSessions.length === 0 ? (
                <p className="text-sm text-[#9E9E9E]">No previous conversations</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dogSessions.slice().reverse().map((session) => (
                    <motion.button
                      key={session.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveSession(session.id)
                        setShowHistory(false)
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-colors ${
                        session.id === activeSession?.id
                          ? 'bg-[#7EC8C8]/10 border border-[#7EC8C8]/30'
                          : 'bg-[#FDF8F3] hover:bg-[#F4A261]/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-[#7EC8C8]" />
                        <span className="text-sm font-medium text-[#3D3D3D] truncate">
                          {session.title}
                        </span>
                      </div>
                      <p className="text-xs text-[#9E9E9E] mt-1">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <main
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto pb-32"
      >
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
          {/* Dog context banner */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-[#F4A261]/20 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#F4A261]/30 bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC]">
                {activeDog.photoUrl ? (
                  <img
                    src={activeDog.photoUrl}
                    alt={activeDog.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Dog className="w-5 h-5 text-[#F4A261]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#3D3D3D]">
                  Chatting about {activeDog.name}
                </p>
                <p className="text-xs text-[#6B6B6B] truncate">
                  {activeDog.breed} {activeDog.weight ? `• ${activeDog.weight} ${activeDog.weightUnit}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          {activeSession?.messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              dogPhoto={null}
            />
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && <PawTypingIndicator />}
          </AnimatePresence>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl p-3"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-gradient-to-t from-[#FDF8F3] via-[#FDF8F3] to-transparent pt-4 pb-4 px-4">
        <div className="max-w-lg mx-auto">
          <ChatInput
            onSend={handleSendMessage}
            disabled={isTyping || loading}
            placeholder={`Ask about ${activeDog.name}...`}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

export default Chat
