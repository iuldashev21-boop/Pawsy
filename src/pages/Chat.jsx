import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import {
  ChevronLeft, ChevronDown, Dog, AlertCircle, Camera, Stethoscope, Info
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDog } from '../context/DogContext'
import { useUsage } from '../context/UsageContext'
import { useOnboarding } from '../context/OnboardingContext'
import { geminiService } from '../services/api/gemini'
import ChatBubble from '../components/chat/ChatBubble'
import ChatInput from '../components/chat/ChatInput'
import PawTypingIndicator from '../components/chat/PawTypingIndicator'
import BottomNav from '../components/layout/BottomNav'
import PawsyMascot from '../components/mascot/PawsyMascot'
import EmergencyOverlay from '../components/emergency/EmergencyOverlay'
import UsageCounter from '../components/usage/UsageCounter'
import UsageLimitModal from '../components/usage/UsageLimitModal'
import InlinePremiumHint from '../components/common/InlinePremiumHint'
import ErrorMessage from '../components/common/ErrorMessage'

// Welcome message for new conversations
function getWelcomeMessage(dogName) {
  const name = dogName || 'your dog'
  return `Hi! I'm Pawsy, your AI vet assistant. I'm here to help with any questions about ${name}'s health and wellbeing.\n\nI can help you understand symptoms, provide general care advice, and let you know when it's time to see a vet. You can also share photos if you'd like me to take a look at something.\n\nWhat can I help you with today?`
}

function Chat() {
  const { user } = useAuth()
  const { activeDog } = useDog()
  const {
    canChat,
    canEmergencyChat,
    useChat,
    useEmergencyChat,
    chatsRemaining,
    emergencyChatsRemaining,
  } = useUsage()
  const { completeStep, progress } = useOnboarding()
  const location = useLocation()

  // Session-based state (not persisted)
  const [messages, setMessages] = useState([])
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [isEmergencyMode, setIsEmergencyMode] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)
  const [suggestedAction, setSuggestedAction] = useState(null)
  const [emergencySteps, setEmergencySteps] = useState([])
  const [photoContext, setPhotoContext] = useState(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [calmMode, setCalmMode] = useState(false)
  const [showSessionBanner, setShowSessionBanner] = useState(true)
  const [showPremiumHint, setShowPremiumHint] = useState(true)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const hasInitialized = useRef(false)
  const hasProcessedPhotoContext = useRef(false)

  // Detect emergency state
  const isEmergency = suggestedAction === 'emergency' || emergencySteps.length > 0

  // Memoize dog context to avoid duplicate object creation
  const dogContext = useMemo(() => activeDog ? {
    name: activeDog.name,
    breed: activeDog.breed || 'unknown',
    age: activeDog.age,
    weight: activeDog.weight,
    sex: activeDog.sex,
    allergies: activeDog.allergies || [],
    conditions: activeDog.conditions || [],
  } : { name: 'your dog', breed: 'unknown' }, [activeDog])

  // Auto-activate calm mode when emergency detected
  useEffect(() => {
    if (isEmergency && !calmMode) {
      setCalmMode(true)
    }
  }, [isEmergency, calmMode])

  // Initialize with welcome message
  useEffect(() => {
    if (!hasInitialized.current && messages.length === 0) {
      hasInitialized.current = true
      setMessages([{
        id: crypto.randomUUID(),
        role: 'assistant',
        content: getWelcomeMessage(activeDog?.name),
        timestamp: new Date().toISOString(),
      }])
    }
  }, [activeDog])

  // Handle photo analysis context from PhotoAnalysis page
  useEffect(() => {
    const state = location.state
    if (state?.fromPhotoAnalysis && !hasProcessedPhotoContext.current) {
      // Mark as processed to prevent duplicate messages
      hasProcessedPhotoContext.current = true
      // Clear the location state
      window.history.replaceState({}, document.title)

      const { analysis, photo } = state

      setPhotoContext({
        detected_breed: analysis.detected_breed,
        body_area: analysis.body_area,
        urgency_level: analysis.urgency_level,
        possible_conditions: analysis.possible_conditions,
        visible_symptoms: analysis.visible_symptoms,
        summary: analysis.summary,
      })

      // Add context message
      const contextMessage = `I just analyzed a photo of your dog's ${analysis.body_area || 'health concern'}. ${analysis.summary}\n\nI'm here to answer any questions you have about this. What would you like to know?`

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: contextMessage,
        timestamp: new Date().toISOString(),
        image: photo ? { preview: photo.preview } : null,
        metadata: {
          fromPhotoAnalysis: true,
          photo_analysis: {
            urgency_level: analysis.urgency_level,
            visible_symptoms: analysis.visible_symptoms || [],
            possible_conditions: analysis.possible_conditions || [],
            recommended_actions: analysis.recommended_actions || [],
            should_see_vet: analysis.should_see_vet,
          },
        },
      }])

      if (analysis.urgency_level === 'emergency') {
        setSuggestedAction('emergency')
      } else if (analysis.urgency_level === 'urgent') {
        setSuggestedAction('see_vet')
      }
    }
  }, [location.state])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200)
  }

  const handleDismissEmergency = () => {
    setCalmMode(false)
  }

  const handleSendMessage = async (content) => {
    // Prevent duplicate submissions
    if (isTyping) return

    setError(null)
    setSuggestedAction(null)
    setEmergencySteps([])

    // Check usage limits
    if (!isEmergencyMode && !canChat) {
      setShowLimitModal(true)
      return
    }

    // Consume usage (regular or emergency)
    if (isEmergencyMode) {
      const allowed = useEmergencyChat()
      if (!allowed) {
        setShowLimitModal(true)
        return
      }
    } else {
      const allowed = useChat()
      if (!allowed) {
        setShowLimitModal(true)
        return
      }
    }

    // Mark first chat step complete
    if (!progress.firstChat) {
      completeStep('firstChat')
    }

    // Add user message
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])

    // Check if API is configured
    if (!geminiService.isConfigured()) {
      setIsTyping(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsTyping(false)

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I'd love to help you with that question! However, the Gemini API isn't configured yet.\n\nTo enable AI responses, add your API key to a .env file:\n\nVITE_GEMINI_API_KEY=your_api_key_here\n\nYou can get a free API key from Google AI Studio.`,
        timestamp: new Date().toISOString(),
      }])
      return
    }

    // Get AI response
    setIsTyping(true)
    try {
      const history = messages.slice(-10)
      const response = await geminiService.chat(dogContext, content, history, photoContext)

      if (response.error) {
        setError(response.message || 'Something went wrong. Please try again.')
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.message || "I'm sorry, I encountered an error. Please try again.",
          timestamp: new Date().toISOString(),
        }])
        return
      }

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        metadata: {
          follow_up_questions: response.follow_up_questions || [],
          quick_replies: response.quick_replies || [],
          urgency_level: response.urgency_level || 'low',
          visible_symptoms: response.symptoms_mentioned || [],
          possible_conditions: response.possible_conditions || [],
          recommended_actions: response.recommended_actions || [],
          should_see_vet: response.should_see_vet || false,
          emergency_steps: response.emergency_steps || [],
        },
      }])

      if (response.suggested_action && response.suggested_action !== 'continue_chat') {
        setSuggestedAction(response.suggested_action)
      }

      if (response.emergency_steps?.length > 0) {
        setEmergencySteps(response.emergency_steps)
      }

    } catch (err) {
      if (import.meta.env.DEV) console.error('Chat error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsTyping(false)
    }
  }

  const handleImageUpload = async (imageData, userDescription = '') => {
    // Prevent duplicate submissions
    if (isTyping) return
    setIsTyping(true)

    setError(null)
    setSuggestedAction(null)

    // Add user message with image
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'user',
      content: userDescription || 'Can you analyze this photo?',
      timestamp: new Date().toISOString(),
      image: {
        preview: imageData.preview,
        base64Data: imageData.base64Data,
        mimeType: imageData.mimeType,
      },
    }])

    if (!geminiService.isConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I can see you've shared a photo! However, the Gemini API isn't configured yet, so I can't analyze it.\n\nTo enable AI photo analysis, add your API key to a .env file.`,
        timestamp: new Date().toISOString(),
      }])
      setIsTyping(false)
      return
    }

    try {
      const response = await geminiService.analyzePhoto(
        imageData.base64Data,
        imageData.mimeType,
        dogContext,
        '',
        userDescription
      )

      if (response.error) {
        setError(response.message || 'Failed to analyze photo.')
        return
      }

      const formattedResponse = formatPhotoAnalysisForChat(response)

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: formattedResponse,
        timestamp: new Date().toISOString(),
        metadata: {
          photo_analysis: response,
          urgency_level: response.urgency_level,
          should_see_vet: response.should_see_vet,
        },
      }])

      if (response.urgency_level === 'emergency' || response.urgency_level === 'urgent') {
        setSuggestedAction('see_vet')
      }

    } catch (err) {
      if (import.meta.env.DEV) console.error('Photo analysis error:', err)
      setError('Failed to analyze photo. Please try again.')
    } finally {
      setIsTyping(false)
    }
  }

  const formatPhotoAnalysisForChat = (analysis) => {
    let message = analysis.summary || "Here's what I can see in the photo."

    if (analysis.visible_symptoms?.length > 0) {
      message += `\n\n**What I observe:** ${analysis.visible_symptoms.join(', ')}.`
    }

    if (analysis.possible_conditions?.length > 0) {
      message += `\n\n**Possible causes:** This could be ${analysis.possible_conditions.slice(0, 3).join(', ')}.`
    }

    if (analysis.recommended_actions?.length > 0) {
      message += `\n\n**Recommendations:**\n${analysis.recommended_actions.map(a => `• ${a}`).join('\n')}`
    }

    if (analysis.should_see_vet) {
      message += `\n\nI'd recommend consulting with your vet about this.`
    }

    return message
  }

  const handleQuickQuestion = (question) => {
    handleSendMessage(question)
  }

  const handleAction = (action) => {
    if (action === 'find_vet') {
      window.open('https://www.google.com/maps/search/veterinarian+near+me', '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#FFF5ED] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FDF8F3]/80 backdrop-blur-md border-b border-[#E8E8E8]/30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl hover:bg-[#F4A261]/10 transition-colors"
                aria-label="Back to dashboard"
              >
                <ChevronLeft className="w-5 h-5 text-[#3D3D3D]" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-2">
              <PawsyMascot
                mood={
                  suggestedAction === 'emergency' ? 'alert' :
                  suggestedAction === 'see_vet' ? 'concerned' :
                  isTyping ? 'thinking' : 'happy'
                }
                size={36}
              />
              <div>
                <h1 className="text-lg font-bold text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Pawsy
                </h1>
                <p className="text-xs text-[#6B6B6B]">AI Vet Assistant</p>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Dog Profile Card */}
      {activeDog && (
        <div className="bg-white/80 border-b border-[#E8E8E8]/30">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#F4A261]/30 bg-gradient-to-br from-[#FFE8D6] to-[#FFD0AC] flex-shrink-0">
                {activeDog.photoUrl ? (
                  <img src={activeDog.photoUrl} alt={activeDog.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Dog className="w-6 h-6 text-[#F4A261]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#3D3D3D]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {activeDog.name}
                  </h3>
                  <span className="text-xs text-[#9E9E9E]">•</span>
                  <span className="text-xs text-[#6B6B6B]">{activeDog.breed || 'Unknown breed'}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-[#6B6B6B]">
                  {activeDog.age && <span>{activeDog.age}</span>}
                  {activeDog.age && activeDog.weight && <span className="text-[#E8E8E8]">•</span>}
                  {activeDog.weight && <span>{activeDog.weight} {activeDog.weightUnit || 'lbs'}</span>}
                </div>
                {activeDog.allergies && activeDog.allergies.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-red-500 font-medium">Allergies:</span>
                    <div className="flex flex-wrap gap-1">
                      {activeDog.allergies.map((allergy, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Banner */}
      <AnimatePresence>
        {showSessionBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-[#FFF5ED] to-[#FFE8D6] border-b border-[#F4A261]/20"
          >
            <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#F4A261]" />
                <p className="text-xs text-[#4A4A4A]">
                  Free chat • Won't be saved after you leave
                </p>
              </div>
              <button
                onClick={() => setShowSessionBanner(false)}
                className="text-xs text-[#F4A261] font-medium hover:text-[#E8924F] transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Usage Counter */}
      {!isEmergencyMode && (
        <div className="max-w-lg mx-auto px-4 py-2">
          <UsageCounter
            type="chat"
            showUpgrade={true}
            onUpgrade={() => alert('Premium upgrade coming soon! For now, enjoy free features.')}
          />
        </div>
      )}

      {/* Emergency Mode Banner */}
      {isEmergencyMode && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-xs text-red-700 font-medium">
                Emergency Mode • {emergencyChatsRemaining} emergency chats remaining
              </p>
            </div>
            <button
              onClick={() => setIsEmergencyMode(false)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <main
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pb-44 overscroll-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
          {/* Emergency Overlay */}
          <EmergencyOverlay
            isActive={calmMode && isEmergency}
            emergencySteps={emergencySteps}
            dogName={activeDog?.name || 'your dog'}
            onDismiss={handleDismissEmergency}
          />

          {/* Messages */}
          {messages.map((message, index) => (
            <ChatBubble
              key={message.id}
              message={message}
              dogPhoto={null}
              isFirstAssistantMessage={index === 0}
              onQuickQuestion={handleQuickQuestion}
              onAction={handleAction}
              showTimestamp={index === 0}
            />
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && <PawTypingIndicator />}
          </AnimatePresence>

          {/* Premium hint after 2+ user messages */}
          <AnimatePresence>
            {showPremiumHint && !isTyping && messages.filter(m => m.role === 'user').length >= 2 && (
              <InlinePremiumHint
                variant="card"
                message={`Premium saves your conversations with ${activeDog?.name || 'your dog'} so you can reference them later.`}
                actionText="Save this chat"
                onAction={() => {
                  setShowPremiumHint(false)
                  alert('Premium upgrade coming soon! For now, enjoy free features.')
                }}
                dismissable={true}
                delay={0.5}
              />
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <ErrorMessage
              type="generic"
              message={error}
              onDismiss={() => setError(null)}
            />
          )}

          {/* Suggested Action Banner */}
          <AnimatePresence>
            {suggestedAction && suggestedAction !== 'continue_chat' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-xl p-4 ${
                  suggestedAction === 'emergency'
                    ? 'bg-red-50 border border-red-200'
                    : suggestedAction === 'see_vet'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-[#7EC8C8]/10 border border-[#7EC8C8]/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {suggestedAction === 'emergency' && (
                    <>
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-red-800">Emergency Care Needed</p>
                        <p className="text-sm text-red-700 mt-1">
                          Please seek emergency veterinary care immediately.
                        </p>
                        {emergencySteps.length > 0 && (
                          <div className="mt-3 p-3 bg-red-100/50 rounded-lg">
                            <p className="text-xs font-semibold text-red-800 mb-2">While getting to the vet:</p>
                            <ul className="space-y-1">
                              {emergencySteps.map((step, idx) => (
                                <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                                  <span className="font-bold text-red-800">{idx + 1}.</span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {suggestedAction === 'see_vet' && (
                    <>
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-amber-800">Vet Visit Recommended</p>
                        <p className="text-sm text-amber-700 mt-1">
                          I'd recommend having a veterinarian examine your dog for this concern.
                        </p>
                      </div>
                    </>
                  )}
                  {suggestedAction === 'upload_photo' && (
                    <>
                      <div className="w-10 h-10 rounded-full bg-[#7EC8C8]/20 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-[#5FB3B3]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#3D3D3D]">Photo Would Help</p>
                        <p className="text-sm text-[#6B6B6B] mt-1">
                          Sharing a photo would help me give you better advice.
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setSuggestedAction(null)}
                  className="mt-3 text-xs text-[#9E9E9E] hover:text-[#6B6B6B]"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Scroll to bottom FAB */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToBottom}
            className="fixed bottom-40 right-4 w-10 h-10 bg-gradient-to-br from-[#F4A261] to-[#E8924F] text-white rounded-full shadow-lg z-40 flex items-center justify-center"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="fixed bottom-[88px] left-0 right-0 bg-gradient-to-t from-[#FDF8F3] via-[#FDF8F3]/95 to-transparent pt-6 pb-2 px-4 z-30">
        <div className="max-w-lg mx-auto">
          <ChatInput
            onSend={handleSendMessage}
            onImageUpload={handleImageUpload}
            disabled={isTyping}
            placeholder={activeDog ? `Ask about ${activeDog.name}'s health...` : "Describe your dog's symptoms..."}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Usage Limit Modal */}
      <UsageLimitModal
        type="chat"
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onEmergency={() => {
          setShowLimitModal(false)
          setIsEmergencyMode(true)
        }}
        onUpgrade={() => alert('Premium upgrade coming soon! For now, enjoy free features.')}
        emergencyRemaining={emergencyChatsRemaining}
      />
    </div>
  )
}

export default Chat
